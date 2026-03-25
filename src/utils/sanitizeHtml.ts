const ALLOWED_TAGS = new Set([
  'b', 'i', 'strong', 'em', 'a', 'br', 'code', 'p',
  'ul', 'ol', 'li', 'span',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'class', 'target', 'rel']),
  span: new Set(['class']),
  code: new Set(['class']),
  '*': new Set(['class']),
};

const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript):/i;
const EVENT_ATTR = /^on/i;

function isAllowedAttr(tag: string, attr: string, value: string): boolean {
  if (EVENT_ATTR.test(attr)) return false;
  const tagAttrs = ALLOWED_ATTRS[tag];
  const globalAttrs = ALLOWED_ATTRS['*'];
  if (!tagAttrs?.has(attr) && !globalAttrs?.has(attr)) return false;
  if ((attr === 'href' || attr === 'src') && DANGEROUS_PROTOCOLS.test(value.trim())) return false;
  return true;
}

function sanitizeNode(node: Node, output: string[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    output.push(escapeText(node.textContent ?? ''));
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  if (!ALLOWED_TAGS.has(tag)) {
    // Still process children for allowed inline content
    node.childNodes.forEach((child) => sanitizeNode(child, output));
    return;
  }

  const attrs: string[] = [];
  Array.from(el.attributes).forEach((attr) => {
    if (isAllowedAttr(tag, attr.name, attr.value)) {
      attrs.push(`${attr.name}="${escapeAttr(attr.value)}"`);
    }
  });

  // Force safe link attributes
  if (tag === 'a') {
    if (!attrs.some((a) => a.startsWith('rel='))) {
      attrs.push('rel="noopener noreferrer"');
    }
  }

  const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';
  const VOID_TAGS = new Set(['br', 'hr', 'img', 'input']);

  if (VOID_TAGS.has(tag)) {
    output.push(`<${tag}${attrStr}>`);
    return;
  }

  output.push(`<${tag}${attrStr}>`);
  node.childNodes.forEach((child) => sanitizeNode(child, output));
  output.push(`</${tag}>`);
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function sanitizeHtml(html: string): string {
  if (typeof document === 'undefined') return '';

  const template = document.createElement('template');
  template.innerHTML = html;
  const output: string[] = [];
  template.content.childNodes.forEach((node) => sanitizeNode(node, output));
  return output.join('');
}
