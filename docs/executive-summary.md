# GuidePilot — Executive Summary

## What Is GuidePilot?

GuidePilot is a **lightweight, self-hosted React library** for building guided UI walkthroughs and product tours. It enables teams to create interactive, step-by-step guides that highlight UI elements, provide contextual tooltips, and lead users through any flow — with minimal or zero JavaScript configuration.

---

## The Problem It Solves

Modern web products suffer from poor feature discoverability and high onboarding abandonment. Enterprise tools like WalkMe and Pendo address this but come with:

- **SaaS lock-in** and high licensing costs
- **External script dependencies** that add latency and privacy risk
- **No-code builders** that are powerful but opaque to developers

GuidePilot is built for **development teams** who want full control, live in their codebase, and want a reliable tour engine that works like any other React library.

---

## Key Differentiators

| Feature | GuidePilot | React Joyride | Shepherd.js | Intro.js | Driver.js |
|---|---|---|---|---|---|
| Zero-JS data-attribute config | ✅ | ❌ | ❌ | ✅ (limited) | ❌ |
| Module Federation support | ✅ | ❌ | ❌ | ❌ | ❌ |
| iframed MFE bridge | ✅ | ❌ | ❌ | ❌ | ❌ |
| 4 UI step types | ✅ | Partial | ✅ | Partial | ✅ |
| SSR / Next.js safe | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| TypeScript-first | ✅ | ✅ | Partial | ❌ | ✅ |
| No external SaaS dependency | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bundle size (gzip) | < 25KB | ~35KB | ~45KB | ~25KB | ~20KB |
| Built-in XSS sanitization | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## How It Works

**Option 1 — Zero JS config (data attributes):**

Developers annotate HTML elements with `data-guide-pilot-*` attributes. No JavaScript tour definition required:

```html
<button
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="1"
  data-guide-pilot-title="Create your first project"
  data-guide-pilot-content="Click here to get started."
>
  New Project
</button>
```

Then start the tour with one call:

```tsx
const { startTour } = useTour();
startTour('onboarding');
```

**Option 2 — Programmatic config:** Full `TourConfig` objects with typed step definitions, lifecycle callbacks, and styling overrides.

---

## Target Audience

- **SaaS product teams** building user onboarding flows
- **Internal tooling teams** creating guided workflows for non-technical users
- **Platform teams** standardising tour experiences across micro frontends
- **Frontend developers** who want a React-native, TypeScript-first solution they can maintain and extend

---

## Architecture at a Glance

- **React 18+**, TypeScript, Vite library build
- **@floating-ui/react** for tooltip/popover positioning
- **Vanilla CSS** with `--guide-pilot-*` custom properties for theming
- **External singleton store** (`tourStore.ts`) for cross-React-root state sharing in micro frontends
- **Optional postMessage bridge** for coordinating tours across iframed micro frontends
- **Portal to `document.body`** with `position: fixed` to escape stacking contexts

---

## Maturity and Support

- **License**: MIT
- **Versioning**: Semantic Versioning (semver), Conventional Commits
- **Distribution**: npm package — ESM + CJS + TypeScript declarations
- **Browser support**: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+, iOS Safari 14+
- **CI/CD**: GitHub Actions — automated test, lint, and publish pipeline
- **Supply chain**: npm provenance enabled on all releases

---

## Out of Scope for v1

The following features are intentionally deferred to future versions:

- Analytics / step completion tracking
- Visual no-code tour editor
- Multi-page / cross-route tours with persistence
- User segmentation (show tour only to specific users)
- Advanced animation system
- A/B testing for tour variants
