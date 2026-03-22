# GuidePilot — Developer's Guide

## Installation

```bash
npm install guide-pilot
# or
yarn add guide-pilot
# or
pnpm add guide-pilot
```

**Requirements:** React 18+, react-dom 18+

---

For architecture internals — module map, data flow, state machine, positioning system, and build output — see [Technical Architecture](technical-architecture.md). For execution rules and step lifecycle, see [Execution Model](core-concepts/execution-model.md).

---

## Quick Start — Zero Config (Data Attributes)

The fastest way to add a tour — no JavaScript tour definition required.

**Step 1: Wrap your app with the Provider**

```tsx
// main.tsx or _app.tsx
import { GuidePilotProvider } from 'guide-pilot';
import 'guide-pilot/styles';

export default function App() {
  return (
    <GuidePilotProvider>
      <YourApp />
    </GuidePilotProvider>
  );
}
```

**Step 2: Annotate your elements**

```html
<button
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="1"
  data-guide-pilot-title="Create a project"
  data-guide-pilot-content="Click here to create your first project."
  data-guide-pilot-placement="bottom"
>
  New Project
</button>

<nav
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="2"
  data-guide-pilot-type="spotlight"
  data-guide-pilot-title="Your navigation"
  data-guide-pilot-content="Use these links to move between sections."
>
  ...
</nav>
```

**Step 3: Start the tour**

```tsx
import { useTour } from 'guide-pilot';

function OnboardingButton() {
  const { startTour } = useTour();
  return (
    <button onClick={() => startTour('onboarding')}>
      Take a tour
    </button>
  );
}
```

---

## Quick Start — Programmatic Config

Define tours as TypeScript objects for full control:

```tsx
import { GuidePilotProvider, useTour, TourConfig, StepType } from 'guide-pilot';
import 'guide-pilot/styles';

const onboardingTour: TourConfig = {
  id: 'onboarding',
  allowSkip: true,
  onComplete: () => localStorage.setItem('onboarding_done', '1'),
  steps: [
    {
      id: 'step-1',
      order: 1,
      type: StepType.Tooltip,
      target: '#new-project-btn',
      title: 'Create a project',
      content: 'Click here to create your first project.',
      placement: 'bottom',
    },
    {
      id: 'step-2',
      order: 2,
      type: StepType.Spotlight,
      target: '#project-name-input',
      title: 'Name your project',
      content: 'Give it a memorable name.',
      allowInteraction: true,
    },
  ],
};

function App() {
  return (
    <GuidePilotProvider tours={[onboardingTour]}>
      <YourApp />
    </GuidePilotProvider>
  );
}

function StartButton() {
  const { startTour } = useTour();
  return <button onClick={() => startTour('onboarding')}>Start tour</button>;
}
```

---

## Quick Start — Inline Steps

Pass steps directly to `startTour()`. No pre-registration or config file needed:

```tsx
import { useTour } from 'guide-pilot';

function QuickTourButton() {
  const { startTour } = useTour();

  const handleClick = () => {
    startTour([
      {
        id: 'step-1',
        target: '#save-btn',
        content: 'Click here to save your work.',
        placement: 'top',
      },
      {
        id: 'step-2',
        target: '#share-btn',
        content: 'Share with your team.',
        placement: 'left',
      },
    ]);
  };

  return <button onClick={handleClick}>Show me around</button>;
}
```

---

## Step Type Examples

### Tooltip (default)

```tsx
{
  id: 'tooltip-step',
  target: '#submit-btn',
  type: StepType.Tooltip,
  title: 'Submit your form',
  content: 'When you\'re ready, click here to submit.',
  placement: 'top',
  offset: 8,
}
```

### Spotlight

```tsx
{
  id: 'spotlight-step',
  target: '#analytics-chart',
  type: StepType.Spotlight,
  title: 'Your analytics',
  content: 'This chart shows your activity over the last 30 days.',
  spotlightPadding: 16,
}
```

### Interactive Spotlight

Lets the user interact with the highlighted element while the overlay is active:

