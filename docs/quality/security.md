# Security

GuidePilot follows a secure-by-default content model. All step content is treated as plain text unless HTML is explicitly opted into.

---

## Default: Plain Text

By default, `content` and `title` values are rendered as text nodes — no HTML parsing, no element creation, no script execution. A string like:

```ts
content: '<script>alert(1)</script>'
```

is displayed literally as the text `<script>alert(1)</script>`, not executed.

This means the default mode is fully safe for user-supplied or untrusted content strings.

---

## HTML Mode (opt-in)

To render rich HTML content in a step, set `contentType: 'html'` on the step:

```ts
{
  id: 'rich-step',
  content: 'Click <strong>Save</strong> to continue.',
  contentType: 'html',
}
```

HTML mode is **not** enabled by default. It must be set explicitly per step.

---

## Sanitization Rules

When `contentType: 'html'` is used, GuidePilot sanitizes the HTML string before rendering:

| Rule | Detail |
|---|---|
| Strip `<script>` | Entire script tags and their contents are removed |
| Strip `<style>` | Style blocks are removed |
| Strip event handlers | `onclick`, `onmouseover`, `onerror`, and all `on*` attributes are removed |
| Block `javascript:` URLs | `href="javascript:..."` and `src="javascript:..."` are replaced with `#` |
| Block `data:` URLs | `data:` scheme in `href`/`src` is blocked |

Sanitization runs on every render — it is not cached or skipped even if the content string appears unchanged.

---

## Hard Constraints

These constraints apply regardless of configuration:

- No `eval()` or `new Function()` is used anywhere in the GuidePilot codebase
- No dynamic `<script>` elements are created or injected
- The `dangerouslySetInnerHTML` React prop is only used inside the sanitization boundary, never with unsanitized input

---

## Content Security Policy (CSP)

GuidePilot does not require `unsafe-eval` or `unsafe-inline` in your CSP.

If you use `contentType: 'html'` with inline styles in your content (e.g. `style="color: red"`), you may need `unsafe-inline` for styles in your CSP — or use class-based styling instead.

---

## Recommendations

- Prefer `contentType: 'text'` (the default) for all step content
- Only use `contentType: 'html'` for content you author and control (not user-generated content)
- If you must render user-generated HTML, sanitize it yourself before passing it to GuidePilot — do not rely solely on GuidePilot's sanitizer as a security boundary for untrusted user content

---

## Related

- [TourStep — contentType](../api/tour-step.md#contenttype)
