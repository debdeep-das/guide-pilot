# TourStep

A single step in a tour. Steps are defined in `TourConfig.steps`, passed inline to `startTour()`, or discovered via DOM scan.

---

## Interface

```ts
interface TourStep {
  // ── Identity ──────────────────────────────────────────
  id: string;
  order: number;

  // ── Target ────────────────────────────────────────────
  target?: string;            // CSS selector. Required for all types except 'modal'.
  targetTimeout?: number;     // ms to wait for element (default: 3000)

  // ── Content ───────────────────────────────────────────
  title?: string;
  content?: string;
  contentType?: 'text' | 'html';  // default: 'text'

  // ── Appearance ────────────────────────────────────────
  type?: 'tooltip' | 'spotlight' | 'modal' | 'inline';  // default: 'tooltip'
  placement?: StepPlacement;
  offset?: number;            // px distance from target (default: 8)

  // ── Spotlight-specific ────────────────────────────────
  spotlightPadding?: number;  // px padding around highlighted element (default: 4)
  allowInteraction?: boolean; // Allow clicks through the spotlight cutout (default: false)

  // ── Navigation labels ─────────────────────────────────
  nextButtonLabel?: string;   // Override "Next" label for this step
  prevButtonLabel?: string;   // Override "Back" label for this step

  // ── Lifecycle hooks ───────────────────────────────────
  beforeEnter?: () => Promise<void> | void;
  afterLeave?: () => void;
}
```

---

## Field Reference

### `id` (required)

Unique identifier within the tour. Used for step deduplication when merging DOM and config steps.

---

### `order` (required)

Determines execution sequence. Steps are sorted ascending before the tour runs. Gaps are allowed; duplicates resolve to last-registered.

---

### `target`

A CSS selector string pointing to the element this step should anchor to. Required for `tooltip`, `spotlight`, and `inline` types. Not required for `modal`.

```ts
target: '#create-btn'
target: '[data-testid="submit"]'
target: '.sidebar > nav'
```

---

### `targetTimeout`

How long (in ms) GuidePilot will wait for the target element to appear in the DOM before triggering the tour's `missingTargetStrategy`. Default: `3000`.

```ts
{ target: '#lazy-panel', targetTimeout: 6000 }
```

---

### `contentType`

Controls how `content` is rendered. Default is `'text'` — content is inserted as a text node with no HTML interpretation.

Set to `'html'` to render rich content. HTML is sanitized before rendering — see [Security](../quality/security.md).

```ts
{
  content: 'Click <strong>Save</strong> to continue.',
  contentType: 'html',
}
```

---

### `type`

The visual style of the step. Default: `'tooltip'`.

| Type | Description |
|---|---|
| `tooltip` | Anchored popover pointing at the target element |
| `spotlight` | Darkens the page and highlights the target with a cutout |
| `modal` | Centered dialog, not anchored to any element |
| `inline` | Lightweight hint, no overlay, non-blocking |

See [Step Types](../rendering/step-types.md) for details and examples.

---

### `placement`

Where the tooltip appears relative to the target. Overrides `TourConfig.defaultPlacement` for this step.

---

### `offset`

Additional distance (px) between the tooltip arrow and the target element. Default: `8`.

---

### `spotlightPadding`

Extra space (px) around the target element inside the spotlight cutout. Default: `4`.

```ts
{ type: 'spotlight', spotlightPadding: 16 }
```

---

### `allowInteraction`

When `true`, clicks pass through the spotlight overlay to the target element. Useful for "try it yourself" steps. Default: `false`.

---

### `beforeEnter`

Async hook that runs before the step renders. The step will not appear until this resolves.

Use for navigation, data fetching, or waiting for async UI:

```ts
{
  id: 'dashboard-step',
  target: '#dashboard',
  beforeEnter: async () => {
    await router.push('/dashboard');
  },
}
```

If the user navigates away while `beforeEnter` is pending, it is abandoned.

---

### `afterLeave`

Synchronous hook that fires after the step is torn down.

```ts
{
  id: 'form-step',
  afterLeave: () => {
    formRef.current?.reset();
  },
}
```

---

## StepPlacement

```ts
type StepPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'
  | 'auto';
```

`'auto'` lets `@floating-ui` pick the best side based on available viewport space.

---

## Examples

### Tooltip step

```ts
{
  id: 'submit-step',
  order: 3,
  target: '#submit-btn',
  title: 'Submit',
  content: 'Click here when you\'re ready.',
  placement: 'top',
  offset: 12,
}
```

### Interactive spotlight

```ts
{
  id: 'search-step',
  order: 2,
  target: '#search-input',
  type: 'spotlight',
  title: 'Try searching',
  content: 'Type a name to search.',
  allowInteraction: true,
  spotlightPadding: 8,
}
```

### Modal (no target)

```ts
{
  id: 'welcome',
  order: 1,
  type: 'modal',
  title: 'Welcome!',
  content: 'This tour takes about 2 minutes.',
  nextButtonLabel: 'Let\'s go',
}
```

### Async navigation step

```ts
{
  id: 'settings-step',
  order: 4,
  target: '#settings-panel',
  beforeEnter: async () => {
    await router.push('/settings');
    await waitForElement('#settings-panel');
  },
  content: 'Your settings are here.',
}
```

---

## Related

- [TourConfig](tour-config.md)
- [Step Types](../rendering/step-types.md)
- [Security](../quality/security.md)