```tsx
{
  id: 'interactive-step',
  target: '#search-input',
  type: StepType.Spotlight,
  title: 'Try searching',
  content: 'Type a project name to search.',
  allowInteraction: true,
}
```

### Inline Hint

Non-blocking — no overlay, doesn't interrupt the user's workflow:

```tsx
{
  id: 'hint-step',
  target: '#help-icon',
  type: StepType.InlineHint,
  content: 'Click here any time for help.',
  placement: 'right',
}
```

### Modal

Not tied to any element — used for welcome/summary steps:

```tsx
{
  id: 'welcome-step',
  type: StepType.Modal,
  title: 'Welcome to Acme!',
  content: 'Let us show you the key features. This will take about 2 minutes.',
  nextButtonLabel: 'Let\'s go!',
}
```

---

## Provider Props

```tsx
<GuidePilotProvider
  tours={[onboardingTour, featureTour]}  // Pre-registered tour configs
  scanOnMount={true}                      // Scan data-attrs on mount (default: true)
  scanRoot="body"                         // CSS selector for scan root (default: 'body')
  watchDom={false}                        // MutationObserver mode (default: false)
  portalTarget={document.getElementById('guide-pilot-root')}  // Custom portal target
  tooltipClassName="my-tooltip"           // Global className for tooltips
  overlayClassName="my-overlay"           // Global className for overlay
>
  {children}
</GuidePilotProvider>
```

---

## useTour() API Reference

```typescript
const {
  // State
  isActive,           // boolean — is a tour currently running?
  activeTourId,       // string | null
  currentStep,        // TourStep | null
  currentStepIndex,   // number (0-based)
  totalSteps,         // number
  isFirstStep,        // boolean
  isLastStep,         // boolean
  status,             // TourStatus enum

  // Actions
  startTour,          // (tourId | steps[] | TourConfig) => void
  stopTour,           // () => void
  nextStep,           // () => void
  prevStep,           // () => void
  goToStep,           // (index: number) => void  — 0-based
  skipTour,           // () => void
  registerTour,       // (config: TourConfig) => void  — runtime registration
} = useTour();
```

**Guarantees:**

- SSR-safe — returns idle state and no-op actions during server render
- Never throws in production — errors are routed to `onError` or swallowed silently
- Idempotent actions — calling `nextStep()` at the last step does nothing
- Safe outside `<GuidePilotProvider>` — returns no-op actions and logs a dev-mode warning; does not throw

---

## TypeScript Type Reference

### TourConfig

```ts
interface TourConfig {
  id: string;
  steps?: TourStep[];

  defaultPlacement?: StepPlacement;
  zIndex?: number;

  missingTargetStrategy?: 'skip' | 'retry' | 'fail';  // default: 'skip'

  allowSkip?: boolean;
  allowKeyboardNavigation?: boolean;
  tooltipClassName?: string;
  overlayClassName?: string;

  onStart?: () => void;
  onStepChange?: (step: TourStep, index: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  onError?: (error: GuidePilotError) => void;
}
```

### TourStep

```ts
interface TourStep {
  id: string;
  order: number;
  target: string;                    // CSS selector

  title?: string;
  content?: string;
  contentType?: 'text' | 'html';    // default: 'text'. HTML requires explicit opt-in.

  type?: 'tooltip' | 'spotlight' | 'modal' | 'inline';  // default: 'tooltip'

  placement?: StepPlacement;
  offset?: number;

  spotlightPadding?: number;
  allowInteraction?: boolean;

  targetTimeout?: number;            // ms to wait for element (default: 3000)
  nextButtonLabel?: string;

  beforeEnter?: () => Promise<void> | void;
  afterLeave?: () => void;
}
```

### StepPlacement

```ts
type StepPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'
  | 'auto';
```

### TourState

```ts
interface TourState {
  status: TourStatus;
  activeTourId: string | null;
  currentStepIndex: number;
  steps: TourStep[];
}

enum TourStatus {
  Idle     = 'idle',
  Running  = 'running',
  Paused   = 'paused',
  Complete = 'complete',
  Skipped  = 'skipped',
  Error    = 'error',
}
```

### GuidePilotError

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

