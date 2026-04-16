import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Markdown links [text](/car/123) → <a> tags with data-href for SPA navigation
    .replace(
      /\[([^\]]+)\]\((\/car\/\d+)\)/g,
      '<a data-href="$2" class="text-terracotta hover:text-terracotta-hover underline underline-offset-2 cursor-pointer font-medium">$1</a>',
    )
    // External links [text](https://...)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" class="text-terracotta hover:text-terracotta-hover underline underline-offset-2">$1</a>',
    )
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Bullet lists
    .replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n/g, '<br />');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*?<\/li><br \/>?)+)/g, (match) => {
    const cleaned = match.replace(/<br \/>/g, '');
    return `<ul class="list-disc list-inside space-y-1 my-1">${cleaned}</ul>`;
  });

  return html;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isUser = role === 'user';
  const isError = role === 'assistant' && content === '__ERROR__';

  // Handle clicks on internal links (data-href="/car/123")
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-href]') as HTMLAnchorElement | null;
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('data-href');
        if (href) navigate(href);
      }
    },
    [navigate],
  );

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3`}>
      <span className="text-[10px] text-warmgray font-body mb-1 px-1">
        {isUser ? 'You' : t('chat.title')}
      </span>
      {isError ? (
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-bl-sm bg-red-50 border border-red-200 text-red-600 text-sm font-body">
          {t('chat.error')}
        </div>
      ) : isUser ? (
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-terracotta text-white text-sm font-body leading-relaxed">
          {content}
        </div>
      ) : (
        <div
          className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-bl-sm bg-surface border border-warmgray-border text-charcoal text-sm font-body leading-relaxed"
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      )}
    </div>
  );
}
