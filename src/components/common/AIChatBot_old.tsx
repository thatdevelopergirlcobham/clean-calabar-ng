import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Trash2, ExternalLink } from 'lucide-react'
import { MOCK_CLEANERS } from '../../data/mockCleaners'
import { BookingRequest } from '../../types/booking'
import { saveBookingToStorage, matchCleanerToRequest, estimatePrice } from '../../utils/bookingFlow'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  action?: 'proceed_to_booking'
}

const GEMINI_API_KEY = "AIzaSyDiCW5ZyTYoU8vrV6Irnb3lkxF5-acwiGA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

async function testGemini(prompt: string): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured.");
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini error:", response.status, errText);
      return `⚠️ Gemini API error (${response.status}): ${response.statusText}`;
    }

    const data = await response.json();

    const result = (
      data?.candidates?.[0]?.output ||
      data?.candidates?.[0]?.outputText ||
      data?.candidates?.[0]?.content?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.text ||
      data?.output ||
      "No response text returned."
    ).toString().trim();
    console.log("Gemini success:", result);
    return result;
  } catch (error) {
    const err = error as Error;
    console.error("Gemini fetch error:", err);

    if (err.message.includes('API key')) {
      return "⚠️ API Key Error: Please check your Gemini API key in the environment variables.";
    }
    if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
      return "⚠️ Network Error: Please check your internet connection.";
    }
    if (err.message.includes('quota')) {
      return "⚠️ API Quota Exceeded: Your Gemini API quota has been exceeded. Please check your Google Cloud Console.";
    }
    return `⚠️ API Error: ${err.message}`;
  }
}