---

## Execution Rules

### Step Ordering

- Steps execute in ascending `order` value
- If two steps share the same `order`, the last one registered wins
- The final step list is always sorted before execution begins

### Step Resolution

When a tour is started, GuidePilot merges steps from two sources:

1. **DOM scan** — elements with `data-guide-pilot-tour="<id>"` attributes
2. **Registered config** — steps passed via `TourConfig.steps` or `registerTour()`

Programmatic config overrides DOM steps with the same `id`. Steps from both sources are merged and sorted by `order` before the tour runs.

### Navigation Guarantees

- `nextStep`, `prevStep`, and `goToStep` are deterministic — same input always produces the same state transition
- Navigation cancels any pending `beforeEnter` async hooks from the previous step
- `goToStep(index)` is 0-based and clamped to `[0, totalSteps - 1]`
- Calling `prevStep()` at step 0, or `nextStep()` at the last step, is a no-op

### Step Lifecycle

Each step follows this sequence:

```
beforeEnter → render → user interaction → afterLeave
```

- `beforeEnter` runs before the step is rendered. Async variants are awaited.
- `afterLeave` runs after the step is torn down (navigation or skip).
- Navigating away while `beforeEnter` is still running cancels the promise and moves on.

---

## Missing Target Strategy

When GuidePilot cannot find a step's target element, the `missingTargetStrategy` on the tour config controls what happens:

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

Override the wait timeout per step:

```typescript
{
  target: '#lazy-widget',
  targetTimeout: 5000,  // ms (default: 3000)
}
```

For SPAs with dynamic routing, `watchDom={true}` on the Provider re-scans automatically when the DOM changes:

```tsx
<GuidePilotProvider watchDom={true}>
```

---

## Integration with Next.js

### App Router (Next.js 13+)

```tsx
// app/layout.tsx
import { GuidePilotProvider } from 'guide-pilot';
import 'guide-pilot/styles';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="guide-pilot-root" />  {/* optional portal target */}
        <GuidePilotProvider>
          {children}
        </GuidePilotProvider>
      </body>
    </html>
  );
}
```

The Provider is a Server Component-compatible wrapper — it renders nothing on the server. Client-side interactivity activates automatically after hydration.

### Pages Router (Next.js 12 and below)

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { GuidePilotProvider } from 'guide-pilot';
import 'guide-pilot/styles';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GuidePilotProvider>
      <Component {...pageProps} />
    </GuidePilotProvider>
  );
}
```

---

## Integration with Module Federation

When using Webpack Module Federation with multiple micro frontends on the same page:

**1. Configure `guide-pilot` as a shared singleton in every MFE and the shell:**

```javascript
// webpack.config.js (shell and all MFEs)
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        'guide-pilot': { singleton: true, requiredVersion: '^1.0.0' },
      },
    }),
  ],
};
```

**2. Mount one `<GuidePilotProvider>` in the shell app:**

```tsx
// Shell app
import { GuidePilotProvider } from 'guide-pilot';
import 'guide-pilot/styles';

function Shell() {
  return (
    <GuidePilotProvider>
      <MFENavApp />
      <MFEMainApp />
      <MFESidebarApp />
    </GuidePilotProvider>
  );
}
```

**3. In each MFE, just annotate elements — no Provider or `useTour` required:**

```html
<!-- MFE-Nav -->
<button
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="1"
  data-guide-pilot-content="Start here."
>Dashboard</button>

<!-- MFE-Main -->
<div
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="2"
  data-guide-pilot-content="This is your workspace."
></div>
```

The DOM scanner finds all steps across all MFE DOM nodes in one pass because it queries `document`, not the React tree.

---

## Integration with iframed MFEs

For tours that span across iframe boundaries, use the optional bridge:

```bash
# Bridge is included in the main package
import { createGuidePilotBridge } from 'guide-pilot/bridge';
```

**Shell (host):**

```tsx
import { GuidePilotProvider } from 'guide-pilot';
import { createGuidePilotBridge } from 'guide-pilot/bridge';
import 'guide-pilot/styles';

