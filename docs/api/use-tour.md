# useTour()

The primary hook for controlling and reading tour state. Must be used inside a `<GuidePilotProvider>`.

---

## Import

```ts
import { useTour } from 'guide-pilot';
```

---

## Full API

```ts
interface UseTourReturn {
  // ── State ─────────────────────────────────────────────
  isActive: boolean;           // true when a tour is running
  activeTourId: string | null;
  currentStep: TourStep | null;
  currentStepIndex: number;    // 0-based
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  status: TourStatus;          // 'idle' | 'running' | 'paused' | 'complete' | 'skipped' | 'error'

  // ── Actions ───────────────────────────────────────────
  startTour(tourId: string, options?: StartTourOptions): void;
  startTour(steps: TourStep[]): void;
  startTour(config: TourConfig): void;

  stopTour(): void;
  nextStep(): void;
  prevStep(): void;
  goToStep(index: number): void;   // 0-based
  skipTour(): void;

  registerTour(config: TourConfig): void;  // runtime registration
}

interface StartTourOptions {
  startFrom?: number;  // 0-based step index to begin from
}
```

---

## TourStatus

```ts
enum TourStatus {
  Idle     = 'idle',
  Running  = 'running',
  Paused   = 'paused',
  Complete = 'complete',
  Skipped  = 'skipped',
  Error    = 'error',
}
```

---

## Examples

### Start a pre-registered tour

```tsx
const { startTour } = useTour();

// By ID (tour must be registered via <GuidePilotProvider tours={[...]}>
// or a prior registerTour() call)
startTour('onboarding');

// Start from a specific step
startTour('onboarding', { startFrom: 2 });
```

### Start an inline tour (no registration)

```tsx
startTour([
  { id: 's1', order: 1, target: '#btn', content: 'Click here.' },
  { id: 's2', order: 2, target: '#nav', content: 'Navigate here.' },
]);
```

### Navigation controls

```tsx
const { nextStep, prevStep, goToStep, skipTour, stopTour } = useTour();

// Advance
nextStep();

// Back
prevStep();

// Jump to step 3 (0-based → index 2)
goToStep(2);

// End tour, fire onSkip callback
skipTour();

// End tour immediately, no callbacks
stopTour();
```

### Reading state

```tsx
const { isActive, currentStep, currentStepIndex, totalSteps, isLastStep } = useTour();

return (
  <div>
    {isActive && (
      <p>Step {currentStepIndex + 1} of {totalSteps}: {currentStep?.title}</p>
    )}
    {isLastStep && <p>Last step!</p>}
  </div>
);
```

### Runtime tour registration

```tsx
const { registerTour, startTour } = useTour();

useEffect(() => {
  registerTour({
    id: 'feature-tour',
    steps: [{ id: 's1', order: 1, target: '#feature', content: 'New feature!' }],
  });
}, []);
```

---

## Guarantees

| Guarantee | Detail |
|---|---|
| SSR-safe | Returns idle state and no-op actions during server render — no DOM access |
| No throws in production | Errors are routed to `onError` or swallowed silently |
| Idempotent actions | `nextStep()` at the last step, `prevStep()` at step 0 — both no-ops |
| Safe outside Provider | Returns no-ops and logs a dev-mode warning; does not throw |

---

## Related

- [TourConfig](tour-config.md)
- [TourStep](tour-step.md)
- [Execution Model](../core-concepts/execution-model.md)
