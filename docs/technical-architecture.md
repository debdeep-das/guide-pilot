# GuidePilot — Technical Architecture

## Design Principles

1. **SSR-safe by default** — No DOM APIs at module load or render time. All DOM access is guarded by `typeof window !== 'undefined'` and lives in `useEffect` / event handlers only.

2. **MFE-first state model** — The canonical tour state lives in a plain-JS module-level singleton (`tourStore.ts`), not in React context. This means `useTour()` works across multiple React roots on the same page without requiring a shared Provider.

3. **Zero-dependency CSS** — All styles use vanilla CSS with `--guide-pilot-*` custom properties. No CSS-in-JS, no styled-components, no Tailwind dependency.

4. **Pure utility functions** — DOM scanning, step merging, ID generation, sanitization are all pure functions that take explicit inputs. They are independently testable in JSDOM without mounting any React component.

5. **Graceful degradation** — An error boundary wraps the step renderer. If anything throws, the tour stops cleanly and the app remains fully functional.

---

## Module Map

```
guide-pilot/
├── src/
│   ├── index.ts                        Public barrel — all exports consumers use
│   ├── types.ts                        All TypeScript interfaces and enums
│   │
│   ├── store/
│   │   └── tourStore.ts                Module-level singleton pub/sub store
│   │                                   Holds TourState, tourRegistry, subscribers
│   │                                   Used by Provider and useTour() for cross-root sharing
│   │
│   ├── context/
│   │   ├── GuidePilotContext.ts        React.createContext — default value is null
│   │   └── GuidePilotProvider.tsx      Provider component
│   │                                   Subscribes to tourStore
│   │                                   Renders StepRenderer when tour is active
│   │                                   Manages portalTarget, className overrides
│   │
│   ├── hooks/
│   │   ├── useTour.ts                  Public hook — reads from tourStore, exposes actions
│   │   ├── useStepScanner.ts           Triggers domScanner on startTour(); manages watchDom MutationObserver
│   │   ├── useScrollIntoView.ts        scrollIntoView wrapper with scroll container detection
│   │   └── useKeyboardNav.ts           keydown listener for arrow keys and Escape
│   │
│   ├── components/
│   │   ├── StepRenderer.tsx            Routes to Tooltip|Spotlight|InlineHint|Modal by step.type
│   │   ├── StepContent.tsx             Shared title, body, progress indicator, nav buttons
│   │   ├── Portal.tsx                  ReactDOM.createPortal to portalTarget or document.body
│   │   ├── GuidePilotErrorBoundary.tsx Class component — catches throws, calls stopTour()
│   │   │
│   │   ├── Tooltip/
│   │   │   └── Tooltip.tsx             useFloating, strategy:'fixed', arrow middleware
│   │   │
│   │   ├── Spotlight/
│   │   │   ├── Spotlight.tsx           Combines SpotlightOverlay + positioned StepContent
│   │   │   └── SpotlightOverlay.tsx    Full-viewport SVG with <mask> cutout
│   │   │
│   │   ├── InlineHint/
│   │   │   └── InlineHint.tsx          useFloating, strategy:'absolute', no overlay
│   │   │
│   │   └── Modal/
│   │       └── Modal.tsx               position:fixed centered dialog, focus trap
│   │
│   ├── utils/
│   │   ├── domScanner.ts               querySelectorAll('[data-guide-pilot-tour]') → TourStep[]
│   │   ├── mergeSteps.ts               Merges data-attr steps with programmatic config steps
│   │   ├── elementRect.ts              getBoundingClientRect + scroll offset normalization
│   │   ├── generateId.ts               Deterministic step ID from tourId + order
│   │   ├── waitForElement.ts           Polling loop with timeout for lazy-mounted targets
│   │   ├── sanitizeHtml.ts             Allowlist HTML sanitizer (~200 lines, no dependency)
│   │   ├── stackingContext.ts          Dev-mode DOM walk to detect stacking context traps
│   │   └── devWarnings.ts             console.warn wrappers — no-op in production
│   │
│   ├── bridge/
│   │   ├── index.ts                    createGuidePilotBridge({ mode }) factory
│   │   ├── host.ts                     Host bridge — window.addEventListener('message')
│   │   ├── guest.ts                    Guest bridge — postMessage to parent
│   │   └── protocol.ts                 BridgeMessage type definitions
│   │
│   └── styles/
│       └── guide-pilot.css             All visual styles via --guide-pilot-* CSS custom properties
```

