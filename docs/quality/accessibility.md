# Accessibility

GuidePilot implements WCAG 2.1 AA requirements for interactive overlay components.

---

## ARIA Roles

Every step type is assigned the correct ARIA role automatically:

| Step Type | Role | Notes |
|---|---|---|
| Tooltip | `role="tooltip"` | Paired with `aria-describedby` on the target element |
| Spotlight | `role="dialog"` | Treated as a dialog since it blocks interaction |
| Modal | `role="dialog"` + `aria-modal="true"` | Full dialog with focus trap |
| InlineHint | `role="tooltip"` | Non-blocking; no dialog role needed |

---

## Screen Reader Announcements

Step content is announced to screen readers via `aria-live="polite"` on the tour container. This fires automatically on step change — no extra setup needed.

The current step description is connected to the tour control surface via `aria-describedby`. This is managed safely: the attribute is added when the step renders and removed when it leaves.

---

## Focus Management

### Modal Steps

- Focus is **trapped** inside the modal — Tab and Shift+Tab cycle only through focusable elements within it
- When the modal closes (skip, complete, or navigation), focus **returns** to the element that was focused before the modal opened
- If no prior focused element exists, focus moves to `document.body`

### Spotlight and Tooltip Steps

- Focus moves to the tooltip/overlay element when it renders
- When the step ends, focus returns to the target element (or the previously focused element if the target is not focusable)

### InlineHint Steps

- No focus movement — the hint is non-blocking and does not interrupt the user

---

## Keyboard Navigation

| Key | Action |
|---|---|
| `→` (Right Arrow) | Next step |
| `←` (Left Arrow) | Previous step |
| `Tab` | Next step (also moves through focusable elements inside modal) |
| `Shift+Tab` | Previous step / previous focusable element inside modal |
| `Escape` | Skip / close tour |

Keyboard navigation is **enabled by default**. To disable it for a specific tour:

```ts
const tour: TourConfig = {
  id: 'onboarding',
  allowKeyboardNavigation: false,
};
```

---

## Touch Navigation

Left/right swipe gestures advance and retreat through steps. Enabled by default on touch devices. Touch navigation respects the same step lifecycle as keyboard and button navigation.

---

## Focus Trap Implementation Notes

The focus trap in Modal steps:

- Intercepts Tab and Shift+Tab keydown events
- Builds a list of focusable elements inside the modal on each render (handles dynamic content)
- Wraps from the last to the first focusable element (and vice versa)
- Focusable elements: `a[href]`, `button:not([disabled])`, `input:not([disabled])`, `select`, `textarea`, `[tabindex]:not([tabindex="-1"])`

---

## Testing Accessibility

Recommended tools:

- **axe DevTools** or **axe-core** — run against each step type to catch ARIA violations
- **NVDA + Chrome** or **VoiceOver + Safari** — verify step announcements and focus flow
- **Keyboard-only navigation** — tab through a full tour without a mouse to verify focus trap and restoration

---

## Related

- [Step Types](../rendering/step-types.md) — ARIA roles per type
- [TourConfig](../api/tour-config.md) — `allowKeyboardNavigation`
