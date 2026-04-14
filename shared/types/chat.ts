export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  sessionToken?: string;
  preferences?: {
    market: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    bodyType?: string;
    fuelType?: string;
    transmission?: string;
    language?: string;
  };
}

export interface ChatSession {
  id: string;
  sessionToken: string;
  marketId: number;
  preferences: Record<string, unknown>;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}
