import { OllamaModel } from '../types';

export class OllamaService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async getAvailableModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json() as { models?: OllamaModel[] };
      return data.models || [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [
        {
          name: 'deepseek-r1:14b',
          size: 14000000000,
          digest: 'default',
          modified_at: new Date().toISOString()
        }
      ];
    }
  }

  async generateCompletion(model: string, prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as { response?: string };
      return data.response || '';
    } catch (error) {
      console.error('Error generating completion:', error);
      throw new Error('Failed to generate completion from Ollama');
    }
  }
}