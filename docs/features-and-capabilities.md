# GuidePilot — Features and Capabilities

## 1. Zero-Config Data-Attribute Tours

Annotate any HTML element with `data-guide-pilot-*` attributes. No JavaScript tour definition required. The library scans the DOM automatically when `startTour(id)` is called.

```html
<button
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="1"
  data-guide-pilot-type="tooltip"
  data-guide-pilot-title="Create a project"
  data-guide-pilot-content="Click here to create your first project."
  data-guide-pilot-placement="bottom"
>
  New Project
</button>

<input
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="2"
  data-guide-pilot-type="spotlight"
  data-guide-pilot-title="Name your project"
  data-guide-pilot-content="Give your project a memorable name."
/>
```

**Supported data attributes:**

| Attribute | Required | Description |
|---|---|---|
| `data-guide-pilot-tour` | Yes | Tour ID this step belongs to |
| `data-guide-pilot-step` | Yes | 1-based step order |
| `data-guide-pilot-type` | No | `tooltip` (default), `spotlight`, `inline-hint`, `modal` |
| `data-guide-pilot-title` | No | Step title text |
| `data-guide-pilot-content` | Yes | Step body text |
| `data-guide-pilot-placement` | No | `top`, `bottom`, `left`, `right` and variants |
| `data-guide-pilot-spotlight-padding` | No | px padding around spotlight cutout |

---

## 2. Programmatic JSON Config

Define tours as JavaScript/TypeScript objects for full control:

```typescript
import { TourConfig, StepType } from 'guide-pilot';

const onboardingTour: TourConfig = {
  id: 'onboarding',
  allowSkip: true,
  onStart: (tourId) => analytics.track('tour_started', { tourId }),
  onComplete: (tourId) => localStorage.setItem('tour_done', '1'),
  steps: [
    {
      id: 'step-create',
      order: 1,
      type: StepType.Tooltip,
      target: '#new-project-btn',
      title: 'Create a project',
      content: 'Click here to create your first project.',
      placement: 'bottom',
    },
    {
      id: 'step-name',
      order: 2,
      type: StepType.Spotlight,
      target: '#project-name-input',
      title: 'Name your project',
      content: 'Give it a memorable name.',
      allowInteraction: true,
    },
  ],
};
```

---

## 3. Inline Steps (no pre-registration)

Pass steps directly to `startTour()` — no `registerTour()` required:

```typescript
const { startTour } = useTour();

startTour([
  { id: 'step-1', target: '#save-btn', content: 'Save your work here.', placement: 'top' },
  { id: 'step-2', target: '#share-btn', content: 'Share with your team.', placement: 'left' },
]);
```

---

## 4. Four Step UI Types

### Tooltip / Popover

A floating popover anchored to the target element with an arrow pointer. Automatically flips placement when near viewport edges.

```typescript
{ type: StepType.Tooltip, target: '#save-btn', placement: 'bottom' }
```

### Spotlight / Overlay

A dark full-screen overlay with an animated cutout around the target element. Draws the user's eye to the highlighted area.

```typescript
{ type: StepType.Spotlight, target: '#dashboard-chart', spotlightPadding: 12 }
```

### Inline Hint

A non-blocking hint positioned near the target. No overlay — the rest of the page remains fully interactive.

```typescript
{ type: StepType.InlineHint, target: '#help-icon', placement: 'right' }
```

### Modal

A centered full-screen dialog not tied to any specific element. Used for introductory or summary steps.

```typescript
{ type: StepType.Modal, content: 'Welcome! Let us show you around.' }
```

---

## 5. `allowInteraction` — Interactive Steps

Allow the user to interact with the highlighted element during the tour — click buttons, fill inputs, select dropdowns:

```typescript
{
  type: StepType.Spotlight,
  target: '#search-input',
  content: 'Try searching for a project now.',
  allowInteraction: true,
}
```

The overlay dims the background but the highlighted element remains fully functional.

---

## 6. `disableOverlay` — Per-Step Overlay Control

Show a tooltip or spotlight without the dark backdrop:

```typescript
{ type: StepType.Spotlight, target: '#toolbar', disableOverlay: true }
```

---

## 7. `waitForElement` — Lazy-Loaded and Conditional Elements

GuidePilot automatically waits for target elements that are not yet in the DOM. Perfect for elements rendered after data fetch, route transition, or conditional render:

```typescript
{
  target: '#dynamic-widget',
  targetTimeout: 5000,  // wait up to 5 seconds (default: 3000ms)
}
```

Configure fallback behaviour in `TourConfig`:

```typescript
{
  onElementNotFound: 'skip',   // 'skip' | 'stop' | 'warn' (default: 'warn')
}
```

---

## 8. Navigation Controls

Built-in navigation with keyboard and touch support:

- **Next** / **Previous** / **Skip** / **Done** buttons (all labels configurable)
- **Keyboard**: `→` next, `←` previous, `Escape` skip/close
- **Touch**: swipe left/right to navigate
- **`goToStep(index)`** for programmatic jumps

Per-step label overrides:

```typescript
{
  nextButtonLabel: 'Continue →',
  prevButtonLabel: '← Back',
  doneButtonLabel: 'Finish',
}
```

---

## 9. Custom Navigation Render Slots

Replace the built-in nav buttons with your own components:

```typescript
{
  renderNextButton: (onClick) => (
    <MyButton variant="primary" onClick={onClick}>Next →</MyButton>
  ),
  renderSkipButton: (onClick) => (
    <MyButton variant="ghost" onClick={onClick}>Skip for now</MyButton>
  ),
}
```