const bridge = createGuidePilotBridge({ mode: 'host' });

function Shell() {
  useEffect(() => {
    bridge.listen();
    return () => bridge.destroy();
  }, []);

  return (
    <GuidePilotProvider>
      <iframe src="/mfe-nav" />
      <iframe src="/mfe-main" />
    </GuidePilotProvider>
  );
}
```

**Each iframe MFE:**

```tsx
import { GuidePilotProvider } from 'guide-pilot';
import { createGuidePilotBridge } from 'guide-pilot/bridge';
import 'guide-pilot/styles';

const bridge = createGuidePilotBridge({ mode: 'guest', target: window.parent });

function MFEApp() {
  useEffect(() => {
    bridge.connect();
    return () => bridge.destroy();
  }, []);

  return (
    <GuidePilotProvider>
      {/* data-guide-pilot-* elements here */}
    </GuidePilotProvider>
  );
}
```

For single-iframe tours (no cross-frame coordination needed), just use a standard `<GuidePilotProvider>` inside the iframe.

---

## Theming Guide

### CSS Custom Properties

Import the default styles and override variables:

```css
/* your-styles.css */
@import 'guide-pilot/styles';

:root {
  /* Tooltip colours */
  --guide-pilot-tooltip-bg:         #1e1e2e;
  --guide-pilot-tooltip-color:      #cdd6f4;
  --guide-pilot-tooltip-border:     1px solid #313244;
  --guide-pilot-tooltip-radius:     12px;
  --guide-pilot-tooltip-shadow:     0 8px 32px rgba(0,0,0,0.4);

  /* Buttons */
  --guide-pilot-btn-primary-bg:     #cba6f7;
  --guide-pilot-btn-primary-color:  #1e1e2e;
  --guide-pilot-btn-ghost-color:    #a6adc8;

  /* Overlay */
  --guide-pilot-overlay-bg:         rgba(0, 0, 0, 0.7);
  --guide-pilot-spotlight-radius:   6px;

  /* Z-index (MUI apps should use 1600+) */
  --guide-pilot-z-base:             9000;
}
```

### Full Variable Reference

| Variable | Default | Purpose |
|---|---|---|
| `--guide-pilot-bg` | `#ffffff` | Tooltip/modal background |
| `--guide-pilot-color` | `#111827` | Tooltip/modal text colour |
| `--guide-pilot-border-radius` | `8px` | Corner radius |
| `--guide-pilot-shadow` | `0 4px 16px rgba(0,0,0,0.12)` | Drop shadow |
| `--guide-pilot-overlay-color` | `rgba(0,0,0,0.5)` | Spotlight/modal overlay |
| `--guide-pilot-z-base` | `9000` | Base z-index (overlay < content < arrow) |

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --guide-pilot-tooltip-bg:    #1f2937;
    --guide-pilot-tooltip-color: #f9fafb;
    --guide-pilot-tooltip-border: 1px solid #374151;
  }
}
```

### Tailwind Integration

Use `className` overrides alongside your Tailwind config:

```typescript
const tour: TourConfig = {
  id: 'onboarding',
  tooltipClassName: 'shadow-2xl border border-gray-200 rounded-xl font-sans',
};
```

### Customization Priority

CSS variables → `className` overrides → inline styles (highest priority)

### Replacing Default Styles Entirely

Skip importing `guide-pilot/styles` and provide your own stylesheet that defines all `--guide-pilot-*` variables.

---

## Accessibility

GuidePilot implements WCAG 2.1 AA requirements for interactive overlay components.

### ARIA Roles

| Step Type | Role |
|---|---|
| Tooltip | `role="tooltip"` |
| Spotlight | `role="dialog"` |
| Modal | `role="dialog"` with `aria-modal="true"` |
| InlineHint | `role="tooltip"` |

Step content is announced to screen readers via `aria-live="polite"` on the tour container. Navigation buttons are described via `aria-describedby` pointing to the current step content.

### Focus Management

**Modal steps:**
- Focus is trapped inside the modal — Tab cycles through focusable elements within it
- Focus returns to the previously focused element when the modal closes

**Spotlight and Tooltip steps:**
- Focus moves to the tooltip/overlay on render
- Focus returns to the trigger element (or document body) on close

### Keyboard Navigation

| Key | Action |
|---|---|
| `→` / `Tab` | Next step |
| `←` / `Shift+Tab` | Previous step |
| `Escape` | Skip / close tour |

**Disable keyboard navigation:**

```typescript
const tour: TourConfig = {
  id: 'onboarding',
  allowKeyboardNavigation: false,
};
```

**Touch / swipe navigation:** Left/right swipe gestures are enabled by default on mobile.

---

## Performance Guarantees

| Operation | Guarantee |
|---|---|
| DOM scan (200 elements) | < 16ms |
| MutationObserver debounce | ≥ 50ms (batches rapid DOM changes) |
| Re-renders per step transition | StepRenderer only — no Provider re-render |
| Layout reads | Batched — no forced synchronous layout (no thrashing) |

`watchDom={true}` uses a debounced `MutationObserver`. The debounce interval (default 50ms) is intentional — it prevents re-scanning on every individual DOM mutation during large renders.

---

## Error Handling

### Error Types

```ts
type GuidePilotErrorType =
  | 'ELEMENT_NOT_FOUND'   // target selector matched nothing within targetTimeout
  | 'INVALID_CONFIG'      // malformed TourConfig or TourStep
  | 'TIMEOUT'             // async beforeEnter hook exceeded timeout
  | 'RENDER_FAILURE';     // StepRenderer threw during render
