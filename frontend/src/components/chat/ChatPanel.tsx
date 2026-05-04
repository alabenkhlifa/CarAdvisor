import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import StreamingDots from './StreamingDots';
import type { Vehicle } from '@shared/types';

interface ChatPanelProps {
  currentResultIds?: number[];
  aiSelectedCars?: Vehicle[];
}

const currencyMap: Record<string, string> = { tn: 'TND', de: 'EUR' };

export default function ChatPanel({ currentResultIds, aiSelectedCars = [] }: ChatPanelProps = {}) {
  const { t } = useTranslation();
  const selectedIds = aiSelectedCars.map((c) => c.id);
  const { messages, isStreaming, sendMessage } = useChat(currentResultIds, selectedIds);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasSelection = aiSelectedCars.length > 0;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const showStreamingDots = isStreaming && (messages.length === 0 || messages[messages.length - 1]?.role === 'user');

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-20 md:bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-terracotta text-white shadow-warm-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 hover:shadow-warm-hover ${
            hasSelection ? 'animate-bounce-gentle' : ''
          }`}
          aria-label={t('chat.title')}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {hasSelection && (
            <>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-sage text-white text-xs rounded-full flex items-center justify-center font-body font-bold">
                {aiSelectedCars.length}
              </span>
              <span className="absolute inset-0 rounded-full bg-terracotta animate-ping opacity-25" />
            </>
          )}
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/20 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat window */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        } bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:left-auto md:top-auto`}
      >
        <div className="bg-cream rounded-t-2xl md:rounded-2xl shadow-warm-lg md:w-[420px] md:h-[600px] h-[75vh] flex flex-col overflow-hidden border border-warmgray-border/50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-warmgray-border bg-surface/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-terracotta"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-base text-charcoal leading-tight">{t('chat.title')}</h2>
                <p className="text-xs text-warmgray font-body">
                  {hasSelection
                    ? `${aiSelectedCars.length} car${aiSelectedCars.length > 1 ? 's' : ''} selected`
                    : 'Powered by OVHcloud AI'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-warmgray hover:text-charcoal hover:bg-warmgray-border/50 transition-colors"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Selected cars strip */}
          {hasSelection && (
            <div className="px-4 py-2 border-b border-warmgray-border bg-peach/40 flex items-center gap-2 overflow-x-auto">
              <svg className="w-3.5 h-3.5 text-terracotta flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {aiSelectedCars.map((car) => {
                const brand = (car as any).model?.brand?.name || '';
                const model = (car as any).model?.name || '';
                const price = Number(car.price).toLocaleString();
                const currency = currencyMap[(car as any).market?.code] || 'TND';
                return (
                  <span
                    key={car.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-terracotta/10 border border-terracotta/20 text-xs font-body text-charcoal whitespace-nowrap"
                  >
                    <span className="font-medium">{brand} {model}</span>
                    <span className="text-terracotta font-semibold">{price} {currency}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {messages.length === 0 && !isStreaming && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-full bg-terracotta/5 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-terracotta/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.97-4.03 9-9 9a9.07 9.07 0 01-4.122-.986L3 21l1.014-4.878A8.96 8.96 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9z" />
                  </svg>
                </div>
                <p className="text-sm text-charcoal font-body font-medium mb-1">
                  {hasSelection
                    ? `${aiSelectedCars.length} car${aiSelectedCars.length > 1 ? 's' : ''} selected`
                    : t('chat.title')}
                </p>
                <p className="text-xs text-warmgray font-body">
                  {hasSelection
                    ? 'Ask me to compare, recommend, or explain these cars'
                    : t('chat.placeholder')}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {showStreamingDots && <StreamingDots />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
      </div>

      {/* Pulse animation style */}
      <style>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