---

## Data Flow

```
User calls startTour('onboarding')
  │
  ▼
useTour().startTour(input)
  ├── normalises input → TourConfig
  └── tourStore.dispatch({ type: 'START_TOUR', ... })
        │
        ▼
        tourStore notifies all subscribers
          │
          ▼
          GuidePilotProvider re-renders (subscribed via useSyncExternalStore)
            │
            ▼
            useStepScanner.scan(tourId, rootEl)
              ├── domScanner.scanForSteps(tourId, root) → raw TourStep[]
              └── mergeSteps(dataScanSteps, configSteps) → final TourStep[]
                    │
                    ▼
                    tourStore.setSteps(resolvedSteps)
                      │
                      ▼
                      For currentStep:
                        waitForElement(step.target, { timeout })
                          │
                          ▼
                          element found → useScrollIntoView(element)
                            │
                            ▼
                            StepRenderer renders via Portal
                              │
                              ├── StepType.Tooltip    → <Tooltip>
                              ├── StepType.Spotlight  → <Spotlight>
                              ├── StepType.InlineHint → <InlineHint>
                              └── StepType.Modal      → <Modal>
                                    │
                                    ▼
                                    <StepContent> (shared title/body/nav)
```

---

## State Machine

### TourStatus Transitions

```
         startTour()
Idle ──────────────────► Running
 ▲                          │
 │                    skipTour()│
 │                          ▼  │
 │              Skipped ◄───────┘
 │
 │                   nextStep() on last step
 └───── Completed ◄──────────────────────────
                          │
                  stopTour()│
                          ▼
                        Idle
```

### TourReducer Actions

```typescript
type TourAction =
  | { type: 'START_TOUR';   tourId: string; steps: TourStep[]; startFrom: number }
  | { type: 'SET_STEPS';    steps: TourStep[] }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP';   index: number }
  | { type: 'SKIP_TOUR' }
  | { type: 'STOP_TOUR' }
  | { type: 'COMPLETE_TOUR' };
```

All transitions are pure functions — the reducer returns a new `TourState` without side effects.

---

## External Singleton Store (`tourStore.ts`)

### Why It Exists

React context only propagates within a single React root. In Module Federation setups with multiple React roots on the same page, `useTour()` in MFE-B cannot reach a `<GuidePilotProvider>` mounted in MFE-A's root.

By holding state in a module-level JS object (outside React), any component in any React root that imports `guide-pilot` shares the same live state — as long as Module Federation is configured with `singleton: true`.

### Architecture

```typescript
// tourStore.ts — simplified
interface TourStore {
  getState(): TourState;
  dispatch(action: TourAction): void;
  subscribe(listener: () => void): () => void;  // returns unsubscribe fn
  getRegistry(): Map<string, TourConfig>;
  registerTour(config: TourConfig): void;
}

export const tourStore: TourStore = createTourStore();
```

### React Integration

`GuidePilotProvider` and `useTour` use React 18's `useSyncExternalStore` to subscribe to `tourStore`:

```typescript
const state = useSyncExternalStore(
  tourStore.subscribe,
  tourStore.getState,
  tourStore.getState,  // server snapshot — returns initial state
);
```

This gives tear-free rendering in Concurrent Mode and correct SSR snapshots.

---

## DOM Scanner (`domScanner.ts`)

### Attribute Discovery

