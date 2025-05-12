import OpenAI from 'openai';
import { z } from 'zod';

export const LLMProvider = z.enum([
  'openai',
  'codellama',
  'phind-codellama',
  'wizardcoder'
]);

export type LLMProviderType = z.infer<typeof LLMProvider>;

export interface LLMConfig {
  provider: LLMProviderType;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMService {
  generateCode(prompt: string, language: string): Promise<LLMResponse>;
}

class OpenAIService implements LLMService {
  private client: OpenAI;

  constructor(config: LLMConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseUrl,
    });
  }

  async generateCode(prompt: string, language: string): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert programmer. Generate code in ${language}. Provide only the code without any explanations.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return {
      content: response.choices[0].message.content || '',
      usage: response.usage
    };
  }
}

class CodeLlamaService implements LLMService {
  private baseUrl: string;
  private apiKey?: string;
  private model: string;

  constructor(config: LLMConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434'; // Default Ollama URL
    this.apiKey = config.apiKey;
    this.model = config.model || 'codellama';
  }

  async generateCode(prompt: string, language: string): Promise<LLMResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({
        model: this.model,
        prompt: `Generate ${language} code for: ${prompt}`,
        stream: false
      })
    });

    const data = await response.json();
    return {
      content: data.response || '',
      usage: {
        prompt_tokens: data.prompt_eval_count || 0,
        completion_tokens: data.eval_count || 0,
        total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      }
    };
  }
}

class PhindCodeLlamaService extends CodeLlamaService {
  constructor(config: LLMConfig) {
    super({
      ...config,
      model: 'phind-codellama'
    });
  }
}

class WizardCoderService extends CodeLlamaService {
  constructor(config: LLMConfig) {
    super({
      ...config,
      model: 'wizardcoder'
    });
  }
}

export function createLLMService(config: LLMConfig): LLMService {
  switch (config.provider) {
    case 'openai':
      return new OpenAIService(config);
    case 'codellama':
      return new CodeLlamaService(config);
    case 'phind-codellama':
      return new PhindCodeLlamaService(config);
    case 'wizardcoder':
      return new WizardCoderService(config);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
} 