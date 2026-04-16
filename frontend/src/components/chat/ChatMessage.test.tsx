import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './ChatMessage';

describe('renderMarkdown', () => {
  it('escapes raw HTML to prevent XSS', () => {
    const out = renderMarkdown('<script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('renders bold and italics', () => {
    expect(renderMarkdown('**hi**')).toContain('<strong>hi</strong>');
    expect(renderMarkdown('*hi*')).toContain('<em>hi</em>');
  });

  it('turns /car/123 links into data-href anchors for SPA navigation', () => {
    const out = renderMarkdown('Try [Peugeot 208](/car/42)');
    expect(out).toContain('data-href="/car/42"');
    expect(out).toContain('>Peugeot 208</a>');
    // Should use data-href for SPA routing, never a plain href (space-separated)
    expect(out).not.toMatch(/\shref="\/car\/42"/);
  });

  it('opens external links in a new tab with rel=noopener', () => {
    const out = renderMarkdown('See [example](https://example.com)');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener"');
  });

  it('wraps bullet items in a <ul>', () => {
    const out = renderMarkdown('- one\n- two');
    expect(out).toContain('<ul');
    expect(out).toContain('<li>one</li>');
    expect(out).toContain('<li>two</li>');
  });
});