```typescript
export function scanForSteps(tourId: string, root: Element): TourStep[] {
  const elements = root.querySelectorAll('[data-guide-pilot-tour]');
  const steps: TourStep[] = [];

  elements.forEach((el) => {
    const ds = (el as HTMLElement).dataset;
    if (ds.guidePilotTour !== tourId) return;

    // Stamp element with a stable ID for target resolution
    if (!ds.guidePilotId) {
      ds.guidePilotId = generateId(tourId, ds.guidePilotStep ?? '');
    }

    steps.push({
      id:               ds.guidePilotId,
      order:            parseInt(ds.guidePilotStep ?? '0', 10),
      type:             (ds.guidePilotType as StepType) ?? StepType.Tooltip,
      title:            ds.guidePilotTitle,
      content:          ds.guidePilotContent ?? '',
      target:           `[data-guide-pilot-id="${ds.guidePilotId}"]`,
      placement:        ds.guidePilotPlacement as StepPlacement,
      spotlightPadding: ds.guidePilotSpotlightPadding
                          ? parseInt(ds.guidePilotSpotlightPadding, 10)
                          : undefined,
    });
  });

  return steps.sort((a, b) => a.order - b.order);
}
```

### Step Merging

When both data-attr steps and programmatic steps exist for the same tour, `mergeSteps` combines them. Programmatic steps take precedence on `id` collision:

```typescript
export function mergeSteps(
  scanSteps: TourStep[],
  configSteps: TourStep[]
): TourStep[] {
  const map = new Map<string, TourStep>();
  scanSteps.forEach(s => map.set(s.id, s));
  configSteps.forEach(s => map.set(s.id, { ...map.get(s.id), ...s }));
  return Array.from(map.values()).sort((a, b) => a.order - b.order);
}
```

---

## Positioning System

### Tooltip and InlineHint

Both use `@floating-ui/react` with `strategy: 'fixed'` so they render relative to the viewport and escape any CSS containment:

```typescript
const { refs, floatingStyles, middlewareData } = useFloating({
  placement: step.placement ?? config.defaultPlacement ?? 'bottom',
  strategy:  'fixed',
  middleware: [
    offset(step.offset ?? 12),
    flip({ fallbackAxisSideDirection: 'start' }),
    shift({ padding: 8 }),
    arrow({ element: arrowRef }),
  ],
  whileElementsMounted: autoUpdate,
});
```

`autoUpdate` automatically recomputes position on scroll, resize, and element layout changes — no manual recalculation needed.

### Spotlight Overlay

The overlay is a full-viewport SVG rendered via Portal:

```
<svg
  position: fixed
  width: 100vw
  height: window.innerHeight   ← not 100vh (avoids iOS Safari URL bar issues)
  pointer-events: all
>
  <defs>
    <mask id="guide-pilot-mask">
      <rect width="100%" height="100%" fill="white"/>  ← everything visible
      <rect                                             ← the "hole"
        x={rect.left - padding}
        y={rect.top - padding}
        width={rect.width + padding*2}
        height={rect.height + padding*2}
        rx={borderRadius}
        fill="black"
      />
    </mask>
  </defs>
  <rect
    width="100%"
    height="100%"
    fill={overlayColor}
    mask="url(#guide-pilot-mask)"
  />
</svg>
```

The hole rect uses CSS transitions so position changes animate smoothly when stepping through spotlight steps.

### `allowInteraction` Pointer Events

```
┌─────────────────────────────────────────────────┐
│  SVG overlay (pointer-events: all)               │  ← blocks clicks
│  ┌──────────────────────────┐                    │
│  │  target element area     │  ← pointer-events: none on SVG hole
│  │  (DOM element is on top, │     DOM element is naturally clickable
│  │   fully interactive)     │
│  └──────────────────────────┘                    │
└─────────────────────────────────────────────────┘
```

When `allowInteraction: false` (default), a transparent `<div>` click-blocker is overlaid on the spotlight cutout to prevent interaction.

---

## `waitForElement` Utility

```typescript
export function waitForElement(
  selector: string,
  options: { timeout?: number; interval?: number; root?: Element } = {}
): Promise<Element> {
  const { timeout = 3000, interval = 100, root = document } = options;

  return new Promise((resolve, reject) => {
    const el = root.querySelector(selector);
    if (el) { resolve(el); return; }

    let elapsed = 0;
    const timer = setInterval(() => {
      const found = root.querySelector(selector);
      if (found) { clearInterval(timer); resolve(found); return; }
      elapsed += interval;
      if (elapsed >= timeout) {
        clearInterval(timer);
        reject(new GuidePilotError('ELEMENT_NOT_FOUND', selector));
      }
    }, interval);
  });
}
```