```

### Dev vs Production Behaviour

| Context | Behaviour |
|---|---|
| Development | Console warning with error type, step ID, and actionable message |
| Production | Silent fail — tour stops, `onError` callback fired if provided |

GuidePilot never throws unhandled exceptions. Errors are always routed through `onError` or swallowed.

### onError Callback

```ts
const tour: TourConfig = {
  id: 'onboarding',
  onError: (error: GuidePilotError) => {
    // error.type, error.message, error.stepId, error.tourId
    myLogger.warn('Tour error', error);
  },
};
```

---

## Security

### Content Rendering

By default, all step content is treated as **plain text**. Content is rendered as a text node — no HTML interpretation occurs.

To render HTML content, you must explicitly opt in per step:

```ts
{
  id: 'rich-step',
  content: 'Click <strong>here</strong> to continue.',
  contentType: 'html',  // must be explicitly set
}
```

### Sanitization Rules

When `contentType: 'html'` is used, GuidePilot sanitizes the HTML before rendering:

- `<script>` and `<style>` tags are stripped entirely
- Inline event handlers (`onclick`, `onmouseover`, etc.) are removed
- `javascript:` URLs in `href` and `src` attributes are blocked
- `data:` URLs are blocked

### Hard Constraints

- No `eval()` or `new Function()` is used internally
- No dynamic script injection
- Sanitization runs on every render — it is not skipped even if content appears unchanged

---

## Common Z-Index Configurations

If your app uses a UI library with high z-index values, set `--guide-pilot-z-base` accordingly:

| Your UI library | Set `--guide-pilot-z-base` to |
|---|---|
| MUI / Material UI | `1600` |
| Ant Design | `1100` |
| Chakra UI | `1500` |
| Bootstrap | `1100` |
| Custom (unknown) | `9000` (default) |

```css
:root { --guide-pilot-z-base: 1600; }
```

---

## Testing Utilities

GuidePilot ships test helpers for unit and integration tests.

### Mock Store

```ts
import { createMockTourStore } from 'guide-pilot/testing';

const mockStore = createMockTourStore({
  status: TourStatus.Running,
  activeTourId: 'onboarding',
  currentStepIndex: 0,
  steps: [{ id: 'step-1', order: 1, target: '#btn', content: 'Hello' }],
});
```

### Render Helper

Wraps a component in a `GuidePilotProvider` backed by a mock store:

```ts
import { renderWithTour } from 'guide-pilot/testing';

it('renders the start button', () => {
  const { getByText } = renderWithTour(<StartButton />, {
    store: createMockTourStore(),
  });
  expect(getByText('Start tour')).toBeInTheDocument();
});
```

### Simulating Tour Events

```ts
import { createMockTourStore } from 'guide-pilot/testing';

