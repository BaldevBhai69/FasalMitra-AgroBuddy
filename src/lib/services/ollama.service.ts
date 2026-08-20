import { logger } from '@/lib/utils/logger';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaModelInfo {
  name: string;
  size?: number;
  digest?: string;
  modified_at?: string;
}

export interface OllamaStatusResponse {
  isAvailable: boolean;
  baseUrl: string;
  currentModel: string;
  availableModels: string[];
  latencyMs?: number;
}

export class OllamaService {
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    this.defaultModel = process.env.OLLAMA_MODEL || 'llama3.1:8b';
  }

  /**
   * Fast probe to verify if local Ollama daemon is running on localhost:11434
   */
  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get full status of local Ollama instance including installed models
   */
  async getStatus(): Promise<OllamaStatusResponse> {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          isAvailable: false,
          baseUrl: this.baseUrl,
          currentModel: this.defaultModel,
          availableModels: [],
        };
      }

      const data = await res.json();
      const latencyMs = Date.now() - startTime;
      const modelsList: string[] = (data.models || []).map((m: OllamaModelInfo) => m.name);

      // Auto-detect if a llama3.1 variant is installed
      let activeModel = this.defaultModel;
      const matchingLlama = modelsList.find(
        (m) =>
          m === 'llama3.1:8b' ||
          m === 'llama3.1' ||
          m === 'llama3.1:latest' ||
          m.startsWith('llama3.1') ||
          m.startsWith('llama3')
      );
      if (matchingLlama) {
        activeModel = matchingLlama;
      } else if (modelsList.length > 0) {
        activeModel = modelsList[0];
      }

      return {
        isAvailable: true,
        baseUrl: this.baseUrl,
        currentModel: activeModel,
        availableModels: modelsList,
        latencyMs,
      };
    } catch {
      return {
        isAvailable: false,
        baseUrl: this.baseUrl,
        currentModel: this.defaultModel,
        availableModels: [],
      };
    }
  }

  /**
   * Chat completion with Llama 3.1 8B supporting structured JSON formatting
   */
  async chat(
    messages: OllamaMessage[],
    model?: string,
    requireJson: boolean = true
  ): Promise<{ text: string; model: string; durationMs: number }> {
    const selectedModel = model || this.defaultModel;
    const startTime = Date.now();

    try {
      const payload: Record<string, unknown> = {
        model: selectedModel,
        messages,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          num_ctx: 4096,
        },
      };

      if (requireJson) {
        payload.format = 'json';
      }

      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Ollama daemon returned HTTP ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      const durationMs = Date.now() - startTime;

      return {
        text: data.message?.content || '',
        model: data.model || selectedModel,
        durationMs,
      };
    } catch (err) {
      logger.error('Ollama local Llama 3.1 inference failed', err, {
        baseUrl: this.baseUrl,
        model: selectedModel,
      });
      throw err;
    }
  }
}

export const ollamaService = new OllamaService();
