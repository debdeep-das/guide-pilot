# GuidePilot

**Product tours for React apps. Self-hosted, TypeScript-first, no SaaS.**

[![npm version](https://img.shields.io/npm/v/guide-pilot.svg)](https://www.npmjs.com/package/guide-pilot)
[![bundle size](https://img.shields.io/bundlephobia/minzip/guide-pilot)](https://bundlephobia.com/package/guide-pilot)
[![license](https://img.shields.io/npm/l/guide-pilot)](LICENSE)
[![CI](https://github.com/debdeep-das/guide-pilot/actions/workflows/ci.yml/badge.svg)](https://github.com/debdeep-das/guide-pilot/actions)

> 🚧 **Status: In Development** — Core implementation shipped. Not yet published to npm.

---

## Quick Example

Most tours need 2–3 lines of code. Annotate your elements, call `startTour`. Done.

```html
<button
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="1"
  data-guide-pilot-title="Create a project"
  data-guide-pilot-content="Click here to get started."
>
  New Project
</button>
```

```tsx
const { startTour } = useTour();
startTour('onboarding');
```

No config files. No tour objects. No build steps.

---

## Features

- **Zero-config setup** — annotate elements with `data-*` attributes, call `startTour('id')`
- **Full TypeScript API** — typed config objects, lifecycle hooks, autocompletion
- **4 step types** — Tooltip, Spotlight, Modal, InlineHint
- **SSR / Next.js safe** — no DOM access at render time, no hydration mismatches
- **Micro frontend ready** — works across Module Federation roots; optional postMessage bridge for iframes
- **Accessible** — ARIA roles, focus management, keyboard navigation, screen reader support
- **Themeable** — CSS custom properties, no runtime CSS-in-JS
- **< 25KB gzip** — tree-shakeable ESM, no external dependencies beyond `@floating-ui`

---

## Why GuidePilot?

Most onboarding tools make you choose between easy (SaaS, lock-in) or flexible (DIY, complexity). GuidePilot gives you both.

| | GuidePilot | React Joyride | Shepherd.js | Intro.js | Driver.js |
|---|:---:|:---:|:---:|:---:|:---:|
| Zero-JS data-attribute setup | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| TypeScript-first | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| SSR / Next.js safe | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| Micro frontend support | ✅ | ❌ | ❌ | ❌ | ❌ |
| Built-in XSS sanitization | ✅ | ❌ | ❌ | ❌ | ❌ |
| No external SaaS dependency | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bundle size (gzip) | **< 25KB** | ~35KB | ~45KB | ~25KB | ~20KB |

---

## Install

```bash
npm install guide-pilot
```

**Requirements:** React 18+, react-dom 18+

---

## 🧩 Integration Footprint

GuidePilot requires minimal setup:

- Add a provider at app root
- Define a tour (config or data attributes)
- Call `startTour()`

No routing changes. No global refactoring. No external services.

Most integrations take fewer than 10 lines of code.

---

## 🚀 The Simplest Way to Use GuidePilot

Wrap your app once. Annotate elements. Call `startTour`. No tour objects, no imports in every file.

**1. Add the Provider**

```tsx
// main.tsx
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

**2. Annotate your elements**

```html
<nav
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="1"
  data-guide-pilot-type="spotlight"
  data-guide-pilot-title="Your workspace"
  data-guide-pilot-content="Navigate between sections here."
>...</nav>

<button
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="2"
  data-guide-pilot-title="Create something"
  data-guide-pilot-content="Click here to create your first project."
  data-guide-pilot-placement="bottom"
>
  New Project
</button>
```

**3. Start the tour**

```tsx
const { startTour } = useTour();
startTour('onboarding');
```

---

## Programmatic Config

When you need full control — TypeScript types, lifecycle callbacks, async navigation:

```tsx
import type { TourConfig } from 'guide-pilot';

const onboardingTour: TourConfig = {
  id: 'onboarding',
  onComplete: () => localStorage.setItem('tour_done', '1'),
  steps: [
    {
      id: 'welcome',
      order: 1,
      type: 'modal',
      title: 'Welcome to Acme!',
      content: "Let's show you around. Takes about 2 minutes.",
      nextButtonLabel: "Let's go",
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
      title: 'Create a project',
      content: 'Click here to get started.',
      placement: 'bottom',
    },
  ],
};
```

---

## Real-World Example — Dashboard Onboarding

```tsx
const dashboardTour: TourConfig = {
  id: 'dashboard-onboarding',
  missingTargetStrategy: 'retry',
  onComplete: () => markUserOnboarded(currentUser.id),
  steps: [
    {
      id: 'welcome',
      order: 1,
      type: 'modal',
      title: `Welcome, ${user.firstName}!`,
      content: "You're 3 steps away from your first project.",
      nextButtonLabel: 'Show me',
    },
    {
      id: 'create-project',
      order: 2,
      target: '#create-project-btn',
      title: 'Start here',
      content: 'Create your first project to unlock the full dashboard.',
      placement: 'right',
      beforeEnter: async () => await router.push('/dashboard'),
    },
    {
      id: 'sidebar',
      order: 3,
      target: '#sidebar-nav',
      type: 'spotlight',
      title: 'Your workspace',
      content: 'Projects, settings, and team management — all here.',
    },
    {
      id: 'done',
      order: 4,
      type: 'modal',
      title: "You're all set!",
      content: 'Explore at your own pace. Replay this tour anytime from the Help menu.',
    },
  ],
};
```

---

## What a Tour Looks Like

No GIF yet — here's the experience in plain text:

```
1. User lands on the dashboard
   → Centered modal: "Welcome! Let's show you around."

2. User clicks "Let's go"
   → Page dims. Sidebar highlighted with a cutout.
   → Tooltip: "Navigation — Use this to move between sections."

3. User clicks "Next"
   → Spotlight moves to the Create button.
   → Tooltip: "Create a project — Click here to get started."

4. User clicks "Next"
   → Overlay lifts. Final modal: "You're all set!"
```

```
Step 2 of 4                              [Skip tour]
┌─────────────────────────────────────┐
│  Navigation                         │
│  Use this to move between sections. │
│                          [←] [Next →]│
└─────────────────────────────────────┘
         ▲
  [ Sidebar Nav ]   ← highlighted
```

---

## Step Types

| Type | Use it when... |
|---|---|
| `tooltip` (default) | Pointing to a specific element — buttons, inputs, icons |
| `spotlight` | Highlighting a section — sidebars, dashboards, panels |
| `modal` | Welcome screens, summaries, steps without a target element |
| `inline` | Non-blocking tips that don't interrupt the user |

---

## Framework Setup

### Next.js (App Router)

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

### Next.js (Pages Router)

```tsx
// pages/_app.tsx
import { GuidePilotProvider } from 'guide-pilot';
import 'guide-pilot/styles';

export default function App({ Component, pageProps }) {
  return (
    <GuidePilotProvider>
      <Component {...pageProps} />
    </GuidePilotProvider>
  );
}
```

### Module Federation

```javascript
// webpack.config.js — in shell and every MFE
shared: {
  'guide-pilot': { singleton: true, requiredVersion: '^1.0.0' }
}
```

Mount one `<GuidePilotProvider>` in the shell. All MFEs share tour state automatically.

---

## Theming

Override any visual property with CSS variables:

```css
:root {
  --guide-pilot-tooltip-bg:     #ffffff;
  --guide-pilot-tooltip-color:  #111827;
  --guide-pilot-tooltip-radius: 8px;
  --guide-pilot-btn-primary-bg: #6366f1;
  --guide-pilot-overlay-color:  rgba(0, 0, 0, 0.6);
  --guide-pilot-z-base:         9000;  /* raise for MUI (1600), Ant Design (1100) */
}
```

Full variable reference: [docs/styling/theming.md](docs/styling/theming.md)

---

## Non-Goals (v1)

GuidePilot focuses purely on in-app, developer-driven tours. The following are out of scope:

- No visual/no-code tour editor
- No analytics or step completion tracking
- No SaaS dashboard or external scripts
- No multi-page / cross-route tour persistence
- No user segmentation or A/B testing

---

## Philosophy

GuidePilot lives inside your codebase, not outside it.

- **Simple by default** — data attributes over config where possible
- **Developer-first** — TypeScript types, hook API, testable utilities
- **No lock-in** — no dashboards, no CDN scripts, no vendor dependency
- **Safe** — fail-silent in production, XSS-sanitized, SSR-compatible

---

## Documentation

### Overview
| | |
|---|---|
| [Introduction](docs/introduction.md) | What GuidePilot is, the problem it solves, key differentiators, maturity |
| [Technical Architecture](docs/technical-architecture.md) | Internals, data flow, state machine, MFE design, build output |

### Getting Started
| | |
|---|---|
| [Getting Started](docs/getting-started.md) | Install + all setup options |
| [Basic Tour Guide](docs/guides/basic-tour.md) | Step-by-step: build your first tour |
| [Programmatic Tour Guide](docs/guides/programmatic-tour.md) | Async navigation, dynamic steps, callbacks |

### API Reference
| | |
|---|---|
| [useTour()](docs/api/use-tour.md) | Hook API — state, actions, guarantees |
| [TourConfig](docs/api/tour-config.md) | All tour-level options |
| [TourStep](docs/api/tour-step.md) | All step-level options including lifecycle hooks |

### Core Concepts
| | |
|---|---|
| [Execution Model](docs/core-concepts/execution-model.md) | Step resolution, ordering, lifecycle, navigation |
| [Step Types](docs/rendering/step-types.md) | Tooltip, Spotlight, Modal, InlineHint |
| [Portal & Layering](docs/rendering/portal-and-layering.md) | z-index, stacking contexts, custom portal targets |

### Advanced & Quality
| | |
|---|---|
| [Micro Frontend Support](docs/advanced/mfe-support.md) | Module Federation + iframed MFE bridge |
| [SSR Support](docs/advanced/ssr.md) | Next.js, hydration rules |
| [Accessibility](docs/quality/accessibility.md) | ARIA, focus management, keyboard nav |
| [Performance](docs/quality/performance.md) | Scan targets, re-render model, best practices |
| [Security](docs/quality/security.md) | Plain-text default, HTML sanitization |
| [Error Handling](docs/reference/error-handling.md) | Error types, dev vs prod, common fixes |

Full single-document reference: [Developer's Guide](docs/developers-guide.md)

---

## Contributing

```bash
git clone https://github.com/debdeep-das/guide-pilot
cd guide-pilot
npm install
npm run demo:basic  # basic demo — all 4 step types at http://localhost:5173
npm run build       # build the library
npm test            # run unit + integration tests
npm run test:e2e    # run Playwright E2E tests
```

### Examples

| Demo | Command | Description |
|---|---|---|
| Basic | `npm run demo:basic` | All 4 step types — tooltip, spotlight, inline hint, modal |

Contributions are welcome. Please open an issue before submitting large changes.

---

## Roadmap

- [ ] Demo app + GIF
- [ ] npm publish (v1.0.0)
- [ ] Analytics integration
- [ ] Persisted tours (resume after page refresh)
- [ ] Multi-page / cross-route tours
- [ ] User segmentation
- [ ] Visual tour editor

---

## License

MIT — see [LICENSE](LICENSE)
