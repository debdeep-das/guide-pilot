# Execution Model

This document describes how GuidePilot resolves, orders, and executes tour steps — and what guarantees you can rely on.

---

## High-Level Flow

```
startTour()
  → tourStore.dispatch()
  → Provider re-renders
  → Step scanning + merging
  → waitForElement()
  → StepRenderer (Portal)
```

---

## Step Resolution

When a tour is started, GuidePilot collects steps from two sources and merges them:

1. **DOM scan** — elements with matching `data-guide-pilot-tour` attributes on the current document
2. **Registered config** — steps defined in `TourConfig.steps` or via `registerTour()`

**Merge rules:**
- Steps from both sources are combined into a single list
- If a DOM step and a config step share the same `id`, the config step wins
- The merged list is sorted by `order` before execution begins

---

## Step Ordering

- Steps execute in ascending `order` value
- If two steps have the same `order`, the last one registered wins
- Order values do not need to be contiguous — gaps are fine

```ts
// These execute as: step-a (1), step-b (2), step-c (5)
steps: [
  { id: 'step-c', order: 5, ... },
  { id: 'step-a', order: 1, ... },
  { id: 'step-b', order: 2, ... },
]
```

---

## Step Lifecycle

Each step follows a strict sequence:

```
beforeEnter → render → user interaction → afterLeave
```

| Phase | Description |
|---|---|
| `beforeEnter` | Async hook — awaited before the step renders. Use for route changes, async data loads, etc. |
| `render` | StepRenderer mounts the tooltip/spotlight/modal via Portal |
| `user interaction` | User navigates (next/prev/skip) or interacts with the highlighted element |
| `afterLeave` | Sync hook — fires after the step is torn down |

**Async `beforeEnter`:**

```ts
{
  id: 'step-2',
  target: '#dashboard',
  beforeEnter: async () => {
    await router.push('/dashboard');
    await waitForElement('#dashboard');
  },
}
```

**Cancellation:** If the user navigates away while `beforeEnter` is still running, the promise is abandoned and the tour moves on immediately. `afterLeave` is not called for a step that never rendered.

---

## Navigation Guarantees

| Action | Behaviour |
|---|---|
| `nextStep()` at the last step | No-op |
| `prevStep()` at step 0 | No-op |
| `goToStep(n)` | Clamped to `[0, totalSteps - 1]` |
| `goToStep(currentIndex)` | Re-renders the current step (triggers lifecycle) |
| Navigation during `beforeEnter` | Cancels the pending hook, advances immediately |

All navigation actions are **deterministic** — the same input always produces the same state transition regardless of timing.

---

## Missing Target Strategy

If a step's `target` selector matches no element when the step is about to render, the `missingTargetStrategy` on the tour config controls what happens:

| Strategy | Behaviour |
|---|---|
| `skip` | Skip the step and advance to the next one (default) |
| `retry` | Poll for the element until `targetTimeout` is exceeded, then skip |
| `fail` | Stop the entire tour and fire `onError` with `ELEMENT_NOT_FOUND` |

```ts
const tour: TourConfig = {
  id: 'my-tour',
  missingTargetStrategy: 'retry',
};
```

Per-step timeout (applies when strategy is `retry`):

```ts
{
  target: '#lazy-widget',
  targetTimeout: 5000,  // ms, default: 3000
}
```

---

## External Singleton Store

GuidePilot state lives in a **module-level singleton**, not React context. This is intentional:

- Works across multiple React roots (Module Federation, multiple `ReactDOM.render` calls)
- State is shared automatically without explicit wiring
- The `GuidePilotProvider` subscribes via `useSyncExternalStore` for concurrent safety

```ts
interface TourStore {
  getState(): TourState;
  dispatch(action: TourAction): void;
  subscribe(listener: () => void): () => void;

  registerTour(config: TourConfig): void;
  getRegistry(): Map<string, TourConfig>;
}
```

The store is tree-shakeable and has no dependency on React.
