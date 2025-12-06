import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Trash2, ArrowRight } from 'lucide-react'
import { MOCK_CLEANERS } from '../../data/mockCleaners'
import type { BookingRequest } from '../../types/booking'
import { saveBookingToStorage, estimatePrice } from '../../utils/bookingFlow'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  showBookingButton?: boolean
}

const AIChatBot: React.FC = () => {
  const navigate = useNavigate()
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const toggleAIChat = () => setIsAIChatOpen(prev => !prev)
  const [aiMode, setAIMode] = useState<'normal' | 'upcycle' | 'hire'>('normal')
  const [bookingData, setBookingData] = useState<Partial<BookingRequest>>({})
  
  const getGreeting = (mode: 'normal' | 'upcycle' | 'hire'): Message => ({
    id: `bot-greeting-${Date.now()}`,
    type: 'bot',
    content: mode === 'normal'
      ? "Hello! I'm CleanCal Bot. I can help you with waste management, recycling tips, and keeping our community clean!"
      : mode === 'upcycle'
      ? "Hello! I'm your Upcycling Expert. I can help you turn waste into beautiful and useful items. Tell me what materials you have!"
      : "Hello! I'm your Cleaner Finder. Let me help you book a cleaning service or waste pickup. What do you need?\n\n• House cleaning\n• Office cleaning\n• Waste pickup\n• Or just browse services",
    timestamp: new Date(),
  })

  const [messages, setMessages] = useState<Message[]>([getGreeting('normal')])
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handleOpenChat = (e: CustomEvent) => {
      const { mode } = e.detail;
      if (mode && ['normal', 'upcycle', 'hire'].includes(mode)) {
        setAIMode(mode);
        setMessages([getGreeting(mode)]);
        setIsAIChatOpen(true);
        setBookingData({});
      }
    };

    window.addEventListener('openAIChatInMode', handleOpenChat as EventListener);
    return () => {
      window.removeEventListener('openAIChatInMode', handleOpenChat as EventListener);
    };
  }, [])

  const processHireMode = async (userMsg: string): Promise<Message> => {
    const lowerMsg = userMsg.toLowerCase();
    
    // Step 1: Determine service type
    if (!bookingData.serviceType) {
      if (lowerMsg.includes('clean') && !lowerMsg.includes('waste')) {
        const newData = { ...bookingData, serviceType: 'cleaning' as const };
        setBookingData(newData);
        return {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: "Great! I'll help you book a cleaning service. 🧹\n\nWhere do you need the cleaning? (Please provide your address or area in Calabar)",
          timestamp: new Date(),
        };
      } else if (lowerMsg.includes('waste') || lowerMsg.includes('pickup') || lowerMsg.includes('trash')) {
        const newData = { ...bookingData, serviceType: 'waste_pickup' as const };
        setBookingData(newData);
        return {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: "Perfect! I'll help you schedule a waste pickup. 🚛\n\nWhere should we pick up the waste? (Please provide your address or area in Calabar)",
          timestamp: new Date(),
        };
      } else if (lowerMsg.includes('browse') || lowerMsg.includes('show') || lowerMsg.includes('list')) {
        const topCleaners = [...MOCK_CLEANERS].sort((a, b) => b.rating - a.rating).slice(0, 3);
        return {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: `Here are our top-rated services:\n\n${topCleaners.map(c => 
            `⭐ ${c.name} - ${c.rating}/5.0\n${c.specialties.join(', ')}\n${c.priceRange}`
          ).join('\n\n')}\n\nWould you like to book one of these services?`,
          timestamp: new Date(),
        };
      }
      return {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: "I can help you with:\n• House/Office cleaning 🧹\n• Waste pickup 🚛\n\nWhich service do you need?",
        timestamp: new Date(),
      };
    }

    // Step 2: Get location
    if (!bookingData.location) {
      const newData = { ...bookingData, location: userMsg };
      setBookingData(newData);
      return {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: `Got it! ${userMsg}\n\nWhen do you need this service? (Please provide a date, e.g., "tomorrow", "Dec 10", or "next Monday")`,
        timestamp: new Date(),
      };
    }

    // Step 3: Get date
    if (!bookingData.date) {
      const newData = { ...bookingData, date: userMsg };
      setBookingData(newData);
      
      if (bookingData.serviceType === 'cleaning') {
        return {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: "What's the size of the space?\n• Small (Studio/1 Bedroom)\n• Medium (2-3 Bedrooms)\n• Large (4+ Bedrooms/Office)",
          timestamp: new Date(),
        };
      } else {
        return {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: "How much waste do you have?\n• Small bin (Household)\n• Large bin (Commercial)\n• Truck load (Construction/Bulk)",
          timestamp: new Date(),
        };
      }
    }

    // Step 4: Get size details
    if (bookingData.serviceType === 'cleaning' && !bookingData.spaceSize) {
      let size: 'small' | 'medium' | 'large' = 'medium';
      if (lowerMsg.includes('small') || lowerMsg.includes('studio')) size = 'small';
      else if (lowerMsg.includes('large') || lowerMsg.includes('office')) size = 'large';
      
      const newData = { ...bookingData, spaceSize: size };
      setBookingData(newData);
      return {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: "Is this urgent or can we schedule it normally?\n• Urgent (ASAP - 30% extra fee)\n• Standard (Scheduled time)",
        timestamp: new Date(),
      };
    }

    if (bookingData.serviceType === 'waste_pickup' && !bookingData.wasteSize) {
      let size: 'small_bin' | 'large_bin' | 'truck_load' = 'small_bin';
      if (lowerMsg.includes('large') || lowerMsg.includes('commercial')) size = 'large_bin';
      else if (lowerMsg.includes('truck') || lowerMsg.includes('bulk')) size = 'truck_load';
      
      const newData = { ...bookingData, wasteSize: size };
      setBookingData(newData);
      return {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: "Is this urgent or can we schedule it normally?\n• Urgent (ASAP - 30% extra fee)\n• Standard (Scheduled time)",
        timestamp: new Date(),
      };
    }

    // Step 5: Get urgency
    if (!bookingData.urgency) {
      const urgent = lowerMsg.includes('urgent') || lowerMsg.includes('asap') || lowerMsg.includes('now');
      const newData = { ...bookingData, urgency: urgent ? 'urgent' as const : 'standard' as const };
      setBookingData(newData);
      return {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: "Please provide a brief description of what you need done.",
        timestamp: new Date(),
      };
    }

    // Step 6: Get description
    if (!bookingData.description) {
      const newData = { ...bookingData, description: userMsg };
      setBookingData(newData);
      return {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: "Great! Now I need your contact information.\n\nWhat's your full name?",
        timestamp: new Date(),
      };
    }

    // Step 7: Get name
    if (!bookingData.contactName) {
      const newData = { ...bookingData, contactName: userMsg };
      setBookingData(newData);
      return {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: "Thanks! What's your phone number?",
        timestamp: new Date(),
      };
    }

    // Step 8: Get phone
    if (!bookingData.contactPhone) {
      const newData = { ...bookingData, contactPhone: userMsg };
      setBookingData(newData);
      return {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: "Last one - what's your email address?",
        timestamp: new Date(),
      };
    }

    // Step 9: Get email and complete
    if (!bookingData.contactEmail) {
      const finalData = { ...bookingData, contactEmail: userMsg };
      setBookingData(finalData);
      
      // Save to localStorage
      saveBookingToStorage(finalData);
      
      const price = estimatePrice(finalData);
      
      return {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: `Perfect! Here's your booking summary:\n\n📍 Location: ${finalData.location}\n📅 Date: ${finalData.date}\n${finalData.serviceType === 'cleaning' ? '🧹' : '🚛'} Service: ${finalData.serviceType === 'cleaning' ? 'Cleaning' : 'Waste Pickup'}\n💰 Estimated Price: ${price}\n\n👤 ${finalData.contactName}\n📞 ${finalData.contactPhone}\n📧 ${finalData.contactEmail}\n\nClick the button below to proceed to payment!`,
        timestamp: new Date(),
        showBookingButton: true,
      };
    }

    return {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content: "I'm not sure what you mean. Can you rephrase that?",
      timestamp: new Date(),
    };
  };

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
    setIsLoading(true)

    try {
      let botMessage: Message;

      if (aiMode === 'hire') {
        botMessage = await processHireMode(userMessage.content);
      } else {
        // Simple responses for other modes
        await new Promise(resolve => setTimeout(resolve, 800));
        const lowerMsg = userMessage.content.toLowerCase();
        
        let content = "I'm here to help! Ask me about waste management, recycling, or upcycling.";
        
        if (aiMode === 'upcycle') {
          if (lowerMsg.includes('bottle')) content = "Plastic bottles can be turned into beautiful planters or bird feeders! Cut the top off, decorate it, and add soil and plants. 🌱";
          else if (lowerMsg.includes('paper')) content = "Old newspapers can be used for papier-mâché bowls or woven baskets. It's a fun and creative project! 📰";
          else content = "Tell me what material you have (plastic, glass, fabric, cardboard) and I'll give you creative upcycling ideas! ♻️";
        } else {
          if (lowerMsg.includes('recycle')) content = "Recycling is great! In Calabar, you can recycle plastics, glass, and paper. Make sure to clean items before recycling. ♻️";
          else if (lowerMsg.includes('waste')) content = "Proper waste disposal keeps our community clean. Use designated bins and consider composting organic waste. 🗑️";
        }

        botMessage = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content,
          timestamp: new Date(),
        };
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)
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
    setBookingData({})
  }

  const handleProceedToBooking = () => {
    navigate('/community/booking-confirmation')
    setIsAIChatOpen(false)
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
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm">CleanCal Bot</h3>
            <p className="text-xs text-gray-500">
              {aiMode === 'hire' ? 'Cleaner Finder 🧹' : aiMode === 'upcycle' ? 'Upcycling Expert 🎨' : 'Waste Assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <select
            value={aiMode}
            onChange={(e) => {
              const newMode = e.target.value as 'normal' | 'upcycle' | 'hire';
              setAIMode(newMode);
              setMessages([getGreeting(newMode)]);
              setBookingData({});
            }}
            className="text-xs border border-gray-300 rounded px-1 py-1 mr-2 focus:outline-none focus:border-primary"
          >
            <option value="normal">Assistant</option>
            <option value="upcycle">Upcycle</option>
            <option value="hire">Hire Cleaners</option>
          </select>

          <button onClick={clearChat} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Clear chat">
            <Trash2 className="w-5 h-5" />
          </button>
          <button onClick={() => setIsExpanded(v => !v)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title={isExpanded ? 'Minimize' : 'Expand'}>
            {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button onClick={toggleAIChat} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-xs ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${message.type === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                {message.type === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>
              <div>
                <div className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${message.type === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {message.content}
                </div>
                {message.showBookingButton && (
                  <button
                    onClick={handleProceedToBooking}
                    className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm flex items-center justify-center gap-2"
                  >
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

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

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={aiMode === 'hire' ? "Type your answer..." : aiMode === 'upcycle' ? "Ask about upcycling..." : "Ask CleanCal Bot..."}
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