The interval is cleared on both resolution and rejection. The Provider also cancels pending `waitForElement` promises when the tour is stopped or the step changes.

---

## Z-Index System

### Three-Layer Tokens

```css
:root {
  --guide-pilot-z-overlay:  var(--guide-pilot-z-base, 9000);
  --guide-pilot-z-content:  calc(var(--guide-pilot-z-base, 9000) + 1);
  --guide-pilot-z-arrow:    calc(var(--guide-pilot-z-base, 9000) + 2);
}
```

When `TourConfig.zIndex` is set, the Provider injects an inline `<style>` scoped to the active tour that overrides `--guide-pilot-z-base`.

### Stacking Context Detection

`stackingContext.ts` walks the DOM upward from `document.body`, checking for properties that create new stacking contexts (`transform`, `filter`, `opacity < 1`, `will-change`, `isolation`). In development, a `console.warn` is emitted identifying the offending element and suggesting the `portalTarget` escape hatch.

---

## MFE Architecture

### Same-Document (Module Federation)

```
document
├── React Root A (Shell)
│     └── GuidePilotProvider (subscribes to tourStore)
│             ↓ renders via Portal
│             StepRenderer → Tooltip/Spotlight/Modal
│
├── React Root B (MFE-Nav)
│     └── useTour() reads from tourStore directly
│             (no Provider needed in this root)
│
└── React Root C (MFE-Main)
      └── data-guide-pilot-* elements
              (discovered by domScanner querying document)

tourStore (module singleton — shared across all roots via MF singleton: true)
```

### iframed MFEs (postMessage Bridge)

```
Shell document
  GuidePilotProvider (authoritative state)
  bridge.listen() ─────────────────────────────────────────────────┐
                                                                    │
  ┌─── iframe: MFE-Nav ────────────────────────────┐               │
  │  GuidePilotProvider (renders local steps only) │               │
  │  bridge.connect(window.parent) ────────────────┼──postMessage──┘
  │  data-guide-pilot-* elements                   │
  └────────────────────────────────────────────────┘
```

**Message protocol:**

```typescript
type BridgeMessage =
  | { type: 'GUIDE_PILOT_REGISTER';   tourId: string; steps: TourStep[] }
  | { type: 'GUIDE_PILOT_STEP_ENTER'; tourId: string; stepId: string }
  | { type: 'GUIDE_PILOT_NEXT' }
  | { type: 'GUIDE_PILOT_PREV' }
  | { type: 'GUIDE_PILOT_SKIP' }
  | { type: 'GUIDE_PILOT_ACK';        stepId: string };
```

When the host advances to a step owned by a guest iframe, it sends `GUIDE_PILOT_STEP_ENTER` to that frame. The guest renders its local tooltip/spotlight and sends `GUIDE_PILOT_ACK` when ready. The host waits for the ack before showing navigation controls.

---

## SSR Safety Model

All DOM access follows the same guard pattern:

```typescript
const isBrowser = typeof window !== 'undefined';

// In hooks:
useEffect(() => {
  if (!isBrowser) return;
  // DOM access here
}, []);

// In utilities:
export function waitForElement(selector: string) {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('[GuidePilot] waitForElement called during SSR'));
  }
  // ...
}
```

`GuidePilotProvider` returns `null` for the portal/overlay subtree during SSR, so there is no server-rendered HTML for the tour UI — no hydration mismatch.

The `package.json` exports map includes a `"react-server"` condition that exports a minimal no-op stub, ensuring zero bundle cost in React Server Components.

---

## Security Model

### XSS Prevention

Step `content` is treated as **plain text by default**:

```tsx
<p>{step.content}</p>  // React auto-escapes — XSS safe
```

When `step.contentType === 'html'`, `sanitizeHtml(step.content)` is called before `dangerouslySetInnerHTML`:

