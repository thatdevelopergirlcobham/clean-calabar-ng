const GEMINI_API_KEY = "AIzaSyCu4ZdjhjTS0D4ed-_jJms34wIxe6QdleU";

// We will try these models in order until one works
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"];

if (!GEMINI_API_KEY) {
  console.warn("Warning: VITE_GEMINI_API_KEY is not set. AI features will run in simulation mode.");
}

export interface AIInsight {
  type:
  | "eco_tip"
  | "contextual_insight"
  | "event_suggestion"
  | "template_suggestion"
  | "kpi_interpretation";
  content: string;
  confidence?: number;
}

export interface EcoBotRequest {
  context:
  | "report_review"
  | "report_creation"
  | "event_planning"
  | "kpi_analysis"
  | "general";
  userInput?: string;
  reportData?: {
    title: string;
    description: string;
    location: { lat: number; lng: number };
    imageUrl?: string;
  };
  kpiData?: {
    totalReports: number;
    resolvedReports: number;
    averageResolutionTime: number;
  };
}

class AIApiService {

  async testGemini(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured.");
    }

    let lastError: Error | null = null;

    for (const model of GEMINI_MODELS) {
      try {
        console.log(`🤖 Trying AI model: ${model}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Model ${model} failed (${response.status}): ${errText}`);
          throw new Error(`Model ${model} error: ${response.statusText}`);
        }

        const data = await response.json();
        const result = (
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          data?.candidates?.[0]?.output ||
          data?.text ||
          ""
        ).toString().trim();

        if (result) {
          console.log(`✅ AI Success with ${model}`);
          return result;
        }

      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ Model ${model} failed, trying next...`);
      }
    }

    console.error("All AI models failed.");
    throw lastError || new Error("All AI models failed to respond.");
  }

  async chatWithCleanCalBot(userMessage: string, mode: 'normal' | 'upcycle' = 'normal'): Promise<string> {
    if (!GEMINI_API_KEY) {
      return this.getSimulatedResponse(userMessage, mode);
    }

    let systemPrompt = '';
    if (mode === 'upcycle') {
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

    const prompt = `${systemPrompt}\n\nUser message: ${userMessage}\n\nProvide a helpful response in 2-3 sentences.`;

    try {
      return await this.testGemini(prompt);
    } catch (error) {
      console.error('Error in chatWithCleanCalBot:', error);
      return this.getSimulatedResponse(userMessage, mode);
    }
  }

  getSimulatedResponse(userMessage: string, mode: 'normal' | 'upcycle'): string {
    console.log("Using simulated response fallback.");
    const lowerMsg = userMessage.toLowerCase();

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

  async generateAnalyticsReport(reports: any[]): Promise<string> {
    if (!GEMINI_API_KEY) {
      return "Based on the recent reports, we see a high concentration of waste issues in Calabar South. Plastic waste seems to be the most common issue reported this week. We recommend targeting this area for the next community cleanup.";
    }

    const totalReports = reports.length;
    const byStatus = reports.reduce((acc: any, r: any) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
    const bySeverity = reports.reduce((acc: any, r: any) => { acc[r.severity] = (acc[r.severity] || 0) + 1; return acc; }, {});
    const locations = reports.map((r: any) => r.locationText || 'Unknown').slice(0, 10);

    const prompt = `
You are an AI Data Analyst for CleanCal. Analyze the following waste report data for Calabar, Nigeria.

Data Summary:
- Total Reports: ${totalReports}
- Status Breakdown: ${JSON.stringify(byStatus)}
- Severity Breakdown: ${JSON.stringify(bySeverity)}
- Recent Locations: ${locations.join(', ')}

Please provide a concise analytical rundown.
1. Identify the most critical areas or trends.
2. Suggest specific actions for waste management authorities.
3. Highlight any positive or negative patterns.

Keep it professional and insightful.
`;

    try {
      return await this.testGemini(prompt);
    } catch (error) {
      console.error('Error generating analytics:', error);
      return "Unable to generate analytics report at this time.";
    }
  }

  async getReportInsights(reportData: EcoBotRequest["reportData"]): Promise<AIInsight[]> {
    if (!GEMINI_API_KEY) {
      return [{
        type: "eco_tip",
        content: "Based on the location and description, this area might benefit from more frequent waste collection. Consider organizing a community cleanup event.",
        confidence: 0.85
      }];
    }
    const prompt = `
Analyze this waste report and provide 2 actionable insights.

Title: ${reportData?.title}
Description: ${reportData?.description}
Location: ${reportData?.location.lat}, ${reportData?.location.lng}

Return your advice in 2–3 short paragraphs.`;

    try {
      const text = await this.testGemini(prompt);
      return [{ type: "eco_tip", content: text, confidence: 0.9 }];
    } catch (e) {
      return [{ type: "eco_tip", content: "Could not generate insights.", confidence: 0 }];
    }
  }
}

export const aiApi = new AIApiService();