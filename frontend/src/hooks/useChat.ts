import { useState, useCallback, useEffect, useRef } from 'react';
import { streamChat, parseSSELines, getChatHistory, type ChatMessage } from '../services/chat.api';
import { useSession } from '../store/useSession';
import { useMarket } from '../store/useMarket';
import { useLanguage } from '../store/useLanguage';

export function useChat(currentResultIds?: number[], selectedVehicleIds?: number[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const { sessionToken, setSessionToken } = useSession();
  const { market } = useMarket();
  const { language } = useLanguage();
  const abortRef = useRef(false);
  const resultIdsRef = useRef(currentResultIds);
  resultIdsRef.current = currentResultIds;
  const selectedIdsRef = useRef(selectedVehicleIds);
  selectedIdsRef.current = selectedVehicleIds;

  const loadHistory = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const session = await getChatHistory(sessionToken);
      if (session.messages?.length) {
        setMessages(session.messages);
      }
    } catch {
      // History not available, start fresh
    }
  }, [sessionToken]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: ChatMessage = { role: 'user', content: text.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      abortRef.current = false;

      try {
        const reader = await streamChat(text.trim(), sessionToken, market, language, resultIdsRef.current, selectedIdsRef.current);
        const decoder = new TextDecoder();
        let assistantContent = '';
        let hasStarted = false;

        while (true) {
          if (abortRef.current) {
            reader.cancel();
            break;
          }

          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const chunks = parseSSELines(text);

          for (const chunk of chunks) {
            if (chunk.sessionToken) {
              setSessionToken(chunk.sessionToken);
            }

            if (chunk.done) {
              break;
            }

            if (chunk.content) {
              assistantContent += chunk.content;

              if (!hasStarted) {
                hasStarted = true;
                setMessages((prev) => [
                  ...prev,
                  { role: 'assistant', content: assistantContent },
                ]);
              } else {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: assistantContent,
                  };
                  return updated;
                });
              }
            }
          }
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '__ERROR__' },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, sessionToken, market, language, setSessionToken],
  );

  return { messages, isStreaming, sendMessage, loadHistory };
}