---

## 10. Custom Content Slot

Replace the entire tooltip/modal content body:

```typescript
{
  target: '#upgrade-btn',
  customContent: (
    <div>
      <strong>Upgrade your plan</strong>
      <p>Get access to unlimited projects.</p>
      <UpgradeBanner />
    </div>
  ),
}
```

---

## 11. Scroll-Into-View

The active step's target element is automatically scrolled into the viewport before the step renders. Works with nested scroll containers.

```typescript
{
  scrollIntoView: true,       // default: true
  scrollBehavior: 'smooth',   // 'smooth' | 'instant'
}
```

---

## 12. Per-Step Lifecycle Callbacks

```typescript
{
  target: '#payment-form',
  onBeforeShow: async () => {
    await ensurePaymentFormLoaded();   // async supported
  },
  onAfterShow: () => {
    analytics.track('step_viewed', { step: 'payment' });
  },
  onNext: () => {
    console.log('User clicked Next on payment step');
  },
  onPrev: () => {
    console.log('User went back from payment step');
  },
}
```

---

## 13. Tour-Level Callbacks

```typescript
const tour: TourConfig = {
  id: 'onboarding',
  onStart:    (tourId) => analytics.track('tour_started'),
  onStep:     (step, index) => analytics.track('step_viewed', { index }),
  onComplete: (tourId) => { localStorage.setItem('onboarding_done', '1'); },
  onSkip:     (tourId, atStep) => analytics.track('tour_skipped', { atStep }),
  onError:    (err, step) => console.error('Tour error on step', step?.id, err),
};
```

---

## 14. Theming — CSS Custom Properties

Override any visual property by setting CSS variables:

```css
:root {
  /* Colours */
  --guide-pilot-overlay-bg:         rgba(0, 0, 0, 0.6);
  --guide-pilot-tooltip-bg:         #ffffff;
  --guide-pilot-tooltip-color:      #1a1a1a;
  --guide-pilot-tooltip-border:     1px solid #e5e7eb;
  --guide-pilot-tooltip-radius:     8px;
  --guide-pilot-btn-primary-bg:     #6366f1;
  --guide-pilot-btn-primary-color:  #ffffff;

  /* Sizing */
  --guide-pilot-tooltip-max-width:  360px;
  --guide-pilot-tooltip-padding:    16px;

  /* Z-index (override base, all layers adjust automatically) */
  --guide-pilot-z-base:             9000;
}
```

**Dark mode:**

```css
@media (prefers-color-scheme: dark) {
  :root {
    --guide-pilot-tooltip-bg:    #1f2937;
    --guide-pilot-tooltip-color: #f9fafb;
  }
}
```

---

## 15. Theming — className and style Props

For targeted overrides beyond CSS variables:

```typescript
const tour: TourConfig = {
  id: 'onboarding',
  tooltipClassName: 'my-branded-tooltip',
  tooltipStyle: { fontFamily: 'Inter, sans-serif' },
  overlayClassName: 'my-overlay',
};
```

---

## 16. Z-Index Control

Set a base z-index that all internal layers derive from:

```css
:root { --guide-pilot-z-base: 1600; }  /* e.g. above MUI tooltips */
```

Or per tour:

```typescript
const tour: TourConfig = { id: 'onboarding', zIndex: 1600 };
```

Custom portal target to escape stacking context traps:

```tsx
<GuidePilotProvider portalTarget={document.getElementById('guide-pilot-root')}>
```

---

## 17. Accessibility

- Tooltip: `role="tooltip"`, `aria-describedby` on the target element
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Screen reader live region announces each step: `"Step 2 of 5: Name your project"`
- Focus moves to the tooltip/modal on step show; returns to the original element on tour end
- Full keyboard navigation: `→`, `←`, `Escape`
- Respects `prefers-reduced-motion`

---

## 18. SSR / Next.js Support

No DOM access at module load or render time. The Provider renders nothing on the server — zero risk of hydration mismatch.

Works with Next.js App Router and Pages Router. No `"use client"` directive required on the Provider.

---

## 19. Micro Frontend Support

**Module Federation (same-document):**

Shell app owns the `<GuidePilotProvider>`. All MFEs just annotate their elements with data attributes. The DOM scanner crosses React root boundaries naturally.

```javascript
// webpack.config.js — mark as singleton so all MFEs share one instance
shared: { 'guide-pilot': { singleton: true } }
```

**iframed MFEs (cross-frame tours):**

Optional `guide-pilot/bridge` package coordinates tours across iframe boundaries via `postMessage`.

```typescript
// shell: bridge.listen()
// each iframe MFE: bridge.connect(window.parent)
```

---

## 20. Error Recovery

If a step component throws or an element is not found, GuidePilot fails gracefully:

- Built-in error boundary calls `stopTour()` automatically
- App is left in a clean, interactive state
- Dev-mode console warnings point to the offending step ID
- Configure `onError` callback for custom error reporting

---

## 21. Security — XSS Protection

Step `content` is rendered as **plain text by default**. To render HTML, opt in with `contentType: 'html'` — content is sanitized by a built-in allowlist sanitizer before rendering:

```typescript
{
  content: '<strong>Important:</strong> Save your work before continuing.',
  contentType: 'html',  // sanitized — script tags, on* attrs, javascript: hrefs stripped
}
```
