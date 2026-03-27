import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../../src/utils/sanitizeHtml';

describe('sanitizeHtml', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('passes through safe inline tags', () => {
    const result = sanitizeHtml('<b>bold</b> and <em>italic</em>');
    expect(result).toContain('<b>bold</b>');
    expect(result).toContain('<em>italic</em>');
  });

  it('strips script tags entirely', () => {
    const result = sanitizeHtml('<script>alert("xss")</script>Hello');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('Hello');
  });

  it('strips style tags', () => {
    const result = sanitizeHtml('<style>body{color:red}</style>text');
    expect(result).not.toContain('<style>');
    expect(result).toContain('text');
  });

  it('strips inline event handlers', () => {
    const result = sanitizeHtml('<b onclick="evil()">click</b>');
    expect(result).not.toContain('onclick');
    expect(result).toContain('<b>');
  });

  it('strips javascript: href', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toContain('javascript:');
  });

  it('strips data: URI href', () => {
    const result = sanitizeHtml('<a href="data:text/html,<h1>XSS</h1>">click</a>');
    expect(result).not.toContain('data:');
  });

  it('allows safe anchor tags with href', () => {
    const result = sanitizeHtml('<a href="https://example.com">link</a>');
    expect(result).toContain('href="https://example.com"');
  });

  it('adds rel="noopener noreferrer" to anchor tags', () => {
    const result = sanitizeHtml('<a href="https://example.com">link</a>');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('strips disallowed tags but keeps their text content', () => {
    const result = sanitizeHtml('<div>inner text</div>');
    expect(result).not.toContain('<div>');
    expect(result).toContain('inner text');
  });

  it('escapes plain text', () => {
    const result = sanitizeHtml('5 < 10 & "quotes"');
    expect(result).toContain('&lt;');
    expect(result).toContain('&amp;');
  });

  it('allows code tags', () => {
    const result = sanitizeHtml('<code>const x = 1</code>');
    expect(result).toContain('<code>');
  });

  it('allows list tags', () => {
    const result = sanitizeHtml('<ul><li>item</li></ul>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>item</li>');
  });
});