const store = createMockTourStore();

// Simulate tour start
store.dispatch({ type: 'START_TOUR', tourId: 'onboarding' });

// Assert
expect(store.getState().status).toBe(TourStatus.Running);
```

---

## Versioning Policy

GuidePilot follows [Semantic Versioning](https://semver.org/).

### Breaking Changes (major version bump)

- Renaming or removing public API methods on `useTour()`
- Changing the shape of `TourConfig` or `TourStep` in an incompatible way
- Renaming or removing CSS custom properties (variables)
- Changes to default behaviour that alter visible step rendering

### Non-Breaking Changes (minor or patch)

- Performance improvements
- Internal refactors with no public API surface change
- Adding new optional fields to `TourConfig` or `TourStep`
- New CSS variables with sensible defaults
- Bug fixes that restore documented behaviour

---

## Troubleshooting

### Tooltip appears behind a modal or overlay

**Cause:** A `transform`, `filter`, `opacity < 1`, or `isolation: isolate` on an ancestor creates a stacking context that traps `position: fixed` elements.

**Fix:** Add a clean portal target directly inside `<body>`:

```html
<!-- index.html -->
<body>
  <div id="guide-pilot-root"></div>  <!-- before your app root -->
  <div id="root"></div>
</body>
```

```tsx
<GuidePilotProvider portalTarget={document.getElementById('guide-pilot-root')}>
```

GuidePilot also logs a dev-mode warning identifying the offending element.

---

### Element not found — step is skipped

**Cause:** The target element isn't in the DOM when the step tries to render.

**Fix:** Increase `targetTimeout` or switch to `retry` strategy:

```typescript
{ target: '#lazy-el', targetTimeout: 5000 }
```

```ts
const tour: TourConfig = {
  id: 'my-tour',
  missingTargetStrategy: 'retry',
};
```

Or enable `watchDom` on the Provider for automatic re-scanning.

---

### SSR / Next.js hydration mismatch

**Cause:** Using `useTour()` or `startTour()` during SSR.

**Fix:** Ensure `startTour` is only called in event handlers or `useEffect` — never during render. The Provider itself is safe to use in any component tree.

---

### Tour doesn't start — `startTour` does nothing

**Check:**
1. The `<GuidePilotProvider>` wraps the component calling `useTour()`
2. The tour ID in `startTour('id')` matches the `id` in your `TourConfig` or `data-guide-pilot-tour` attribute
3. In dev mode, check the console for warnings about missing steps or invalid config

---

## Migration from Other Libraries

### From React Joyride

```typescript
// React Joyride
const steps = [{ target: '#el', content: 'Hello', placement: 'bottom' }];
<Joyride steps={steps} run={true} />

// GuidePilot equivalent
const { startTour } = useTour();
startTour([{ id: 'step-1', target: '#el', content: 'Hello', placement: 'bottom' }]);
```

Key differences:
- GuidePilot uses `target` (CSS selector string) instead of `target` (element ref or string)
- `run={true}` → `startTour()`
- `continuous={true}` is the default in GuidePilot (no prop needed)
- `disableOverlay` → `disableOverlay: true` on the step

### From Shepherd.js

```javascript
// Shepherd.js
const tour = new Shepherd.Tour({ useModalOverlay: true });
tour.addStep({ id: 'step-1', attachTo: { element: '#el', on: 'bottom' }, text: 'Hello' });
tour.start();

// GuidePilot equivalent
startTour([{ id: 'step-1', target: '#el', placement: 'bottom', content: 'Hello' }]);
```

### From Intro.js

Intro.js data attributes map directly to GuidePilot data attributes:

```html
<!-- Intro.js -->
<div data-intro="Hello" data-step="1" data-position="bottom">

<!-- GuidePilot equivalent -->
<div
  data-guide-pilot-tour="my-tour"
  data-guide-pilot-content="Hello"
  data-guide-pilot-step="1"
  data-guide-pilot-placement="bottom"
>
```
