# Error Handling

GuidePilot never throws unhandled exceptions. All errors are either routed to `onError` callbacks or swallowed silently in production.

---

## Error Types

```ts
type GuidePilotErrorType =
  | 'ELEMENT_NOT_FOUND'
  | 'INVALID_CONFIG'
  | 'TIMEOUT'
  | 'RENDER_FAILURE';

interface GuidePilotError {
  type: GuidePilotErrorType;
  message: string;
  stepId?: string;
  tourId?: string;
}
```

### `ELEMENT_NOT_FOUND`

The CSS selector in `step.target` matched no element in the DOM within the `targetTimeout` period.

Triggered when `missingTargetStrategy` is set to `'fail'`. With `'skip'` or `'retry'`, the step is silently advanced without calling `onError`.

### `INVALID_CONFIG`

A `TourConfig` or `TourStep` object failed validation. Common causes:

- Missing required `id` field
- `steps` array contains duplicate `id` values (warning in dev, not an error)
- Unknown or misspelled `type` value

### `TIMEOUT`

An async `beforeEnter` hook did not resolve within the allowed time (default: same as `targetTimeout` on the step). The step is skipped and `onError` is called.

### `RENDER_FAILURE`

The `StepRenderer` component threw an error during render. This is caught by an internal error boundary — the tour stops and `onError` is called. The rest of your application is unaffected.

---

## Dev vs Production Behaviour

| Environment | Behaviour |
|---|---|
| Development (`NODE_ENV !== 'production'`) | Console warning with error type, step ID, tour ID, and an actionable message |
| Production | Silent fail — tour stops, `onError` fires if provided, no console output |

---

## onError Callback

Subscribe to errors via the `onError` field on `TourConfig`:

```ts
const tour: TourConfig = {
  id: 'onboarding',
  onError: (error: GuidePilotError) => {
    // error.type    → 'ELEMENT_NOT_FOUND' | 'INVALID_CONFIG' | 'TIMEOUT' | 'RENDER_FAILURE'
    // error.message → human-readable description
    // error.stepId  → which step triggered the error (if applicable)
    // error.tourId  → which tour

    myLogger.warn('[GuidePilot]', error.type, error.message, {
      tourId: error.tourId,
      stepId: error.stepId,
    });
  },
};
```

---

## Behaviour After an Error

When any error occurs:

1. The active step is torn down (no `afterLeave` hook is called for `RENDER_FAILURE`)
2. The tour transitions to `TourStatus.Error`
3. `onError` is called with the `GuidePilotError` object
4. The tour stops — no further steps execute

To restart after an error, call `startTour()` again.

---

## Common Errors and Fixes

### `ELEMENT_NOT_FOUND`

**Symptom:** Step is silently skipped or tour stops.

**Causes:**
- The target element hasn't been mounted yet (lazy-loaded component, SPA route change)
- The selector is incorrect (typo, wrong ID)
- The element is conditionally rendered and isn't visible at this point in the flow

**Fixes:**
```ts
// Increase timeout
{ target: '#lazy-el', targetTimeout: 5000 }

// Use retry strategy
{ missingTargetStrategy: 'retry' }

// Navigate to the right route before the step renders
{ beforeEnter: async () => await router.push('/target-page') }
```

### `INVALID_CONFIG`

**Symptom:** Tour doesn't start; dev console shows a config warning.

**Fix:** Check that all steps have unique `id` values, valid `type` values, and a `target` for non-modal steps.

### `TIMEOUT`

**Symptom:** Step with an async `beforeEnter` is skipped unexpectedly.

**Fix:** Ensure the async operation in `beforeEnter` resolves promptly. If it depends on network requests, add a timeout guard:

```ts
beforeEnter: async () => {
  await Promise.race([
    router.push('/settings'),
    new Promise((_, reject) => setTimeout(() => reject(new Error('nav timeout')), 4000)),
  ]);
},
```

---

## Related

- [TourConfig — onError](../api/tour-config.md#lifecycle-callbacks)
- [Execution Model — Missing Target Strategy](../core-concepts/execution-model.md#missing-target-strategy)
