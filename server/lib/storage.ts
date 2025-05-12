import { LLMProviderType } from './llm';

export interface PromptData {
  id: string;
  prompt: string;
  language: string;
  response: string;
  timestamp: Date;
  userId?: string | null;
  llmProvider?: LLMProviderType;
} 