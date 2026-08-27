import dotenv from 'dotenv';

dotenv.config();

export type LLMProvider = 'gemini' | 'openai' | 'claude' | 'ollama' | 'groq' | 'openrouter';

export interface LLMConfig {
  provider: LLMProvider;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
}

export interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  onChunk?: (text: string) => void;
}

export const DEFAULT_MODELS: Record<LLMProvider, string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  claude: 'claude-3-5-sonnet-latest',
  ollama: 'llama3.2',
  groq: 'llama-3.3-70b-versatile',
  openrouter: 'google/gemini-2.5-flash',
};

export function detectProvider(): { provider: LLMProvider; apiKey?: string; baseUrl?: string } | null {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    return {
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL,
    };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'claude',
      apiKey: process.env.ANTHROPIC_API_KEY,
    };
  }
  if (process.env.GROQ_API_KEY) {
    return {
      provider: 'groq',
      apiKey: process.env.GROQ_API_KEY,
    };
  }
  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
    };
  }
  if (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL) {
    return {
      provider: 'ollama',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    };
  }
  return null;
}

export class LLMClient {
  private config: LLMConfig;

  constructor(config?: Partial<LLMConfig>) {
    const detected = detectProvider();
    const provider = config?.provider || detected?.provider || 'gemini';
    const apiKey =
      config?.apiKey ||
      detected?.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      '';

    const baseUrl =
      config?.baseUrl ||
      detected?.baseUrl ||
      (provider === 'ollama' ? 'http://localhost:11434' : undefined);

    const model = config?.model || DEFAULT_MODELS[provider];

    this.config = {
      provider,
      model,
      apiKey,
      baseUrl,
      temperature: config?.temperature ?? 0.2,
    };
  }

  public getConfig(): LLMConfig {
    return { ...this.config };
  }

  public async generate(options: GenerateOptions): Promise<string> {
    const { provider } = this.config;

    switch (provider) {
      case 'gemini':
        return this.callGemini(options);
      case 'openai':
      case 'groq':
      case 'openrouter':
        return this.callOpenAICompatible(options);
      case 'claude':
        return this.callClaude(options);
      case 'ollama':
        return this.callOllama(options);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  private async callGemini(options: GenerateOptions): Promise<string> {
    const apiKey = this.config.apiKey;
    if (!apiKey) {
      throw new Error(
        'Missing Gemini API key. Set GEMINI_API_KEY in your .env file or environment, or pass it via --api-key.'
      );
    }

    const model = this.config.model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      systemInstruction: {
        parts: [{ text: options.systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: options.userPrompt }],
        },
      ],
      generationConfig: {
        temperature: this.config.temperature,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';

    if (!text) {
      throw new Error('Gemini API returned an empty response.');
    }

    return text;
  }

  private async callOpenAICompatible(options: GenerateOptions): Promise<string> {
    const apiKey = this.config.apiKey;
    const provider = this.config.provider;

    if (!apiKey && provider !== 'ollama') {
      throw new Error(
        `Missing API key for ${provider}. Set ${provider.toUpperCase()}_API_KEY in your .env or environment.`
      );
    }

    let baseUrl = this.config.baseUrl;
    if (!baseUrl) {
      if (provider === 'groq') baseUrl = 'https://api.groq.com/openai/v1';
      else if (provider === 'openrouter') baseUrl = 'https://openrouter.ai/api/v1';
      else baseUrl = 'https://api.openai.com/v1';
    }

    const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
    const model = this.config.model || DEFAULT_MODELS[provider];

    const body = {
      model,
      temperature: this.config.temperature,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://github.com/ats-resume';
      headers['X-Title'] = 'ATS Resume Checker';
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${provider} API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';

    if (!text) {
      throw new Error(`${provider} returned an empty response.`);
    }

    return text;
  }

  private async callClaude(options: GenerateOptions): Promise<string> {
    const apiKey = this.config.apiKey;
    if (!apiKey) {
      throw new Error('Missing Anthropic API key. Set ANTHROPIC_API_KEY in your .env file or environment.');
    }

    const url = 'https://api.anthropic.com/v1/messages';
    const model = this.config.model || 'claude-3-5-sonnet-latest';

    const body = {
      model,
      max_tokens: 4096,
      temperature: this.config.temperature,
      system: options.systemPrompt,
      messages: [{ role: 'user', content: options.userPrompt }],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Claude API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const text = data.content?.map((c: { text?: string }) => c.text || '').join('') || '';

    if (!text) {
      throw new Error('Claude API returned an empty response.');
    }

    return text;
  }

  private async callOllama(options: GenerateOptions): Promise<string> {
    const baseUrl = this.config.baseUrl || 'http://localhost:11434';
    const model = this.config.model || 'llama3.2';
    const url = `${baseUrl.replace(/\/+$/, '')}/api/chat`;

    const body = {
      model,
      stream: false,
      options: {
        temperature: this.config.temperature,
      },
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ollama error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      return data.message?.content || '';
    } catch (err: unknown) {
      if ((err as Error)?.message?.includes('ECONNREFUSED')) {
        throw new Error(
          `Unable to connect to Ollama at ${baseUrl}. Ensure Ollama is installed and running ('ollama serve').`
        );
      }
      throw err;
    }
  }
}
