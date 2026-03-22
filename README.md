# GuidePilot

**A lightweight, flexible React library for building guided user walkthroughs and product tours.**

Highlight UI elements, show contextual tooltips, and guide users through your application step-by-step — with minimal or zero JavaScript setup.

[![npm version](https://img.shields.io/npm/v/guide-pilot.svg)](https://www.npmjs.com/package/guide-pilot)
[![bundle size](https://img.shields.io/bundlephobia/minzip/guide-pilot)](https://bundlephobia.com/package/guide-pilot)
[![license](https://img.shields.io/npm/l/guide-pilot)](LICENSE)
[![CI](https://github.com/your-org/guide-pilot/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/guide-pilot/actions)

---

## Why GuidePilot?

| | GuidePilot | React Joyride | Shepherd.js | Intro.js |
|---|:---:|:---:|:---:|:---:|
| Zero-JS data-attribute config | ✅ | ❌ | ❌ | ⚠️ |
| TypeScript-first | ✅ | ✅ | ⚠️ | ❌ |
| SSR / Next.js safe | ✅ | ⚠️ | ⚠️ | ❌ |
| Micro frontend support | ✅ | ❌ | ❌ | ❌ |
| Built-in XSS sanitization | ✅ | ❌ | ❌ | ❌ |
| Bundle size (gzip) | **< 25KB** | ~35KB | ~45KB | ~25KB |

---

## Features

- **Zero-config** — annotate HTML elements with `data-*` attributes, call `startTour('id')`. Done.
- **Programmatic API** — full `TourConfig` objects with TypeScript types for complete control
- **4 step UI types** — Tooltip, Spotlight (overlay cutout), Inline Hint, Modal
- **`allowInteraction`** — let users interact with highlighted elements during a tour step
- **`waitForElement`** — automatically waits for lazy-loaded or conditionally rendered targets
- **SSR / Next.js safe** — zero DOM access at render time, no hydration mismatches
- **Micro frontend ready** — works across Module Federation roots; optional `postMessage` bridge for iframed MFEs
- **Fully accessible** — ARIA attributes, focus management, keyboard navigation, screen reader announcements
- **Themeable** — CSS custom properties (`--guide-pilot-*`) + `className`/`style` overrides
- **< 25KB gzip** — no runtime CSS-in-JS, tree-shakeable ESM

---

## Installation

```bash
npm install guide-pilot
# or
yarn add guide-pilot
# or
pnpm add guide-pilot
```

**Requirements:** React 18+

---

## Quick Start

### Option 1 — Zero Config (data attributes)

No JavaScript tour definition needed. Annotate your elements and call `startTour`.

```tsx
// 1. Wrap your app
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

```html
<!-- 2. Annotate your elements -->
<button
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="1"
  data-guide-pilot-title="Create a project"
  data-guide-pilot-content="Click here to get started."
  data-guide-pilot-placement="bottom"
>
  New Project
</button>

<nav
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="2"
  data-guide-pilot-type="spotlight"
  data-guide-pilot-title="Navigation"
  data-guide-pilot-content="Use these links to explore the app."
>
  ...
</nav>
```

```tsx
// 3. Start the tour from anywhere
import { useTour } from 'guide-pilot';

function Header() {
  const { startTour } = useTour();
  return (
    <button onClick={() => startTour('onboarding')}>
      Take a tour
    </button>
  );
}
```

---

### Option 2 — Programmatic Config

```tsx
import { GuidePilotProvider, useTour, TourConfig, StepType } from 'guide-pilot';
import 'guide-pilot/styles';

const onboardingTour: TourConfig = {
  id: 'onboarding',
  allowSkip: true,
  onComplete: () => localStorage.setItem('tour_done', '1'),
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
    {
      id: 'step-3',
      order: 3,
      type: StepType.Modal,
      title: "You're all set!",
      content: 'Your project is ready. Explore the dashboard to get started.',
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
```

---

### Option 3 — Inline Steps

Pass steps directly to `startTour()` — no pre-registration required:

```tsx
const { startTour } = useTour();

startTour([
  { id: 'step-1', target: '#save-btn', content: 'Save your work.', placement: 'top' },
  { id: 'step-2', target: '#share-btn', content: 'Share with your team.', placement: 'left' },
]);
```

---

## Step Types

| Type | Description |
|---|---|
| `tooltip` (default) | Floating popover anchored near the target element |
| `spotlight` | Full-screen overlay with animated cutout around target |
| `inline-hint` | Non-blocking hint with no overlay — page remains interactive |
| `modal` | Centered dialog not tied to any element |

```tsx
// Tooltip
{ type: StepType.Tooltip, target: '#btn', placement: 'bottom' }

// Spotlight — user can interact with the highlighted element
{ type: StepType.Spotlight, target: '#search', allowInteraction: true }

// Inline hint — no overlay
{ type: StepType.InlineHint, target: '#help-icon', placement: 'right' }

// Modal — no target needed
{ type: StepType.Modal, title: 'Welcome!', content: 'Let us show you around.' }
```

---

## API Reference

### `<GuidePilotProvider>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `tours` | `TourConfig[]` | `[]` | Pre-registered tour configs |
| `scanOnMount` | `boolean` | `true` | Scan data-attrs on mount |
| `scanRoot` | `string` | `'body'` | CSS selector for scan root |
| `watchDom` | `boolean` | `false` | Re-scan on DOM changes (MutationObserver) |
| `portalTarget` | `Element \| null` | `document.body` | Custom portal mount point |
| `tooltipClassName` | `string` | — | Global className for tooltips |
| `overlayClassName` | `string` | — | Global className for overlays |

### `useTour()`

```typescript
const {
  // State
  isActive,           // boolean
  activeTourId,       // string | null
  currentStep,        // TourStep | null
  currentStepIndex,   // number (0-based)
  totalSteps,         // number
  isFirstStep,        // boolean
  isLastStep,         // boolean
  status,             // TourStatus

  // Actions
  startTour,          // (tourId | TourStep[] | TourConfig) => void
  stopTour,           // () => void
  nextStep,           // () => void
  prevStep,           // () => void
  goToStep,           // (index: number) => void
  skipTour,           // () => void
  registerTour,       // (config: TourConfig) => void
} = useTour();
```

### `TourStep` Key Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | Unique step ID |
| `order` | `number` | — | 1-based step sequence |
| `type` | `StepType` | `'tooltip'` | Step UI type |
| `target` | `string` | — | CSS selector for target element |
| `content` | `string` | — | Step body text |
| `placement` | `StepPlacement` | `'bottom'` | Tooltip placement |
| `offset` | `number` | `12` | px gap between tooltip and target |
| `allowInteraction` | `boolean` | `false` | Allow clicking the highlighted element |
| `disableOverlay` | `boolean` | `false` | Skip the backdrop for this step |
| `scrollIntoView` | `boolean` | `true` | Auto-scroll target into viewport |
| `targetTimeout` | `number` | `3000` | ms to wait for lazy element |
| `onBeforeShow` | `() => void \| Promise<void>` | — | Fires before step renders |
| `onNext` | `() => void` | — | Fires when Next is clicked |
| `renderNextButton` | `(onClick) => ReactNode` | — | Custom Next button |

Full API reference: [docs/developers-guide.md](docs/developers-guide.md)

---

## Theming

Override any visual property with CSS custom properties:

```css
:root {
  --guide-pilot-tooltip-bg:        #ffffff;
  --guide-pilot-tooltip-color:     #1a1a1a;
  --guide-pilot-tooltip-radius:    8px;
  --guide-pilot-btn-primary-bg:    #6366f1;
  --guide-pilot-overlay-bg:        rgba(0, 0, 0, 0.6);
  --guide-pilot-z-base:            9000;  /* adjust for MUI (1600), Ant Design (1100), etc. */
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --guide-pilot-tooltip-bg:    #1f2937;
    --guide-pilot-tooltip-color: #f9fafb;
  }
}
```

See the full [Theming Guide](docs/developers-guide.md#theming-guide) for all available variables.

---

## Micro Frontend Support

### Module Federation (same-document)

Mount one `<GuidePilotProvider>` in the shell. All MFEs share the same tour state automatically via an external singleton store.

```javascript
// webpack.config.js — required in shell and all MFEs
shared: {
  'guide-pilot': { singleton: true, requiredVersion: '^1.0.0' }
}
```

MFEs only need data-attributes — no Provider or `useTour` required in each MFE.

### iframed MFEs

Use the optional bridge for cross-frame tours:

```typescript
// Shell
import { createGuidePilotBridge } from 'guide-pilot/bridge';
createGuidePilotBridge({ mode: 'host' }).listen();

// Each iframe MFE
import { createGuidePilotBridge } from 'guide-pilot/bridge';
createGuidePilotBridge({ mode: 'guest', target: window.parent }).connect();
```

Full guide: [docs/developers-guide.md](docs/developers-guide.md#integration-with-iframed-mfes)

---

## Accessibility

- `role="tooltip"` + `aria-describedby` on target elements
- `role="dialog"` + `aria-modal` on modal steps
- Screen reader live region announces each step
- Focus moves to tooltip on step show; returns to original element on tour end
- Full keyboard navigation: `→` next, `←` previous, `Escape` skip
- Respects `prefers-reduced-motion`

---

## Next.js

Works with both App Router and Pages Router. Zero server-side output — no hydration mismatches.

```tsx
// app/layout.tsx
import { GuidePilotProvider } from 'guide-pilot';
import 'guide-pilot/styles';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GuidePilotProvider>{children}</GuidePilotProvider>
      </body>
    </html>
  );
}
```

---

## Documentation

### Overview

| Document | Description |
|---|---|
| [Introduction](docs/introduction.md) | What GuidePilot is, why it exists, competitive positioning |
| [Executive Summary](docs/executive-summary.md) | Business case, key differentiators, maturity and support |
| [Features & Capabilities](docs/features-and-capabilities.md) | Full feature matrix with code examples |
| [Technical Architecture](docs/technical-architecture.md) | Internals, data flow, state machine, MFE design, security |

### Getting Started

| Document | Description |
|---|---|
| [Getting Started](docs/getting-started.md) | Install, zero-config setup, programmatic config, inline steps |
| [Basic Tour Guide](docs/guides/basic-tour.md) | Step-by-step walkthrough building your first tour |
| [Programmatic Tour Guide](docs/guides/programmatic-tour.md) | Async navigation, dynamic steps, lifecycle callbacks |

### API Reference

| Document | Description |
|---|---|
| [useTour()](docs/api/use-tour.md) | Hook API — all state properties, actions, and guarantees |
| [TourConfig](docs/api/tour-config.md) | Tour-level configuration — all fields with types and examples |
| [TourStep](docs/api/tour-step.md) | Step configuration — all fields including lifecycle hooks |

### Core Concepts

| Document | Description |
|---|---|
| [Execution Model](docs/core-concepts/execution-model.md) | Step resolution, ordering, lifecycle, navigation rules, singleton store |

### Rendering

| Document | Description |
|---|---|
| [Step Types](docs/rendering/step-types.md) | Tooltip, Spotlight, Modal, InlineHint — behaviour and ARIA roles |
| [Portal & Layering](docs/rendering/portal-and-layering.md) | Why portals, custom targets, z-index layers, debugging stacking contexts |

### Styling

| Document | Description |
|---|---|
| [Theming](docs/styling/theming.md) | Full CSS variable reference, dark mode, Tailwind, customization priority |

### Advanced

| Document | Description |
|---|---|
| [Micro Frontend Support](docs/advanced/mfe-support.md) | Module Federation setup and iframed MFE postMessage bridge |
| [SSR Support](docs/advanced/ssr.md) | Next.js App Router / Pages Router, hydration rules, dynamic imports |

### Quality & Reference

| Document | Description |
|---|---|
| [Accessibility](docs/quality/accessibility.md) | ARIA roles, focus management, keyboard nav, screen reader support |
| [Performance](docs/quality/performance.md) | Performance targets, DOM scan model, re-render strategy |
| [Security](docs/quality/security.md) | Plain-text default, HTML sanitization rules, CSP guidance |
| [Error Handling](docs/reference/error-handling.md) | Error types, dev vs prod behaviour, onError callback, common fixes |
| [Developer's Guide](docs/developers-guide.md) | Comprehensive single-document reference covering all of the above |

---

## Contributing

Contributions are welcome! Please open an issue before submitting large changes.

```bash
git clone https://github.com/your-org/guide-pilot
cd guide-pilot
npm install
npm run dev        # start demo app
npm test           # run unit + integration tests
npm run test:e2e   # run Playwright E2E tests
npm run build      # build the library
```

---

## License

MIT — see [LICENSE](LICENSE)

---

## Roadmap (post v1)

- [ ] Analytics integration (step completion tracking)
- [ ] Persisted tours (resume after page refresh)
- [ ] Multi-page / cross-route tours
- [ ] User segmentation (show tours to specific user groups)
- [ ] Visual tour editor
- [ ] Animation system
