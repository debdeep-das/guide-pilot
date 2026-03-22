# TourConfig

The top-level configuration object for a tour. Passed to `<GuidePilotProvider tours={[...]}>` or `registerTour()`.

---

## Interface

```ts
interface TourConfig {
  // ── Identity ──────────────────────────────────────────
  id: string;

  // ── Steps ─────────────────────────────────────────────
  steps?: TourStep[];

  // ── Defaults ──────────────────────────────────────────
  defaultPlacement?: StepPlacement;   // Fallback placement for steps without explicit placement
  zIndex?: number;                    // Overrides --guide-pilot-z-base for this tour only

  // ── Behaviour ─────────────────────────────────────────
  missingTargetStrategy?: 'skip' | 'retry' | 'fail';  // default: 'skip'
  allowSkip?: boolean;                // Show skip button (default: true)
  allowKeyboardNavigation?: boolean;  // Enable → ← Esc keys (default: true)

  // ── Styling ───────────────────────────────────────────
  tooltipClassName?: string;   // Applied to all tooltip elements in this tour
  overlayClassName?: string;   // Applied to the overlay element

  // ── Lifecycle callbacks ───────────────────────────────
  onStart?: () => void;
  onStepChange?: (step: TourStep, index: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  onError?: (error: GuidePilotError) => void;
}
```

---

## Field Reference

### `id` (required)

Unique identifier for the tour. Used by `startTour('id')` to look up the config.

```ts
{ id: 'onboarding' }
```

---

### `steps`

Array of `TourStep` objects. Steps from this array are merged with any DOM-scanned steps that share the same tour ID. See [TourStep](tour-step.md).

If omitted, GuidePilot will scan the DOM for `data-guide-pilot-tour="<id>"` elements.

---

### `defaultPlacement`

Fallback placement used for any step that doesn't specify its own `placement`. Defaults to `'bottom'`.

```ts
{ defaultPlacement: 'right' }
```

See [StepPlacement](tour-step.md#stepplacement) for all valid values.

---

### `missingTargetStrategy`

Controls what happens when a step's target element is not found in the DOM:

| Value | Behaviour |
|---|---|
| `'skip'` | Skip the step and move to the next one (default) |
| `'retry'` | Poll until `targetTimeout` is exceeded, then skip |
| `'fail'` | Stop the tour and call `onError` with `ELEMENT_NOT_FOUND` |

```ts
{ missingTargetStrategy: 'retry' }
```

---

### `allowKeyboardNavigation`

Enables `→` (next), `←` (previous), and `Esc` (skip) keyboard shortcuts. Default: `true`.

```ts
{ allowKeyboardNavigation: false }
```

---

### `tooltipClassName` / `overlayClassName`

Extra CSS classes applied to tooltip and overlay elements for this tour. Useful with Tailwind or CSS Modules.

```ts
{
  tooltipClassName: 'shadow-2xl rounded-xl',
  overlayClassName: 'backdrop-blur-sm',
}
```

---

### Lifecycle Callbacks

| Callback | Fires when |
|---|---|
| `onStart` | The tour begins (after step 0's `beforeEnter` resolves) |
| `onStepChange` | The active step changes — receives the new `TourStep` and its 0-based index |
| `onComplete` | The user reaches and passes the last step |
| `onSkip` | The user dismisses the tour early (via skip button or Esc) |
| `onError` | A `GuidePilotError` occurs — see [Error Handling](../reference/error-handling.md) |

```ts
const tour: TourConfig = {
  id: 'onboarding',
  onComplete: () => {
    analytics.track('onboarding_complete');
    localStorage.setItem('onboarding_done', '1');
  },
  onSkip: () => {
    analytics.track('onboarding_skipped');
  },
  onError: (err) => {
    logger.warn('Tour error', err);
  },
};
```

---

## Full Example

```ts
import type { TourConfig } from 'guide-pilot';

const onboardingTour: TourConfig = {
  id: 'onboarding',
  defaultPlacement: 'bottom',
  missingTargetStrategy: 'retry',
  allowSkip: true,
  tooltipClassName: 'my-tour-tooltip',

  steps: [
    {
      id: 'welcome',
      order: 1,
      type: 'modal',
      title: 'Welcome!',
      content: 'Let\'s take a quick tour.',
    },
    {
      id: 'nav',
      order: 2,
      target: '#main-nav',
      type: 'spotlight',
      title: 'Navigation',
      content: 'Use this to move between sections.',
    },
    {
      id: 'create',
      order: 3,
      target: '#create-btn',
      title: 'Create',
      content: 'Click here to create your first item.',
      placement: 'right',
    },
  ],

  onComplete: () => localStorage.setItem('tour_done', '1'),
  onError: (err) => console.warn(err),
};
```

---

## Related

- [TourStep](tour-step.md)
- [useTour()](use-tour.md)
- [Error Handling](../reference/error-handling.md)
