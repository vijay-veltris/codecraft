import { apiRequest } from "@/lib/queryClient";
import type { LLMProvider } from '../components/llm-selector';

export interface CodePrompt {
  prompt: string;
  language: string;
  llmProvider: LLMProvider;
  llmConfig?: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  };
}

export interface CodeSnippet {
  id: string;
  filename?: string;
  content: string;
  code?: string;
  language: string;
  llmProvider: LLMProvider;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GenerateCodeResponse {
  success: boolean;
  snippets: CodeSnippet[];
  promptId?: string;
  message?: string;
}

export interface GenerateReactProjectResponse {
  success: boolean;
  message: string;
  path: string;
}

export async function generateCode(prompt: CodePrompt): Promise<GenerateCodeResponse> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prompt),
  });

  const result = await response.json();
  console.log('Generate API Response:', result);

  if (!result.success) {
    console.error('Generate API Error:', result.error);
    throw new Error(result.error || 'Failed to generate code');
  }

  console.log('Returning response:', result);
  return result;
}

export async function fetchHistory() {
  try {
    const response = await apiRequest("GET", "/api/history");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
}

export async function connectGitProvider(provider: string, token: string) {
  try {
    const response = await apiRequest("POST", "/api/connect", { provider, token });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error connecting git provider:", error);
    throw error;
  }
}

export async function fetchUserProfile() {
  try {
    const response = await apiRequest("GET", "/api/user");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export async function generateReactProject(name: string, description?: string, author?: string): Promise<GenerateReactProjectResponse> {
  try {
    const response = await apiRequest("POST", "/api/generate/react", { name, description, author });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating React project:", error);
    throw error;
  }
}