async function chatWithCleanCalBot(
  userMessage: string, 
  mode: 'normal' | 'upcycle' | 'hire' = 'normal',
  bookingData: Partial<BookingRequest> = {},
  bookingStep: string = 'initial',
  setBookingData?: (data: Partial<BookingRequest>) => void,
  setBookingStep?: (step: any) => void
): Promise<{ response: string; action?: string }> {
  if (!GEMINI_API_KEY) {
    // Simulation mode
    console.log("Simulating AI response (No API Key)");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    const lowerMsg = userMessage.toLowerCase();

    if (mode === 'hire') {
      // Cleaner finder mode
      if (lowerMsg.includes('cleaning') || lowerMsg.includes('clean')) {
        const cleaners = MOCK_CLEANERS.filter(c => 
          c.specialties.some(s => s.toLowerCase().includes('clean'))
        );
        return `I found ${cleaners.length} cleaning services for you:\n\n${cleaners.map(c => 
          `🧹 ${c.name}\n⭐ ${c.rating} (${c.reviews} reviews)\n💰 ${c.priceRange}\n📞 ${c.phone}\n✅ ${c.availability}`
        ).join('\n\n')}`;
      }
      
      if (lowerMsg.includes('waste') || lowerMsg.includes('pickup') || lowerMsg.includes('trash')) {
        const cleaners = MOCK_CLEANERS.filter(c => 
          c.specialties.some(s => s.toLowerCase().includes('waste') || s.toLowerCase().includes('pickup'))
        );
        return `I found waste pickup services:\n\n${cleaners.map(c => 
          `🚛 ${c.name}\n⭐ ${c.rating} (${c.reviews} reviews)\n💰 ${c.priceRange}\n📞 ${c.phone}\n✅ ${c.availability}`
        ).join('\n\n')}`;
      }

      if (lowerMsg.includes('best') || lowerMsg.includes('top') || lowerMsg.includes('recommend')) {
        const topCleaners = [...MOCK_CLEANERS].sort((a, b) => b.rating - a.rating).slice(0, 3);
        return `Here are the top-rated services:\n\n${topCleaners.map(c => 
          `⭐ ${c.name} - ${c.rating}/5.0\n${c.specialties.join(', ')}\n💰 ${c.priceRange}\n📞 ${c.phone}`
        ).join('\n\n')}`;
      }

      if (lowerMsg.includes('cheap') || lowerMsg.includes('affordable') || lowerMsg.includes('budget')) {
        return `For budget-friendly options, I recommend:\n\n🧹 Calabar Clean Team\n💰 ₦5,000 - ₦15,000\n⭐ 4.8/5 (127 reviews)\n📞 +234 803 123 4567\n\nThey offer great value with excellent service!`;
      }

      if (lowerMsg.includes('urgent') || lowerMsg.includes('today') || lowerMsg.includes('now')) {
        const available = MOCK_CLEANERS.filter(c => c.availability.includes('Today') || c.availability.includes('24/7'));
        return `Available right now:\n\n${available.map(c => 
          `✅ ${c.name}\n⭐ ${c.rating}/5\n📞 ${c.phone}\n${c.availability}`
        ).join('\n\n')}`;
      }

      return "I can help you find cleaners! Try asking:\n• 'Show me cleaning services'\n• 'I need waste pickup'\n• 'Who's available today?'\n• 'Best rated cleaners'\n• 'Affordable options'";
    }

    if (mode === 'upcycle') {
      if (lowerMsg.includes('bottle')) return "Plastic bottles can be turned into beautiful planters or bird feeders! Would you like a step-by-step guide?";
      if (lowerMsg.includes('paper')) return "Old newspapers can be used for papier-mâché bowls or woven baskets. It's a fun project!";
      return "I love turning trash into treasure! Tell me what material you have (like plastic, glass, or fabric), and I'll give you an upcycling idea.";
    }

    if (lowerMsg.includes('recycle') || lowerMsg.includes('recycling')) {
      return "Recycling is a great way to reduce waste! In Calabar, you can recycle plastics, glass, and paper. Make sure to clean your recyclables before sorting them.";
    }
    if (lowerMsg.includes('waste') || lowerMsg.includes('trash')) {
      return "Proper waste disposal helps keep our community clean. Please use designated bins and consider composting organic waste.";
    }
    if (lowerMsg.includes('report')) {
      return "You can report waste issues directly through this app. Just click the 'Report Issue' button and provide the details.";
    }
    return "I'm CleanCal Bot, here to help you with waste management. You can ask me about recycling, reporting issues, or keeping Calabar clean!";
  }

  let systemPrompt = '';
  if (mode === 'hire') {
    const cleanersList = MOCK_CLEANERS.map(c => 
      `${c.name}: ${c.rating}⭐ (${c.reviews} reviews), ${c.specialties.join(', ')}, ${c.priceRange}, ${c.availability}, Phone: ${c.phone}, Experience: ${c.experience}`
    ).join('\n');
    
    systemPrompt = `
You are CleanCal Bot's Cleaner Finder Assistant for Calabar, Nigeria.
Your goal is to help users find the perfect cleaning service or waste pickup based on their needs.

Available Services:
${cleanersList}

When users ask about cleaners:
- Recommend based on their needs (cleaning type, budget, urgency, ratings)
- Format responses clearly with emojis (🧹 for cleaning, 🚛 for waste, ⭐ for ratings, 💰 for price, 📞 for phone)
- Be helpful and conversational
- If they ask about availability, pricing, or specialties, provide specific details
- Suggest they can call the service directly to book
`;
  } else if (mode === 'upcycle') {
    systemPrompt = `
You are CleanCal Bot's Upcycling Expert.
Your goal is to help users turn their waste materials (trash) into useful or beautiful items (treasure).
When a user mentions a material (e.g., plastic bottles, old tires, cardboard), suggest creative DIY upcycling projects.
Provide step-by-step instructions if asked.
Be enthusiastic, creative, and encouraging.
`;
  } else {
    systemPrompt = `
You are CleanCal Bot, an AI assistant for a waste management app in Calabar, Nigeria called CleanCal.
Your role is to help users with waste management, recycling, and environmental questions.
Be direct and provide practical advice without any greeting or introduction.
`;
  }

  const prompt = `
${systemPrompt}

User message: ${userMessage}

Provide a helpful response in 2-3 sentences.`;

  try {
    return await testGemini(prompt);
  } catch (error) {
    console.error('Error in chatWithCleanCalBot:', error);
    return "⚠️ Sorry, I'm having trouble connecting to the AI service. Please try again later.";
  }
}

