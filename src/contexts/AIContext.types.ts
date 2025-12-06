import type { AIInsight, EcoBotRequest } from '../api/ai';
import { createContext } from 'react';

export type AIMode = 'normal' | 'upcycle';

export interface AIContextType {
  isAIChatOpen: boolean;
  currentInsights: AIInsight[];
  isLoading: boolean;
  error: string | null;
  aiMode: AIMode;
  setAIMode: (mode: AIMode) => void;
  toggleAIChat: () => void;
  openAIChat: () => void;
  closeAIChat: () => void;
  getInsights: (request: EcoBotRequest) => Promise<void>;
  clearInsights: () => void;
  sendMessage: (message: string) => Promise<void>;
  getChatHistory: () => Promise<Array<{ role: 'user' | 'assistant'; content: string; created_at: string }>>;
}

export const AIContext = createContext<AIContextType | undefined>(undefined);