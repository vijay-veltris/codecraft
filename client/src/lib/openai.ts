import { apiRequest } from "@/lib/queryClient";

export interface CodePrompt {
  prompt: string;
  language?: string;
  includeComments?: boolean;
}

export interface CodeSnippet {
  id: string;
  filename: string;
  code: string;
  language: string;
}

export interface GenerateCodeResponse {
  success: boolean;
  snippets: CodeSnippet[];
  promptId?: string;
  message?: string;
}

export async function generateCode(promptData: CodePrompt): Promise<GenerateCodeResponse> {
  try {
    const response = await apiRequest("POST", "/api/generate", promptData);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating code:", error);
    throw error;
  }
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
