import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

export interface ExtractedIntent {
  brands: string[];
  models: string[];
  bodyType: string | null;
  fuelType: string | null;
  transmission: string | null;
  condition: string | null;
  minBudget: number | null;
  maxBudget: number | null;
  action: 'recommend' | 'compare' | 'detail' | 'general';
}

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly client: Groq | null;
  private readonly mainModel = 'llama-3.3-70b-versatile';
  private readonly fastModel = 'llama-3.1-8b-instant';
  private readonly fallbackModel = 'llama3-70b-8192';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (apiKey) {
      this.client = new Groq({ apiKey });
    } else {
      this.logger.warn('GROQ_API_KEY is not set.');
      this.client = null;
    }
  }

  /**
   * Step 1: Extract structured search intent from user message.
   * Uses a fast small model — cheap and instant.
   */
  async extractIntent(
    userMessage: string,
    chatHistory: Array<{ role: string; content: string }>,
  ): Promise<ExtractedIntent> {
    if (!this.client) {
      return {
        brands: [], models: [], bodyType: null, fuelType: null,
        transmission: null, condition: null, minBudget: null, maxBudget: null,
        action: 'general',
      };
    }

    const systemPrompt = `Extract car search filters from the conversation. Return ONLY valid JSON, no markdown.

Schema:
{
  "brands": string[],     // e.g. ["BMW", "Audi"] — empty if not mentioned
  "models": string[],     // e.g. ["X1", "X2", "Golf"] — empty if not mentioned
  "bodyType": string|null, // "suv"|"sedan"|"hatchback"|"pickup"|"minivan"|"wagon"|"coupe"|null
  "fuelType": string|null, // "petrol"|"diesel"|"electric"|"hybrid"|null
  "transmission": string|null, // "manual"|"automatic"|null
  "condition": string|null, // "new"|"used"|null
  "minBudget": number|null, // minimum budget in local currency
  "maxBudget": number|null, // maximum budget in local currency
  "action": string        // "recommend"|"compare"|"detail"|"general"
}

Rules:
- Extract from the FULL conversation, not just the last message
- **ONLY include brands/models the user EXPLICITLY mentioned by name.** If user says "SUVs under 100k" without naming a brand, brands and models must be empty arrays. NEVER guess or add brands the user didn't say.
- If user says "around 90000", set minBudget=70000 maxBudget=110000
- If user says "under 50000", set maxBudget=50000
- Normalize brand names: "bmw"→"BMW", "mercedes"→"Mercedes-Benz", "vw"→"Volkswagen"
- action=compare when user asks to compare/difference between cars
- action=detail when asking about a specific car
- action=general for greetings or unrelated questions`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...chatHistory.slice(-4).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: this.fastModel,
        messages,
        temperature: 0,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const raw = response.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(raw);

      return {
        brands: parsed.brands || [],
        models: parsed.models || [],
        bodyType: parsed.bodyType || null,
        fuelType: parsed.fuelType || null,
        transmission: parsed.transmission || null,
        condition: parsed.condition || null,
        minBudget: parsed.minBudget || null,
        maxBudget: parsed.maxBudget || null,
        action: parsed.action || 'recommend',
      };
    } catch (error: any) {
      this.logger.error(`Intent extraction failed: ${error?.message}`);
      return {
        brands: [], models: [], bodyType: null, fuelType: null,
        transmission: null, condition: null, minBudget: null, maxBudget: null,
        action: 'general',
      };
    }
  }

  /**
   * Step 2: Stream the final response using the main model.
   */
  async *streamChat(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
  ): AsyncIterable<string> {
    if (!this.client) {
      yield 'AI chat is not configured. Please set GROQ_API_KEY.';
      return;
    }

    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    try {
      const stream = await this.client.chat.completions.create({
        model: this.mainModel,
        messages: chatMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 512,
      });

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) yield content;
      }
    } catch (error: any) {
      if (error?.status === 429) {
        this.logger.warn('Rate limit hit, trying fallback model');
        yield* this.streamWithFallback(chatMessages);
        return;
      }
      this.logger.error(`Groq API error: ${error?.message}`);
      yield 'Sorry, I encountered an error. Please try again.';
    }
  }

  private async *streamWithFallback(
    chatMessages: Array<{ role: string; content: string }>,
  ): AsyncIterable<string> {
    try {
      const stream = await this.client!.chat.completions.create({
        model: this.fallbackModel,
        messages: chatMessages as any,
        stream: true,
        temperature: 0.7,
        max_tokens: 512,
      });

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) yield content;
      }
    } catch (error: any) {
      if (error?.status === 429) {
        yield 'AI service is busy. Please try again in a moment.';
        return;
      }
      this.logger.error(`Fallback error: ${error?.message}`);
      yield 'Sorry, I encountered an error. Please try again.';
    }
  }
}
