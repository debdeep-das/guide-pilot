# Step Types

GuidePilot supports four step types, each designed for a different use case.

---

## Tooltip

**Default type.** An anchored popover that points at the target element. Suitable for most steps.

- Has an arrow pointing to the target
- Positioned by `@floating-ui` (auto-updates on scroll/resize)
- Overlay is optional (no overlay by default)

```ts
{
  id: 'submit-step',
  order: 1,
  target: '#submit-btn',
  type: 'tooltip',           // or omit — tooltip is the default
  title: 'Submit your form',
  content: 'When ready, click here to submit.',
  placement: 'top',
  offset: 8,
}
```

**ARIA:** `role="tooltip"` on the popover element.

---

## Spotlight

Darkens the entire page and reveals the target element through a cutout. Draws strong attention to a specific UI element.

- Overlay covers the full viewport
- Target element is highlighted through a transparent cutout
- Tooltip is anchored alongside the cutout
- `allowInteraction: true` lets the user click through the cutout

```ts
{
  id: 'analytics-step',
  order: 2,
  target: '#analytics-chart',
  type: 'spotlight',
  title: 'Your analytics',
  content: 'This chart shows activity over the last 30 days.',
  spotlightPadding: 16,
}
```

**Interactive spotlight** — user can interact with the highlighted element:

```ts
{
  id: 'search-step',
  target: '#search-input',
  type: 'spotlight',
  title: 'Try searching',
  content: 'Type a project name to search.',
  allowInteraction: true,
}
```

**ARIA:** `role="dialog"` on the tooltip overlay.

---

## Modal

A centered dialog not anchored to any element. No `target` required. Used for welcome screens, summaries, or steps that don't relate to a specific element.

- Rendered in the center of the viewport
- Has a focus trap — keyboard focus stays inside the modal
- Focus returns to the previously focused element when closed

```ts
{
  id: 'welcome',
  order: 1,
  type: 'modal',
  title: 'Welcome to Acme!',
  content: 'This tour takes about 2 minutes. Let\'s go.',
  nextButtonLabel: 'Let\'s go!',
}
```

```ts
{
  id: 'complete',
  order: 5,
  type: 'modal',
  title: 'You\'re all set!',
  content: 'You\'ve seen all the key features.',
  nextButtonLabel: 'Finish',
}
```

**ARIA:** `role="dialog"` with `aria-modal="true"`.

---

## InlineHint

A lightweight, non-blocking tooltip. No overlay. Doesn't interrupt the user's workflow — the hint simply appears near the target element.

- No overlay rendered
- Does not block clicks elsewhere on the page
- Useful for optional hints or always-visible tips

```ts
{
  id: 'help-hint',
  order: 3,
  target: '#help-icon',
  type: 'inline',
  content: 'Click here any time for help.',
  placement: 'right',
}
```

**ARIA:** `role="tooltip"`.

---

## Comparison

| | Tooltip | Spotlight | Modal | InlineHint |
|---|:---:|:---:|:---:|:---:|
| Requires target | ✅ | ✅ | ❌ | ✅ |
| Full-page overlay | ❌ | ✅ | ✅ | ❌ |
| Blocks interaction | ❌ | ✅* | ✅ | ❌ |
| Focus trap | ❌ | ❌ | ✅ | ❌ |
| Best for | General steps | Feature callouts | Welcome/summary | Non-intrusive hints |

\* Unless `allowInteraction: true`

---

## Related

- [TourStep](../api/tour-step.md)
- [Portal & Layering](portal-and-layering.md)
- [Accessibility](../quality/accessibility.md)
