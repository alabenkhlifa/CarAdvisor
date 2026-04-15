const BASE_URL = '/api';

export interface ChatStreamChunk {
  content?: string;
  done?: boolean;
  sessionToken?: string;
}

export async function streamChat(
  message: string,
  sessionToken?: string | null,
  market?: string | null,
  language?: string | null,
  currentResultIds?: number[],
  selectedVehicleIds?: number[],
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      ...(sessionToken && { sessionToken }),
      ...(market && { market }),
      ...(language && { language }),
      ...(currentResultIds && currentResultIds.length > 0 && { currentResultIds }),
      ...(selectedVehicleIds && selectedVehicleIds.length > 0 && { selectedVehicleIds }),
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  return response.body.getReader();
}

export function parseSSELines(text: string): ChatStreamChunk[] {
  const chunks: ChatStreamChunk[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('data: ')) {
      try {
        const json = JSON.parse(trimmed.slice(6));
        chunks.push(json);
      } catch {
        // skip malformed lines
      }
    }
  }

  return chunks;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  sessionToken: string;
  messages: ChatMessage[];
}

export async function getChatHistory(sessionToken: string): Promise<ChatSession> {
  const response = await fetch(`${BASE_URL}/chat/${sessionToken}/history`);
  if (!response.ok) {
    throw new Error(`Failed to load chat history: ${response.status}`);
  }
  return response.json();
}