const AIChatBot: React.FC = () => {
  const navigate = useNavigate()
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const toggleAIChat = () => setIsAIChatOpen(prev => !prev)
  const [aiMode, setAIMode] = useState<'normal' | 'upcycle' | 'hire'>('normal')
  const [bookingData, setBookingData] = useState<Partial<BookingRequest>>({})
  const [bookingStep, setBookingStep] = useState<'initial' | 'service_type' | 'location' | 'date' | 'details' | 'contact' | 'complete'>('initial')
  
  const getGreeting = (mode: 'normal' | 'upcycle' | 'hire'): Message => ({
    id: `bot-greeting-${Date.now()}`,
    type: 'bot',
    content: mode === 'normal'
      ? "Hello there! I am CleanCal Bot. I'm here to help you with waste management, recycling tips, and keeping our community clean. You can ask me anything about these topics!"
      : mode === 'upcycle'
      ? "Hello there! I am your Upcycling Expert. I can help you turn your waste into beautiful and useful items. Tell me what materials you have, and I'll give you some creative ideas!"
      : "Hello! I'm your Cleaner Finder. I can help you find the perfect cleaning service or waste pickup in Calabar. Tell me what you need - cleaning service, waste pickup, or ask about specific cleaners!",
    timestamp: new Date(),
  })

  const [messages, setMessages] = useState<Message[]>([getGreeting('normal')])
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Listen for custom event to open chat in specific mode
  useEffect(() => {
    const handleOpenChat = (e: CustomEvent) => {
      const { mode } = e.detail;
      if (mode && ['normal', 'upcycle', 'hire'].includes(mode)) {
        setAIMode(mode);
        setMessages([getGreeting(mode)]);
        setIsAIChatOpen(true);
      }
    };

    window.addEventListener('openAIChatInMode', handleOpenChat as EventListener);
    return () => {
      window.removeEventListener('openAIChatInMode', handleOpenChat as EventListener);
    };
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Send to AI
    setIsLoading(true)
    try {
      const response = await chatWithCleanCalBot(userMessage.content, aiMode)
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const clearChat = () => {
    setMessages([getGreeting(aiMode)])
  }

  if (!isAIChatOpen) {
    return (
      <button
        onClick={toggleAIChat}
        className="fixed bottom-20 md:bottom-4 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center z-40"
        aria-label="Open CleanCal Bot Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-20 md:bottom-4 right-4 ${isExpanded ? 'w-[28rem] md:h-[36rem]' : 'w-96 md:h-[32rem]'} max-h-[calc(100vh-7rem)] bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col z-40`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm">CleanCal Bot</h3>
            <p className="text-xs text-gray-500">
              {aiMode === 'hire' ? 'Cleaner Finder 🧹' : aiMode === 'upcycle' ? 'Upcycling Expert 🎨' : 'Waste Management Assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Mode Switcher */}
          <select
            value={aiMode}
            onChange={(e) => {
              const newMode = e.target.value as 'normal' | 'upcycle' | 'hire';
              setAIMode(newMode);
              setMessages([getGreeting(newMode)]);
            }}
            className="text-xs border border-gray-300 rounded px-1 py-1 mr-2 focus:outline-none focus:border-primary"
          >
            <option value="normal">Assistant</option>
            <option value="upcycle">Upcycle</option>
            <option value="hire">Hire Cleaners</option>
          </select>

          <button
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsExpanded(v => !v)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleAIChat}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Hi! I'm CleanCal Bot.</p>
            <p className="text-xs text-gray-400 mt-1">
              {aiMode === 'hire'
                ? "I can help you find cleaners and waste pickup services in Calabar!"
                : aiMode === 'upcycle'
                ? "I can help you turn trash into treasure! Ask me for upcycling ideas."
                : "Ask me about recycling tips, waste sorting, or community events!"}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-xs ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                  }`}>
                  {message.type === 'user' ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl text-sm ${message.type === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <Bot className="w-3 h-3" />
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={aiMode === 'hire' ? "Find cleaners or waste pickup..." : aiMode === 'upcycle' ? "Ask about upcycling ideas..." : "Ask CleanCal Bot..."}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '80px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default AIChatBot