```typescript
// sanitizeHtml.ts allowlist
const ALLOWED_TAGS = new Set(['b', 'i', 'strong', 'em', 'a', 'br', 'code', 'p', 'ul', 'ol', 'li', 'span']);
const ALLOWED_ATTRS = new Set(['href', 'class']);

// Strips: <script>, <style>, on* attributes, data: URIs, javascript: hrefs
```

The sanitizer is implemented as ~200 lines of vanilla TypeScript using a regex + DOM parser pipeline — no external dependency (no DOMPurify) to keep the bundle lean.

### `aria-describedby` Injection Cleanup

When the library injects `aria-describedby` onto a target element, it records the original value and restores it precisely when the step ends:

```typescript
const prev = el.getAttribute('aria-describedby');
el.setAttribute('aria-describedby', tooltipId);
// on cleanup:
prev ? el.setAttribute('aria-describedby', prev) : el.removeAttribute('aria-describedby');
```

---

## Build Output

```
dist/
├── guide-pilot.es.js        ESM — for Vite, Webpack, Rollup (tree-shakeable)
├── guide-pilot.es.js.map    Source map
├── guide-pilot.cjs.js       CommonJS — for Jest, Node.js, older toolchains
├── guide-pilot.cjs.js.map   Source map
├── guide-pilot.css          Extracted CSS — import 'guide-pilot/styles'
├── guide-pilot.bridge.es.js Optional bridge for iframed MFEs
└── types/
    └── index.d.ts           TypeScript declarations for all public API
```

**Vite library config key settings:**

```typescript
build: {
  lib: {
    entry:   { index: 'src/index.ts', bridge: 'src/bridge/index.ts' },
    formats: ['es', 'cjs'],
  },
  rollupOptions: {
    external:  ['react', 'react-dom', 'react/jsx-runtime'],
    output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } },
  },
  sourcemap:     true,
  cssCodeSplit:  false,
}
```

**Bundle size targets:**

| Bundle | Gzip target |
|---|---|
| `guide-pilot.es.js` | < 25 KB |
| `guide-pilot.cjs.js` | < 30 KB |
| `guide-pilot.bridge.es.js` | < 5 KB |
| `guide-pilot.css` | < 5 KB |

A `bundlesize` CI check fails the build if any target is exceeded.

---

## Testing Strategy

### Unit Tests (`tests/unit/`)

Test pure utility functions in isolation using JSDOM:

- `domScanner.test.ts` — attribute parsing, sort order, duplicate order handling, tour ID filtering
- `mergeSteps.test.ts` — data-attr + config merge, conflict resolution, sort
- `sanitizeHtml.test.ts` — allowlist enforcement, XSS payload stripping, safe tags preserved
- `waitForElement.test.ts` — resolves when element appears, rejects on timeout, clears timer
- `tourReducer.test.ts` — all state transitions exhaustively, invalid transitions are no-ops

### Integration Tests (`tests/integration/`)

Mount components with React Testing Library:

- `Tooltip.test.tsx` — renders near target, correct placement, updates on step change
- `Spotlight.test.tsx` — SVG renders, cutout rect matches target, `allowInteraction` pointer events
- `Modal.test.tsx` — focus trap works, aria attributes correct, closes on Escape
- `InlineHint.test.tsx` — no overlay rendered, positioned correctly
- `useTour.test.tsx` — startTour, nextStep, prevStep, skipTour, goToStep, error outside Provider

### E2E Tests (`tests/e2e/`)

Playwright tests against the demo app:

- Full onboarding tour — all 4 step types in sequence
- Keyboard navigation — arrows and Escape
- Data-attribute-only tour (no JS config)
- Skip tour, resume from specific step
- Dynamic element test — step targets element that appears after 500ms delay
- MFE test — tour spanning two React roots on same page

### Test Utilities Exported for Consumers

```typescript
import { createMockTourStore, renderWithGuidePilot } from 'guide-pilot/test-utils';
```

Allows consumers to write their own integration tests without fighting with Provider setup.
