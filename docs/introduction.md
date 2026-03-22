# GuidePilot

GuidePilot is a **lightweight, self-hosted React library** for building guided product tours and UI walkthroughs.

It enables teams to create interactive, step-by-step guides that highlight UI elements, show contextual tooltips, and lead users through any flow — with minimal or zero JavaScript configuration.

---

## The Problem It Solves

Modern web products suffer from poor feature discoverability and high onboarding abandonment. Enterprise tools like WalkMe and Pendo address this but come with:

- **SaaS lock-in** and high licensing costs
- **External script dependencies** that add latency and privacy risk
- **No-code builders** that are powerful but opaque to developers

GuidePilot is built for **development teams** who want full control, live in their codebase, and want a reliable tour engine that works like any other React library.

---

## What You Can Build

- **Onboarding walkthroughs** — guide new users through a product on first login
- **Feature announcements** — spotlight new UI elements after a release
- **Contextual hints** — show non-blocking inline tips next to complex controls
- **Interactive tutorials** — let users interact with highlighted elements mid-tour

---

## Key Differentiators

| Feature | GuidePilot | React Joyride | Shepherd.js | Intro.js | Driver.js |
|---|:---:|:---:|:---:|:---:|:---:|
| Zero-JS data-attribute config | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| TypeScript-first | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| SSR / Next.js safe | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| Micro frontend support | ✅ | ❌ | ❌ | ❌ | ❌ |
| iframed MFE bridge | ✅ | ❌ | ❌ | ❌ | ❌ |
| Built-in XSS sanitization | ✅ | ❌ | ❌ | ❌ | ❌ |
| No external SaaS dependency | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bundle size (gzip) | **< 25KB** | ~35KB | ~45KB | ~25KB | ~20KB |

---

## Core Philosophy

- **Declarative where possible** — annotate HTML elements with `data-*` attributes, call `startTour('id')`. Done.
- **Programmatic where necessary** — full `TourConfig` API with TypeScript types for complete control.
- **Fail-safe always** — no unhandled exceptions in production; errors are routed to callbacks or swallowed silently.
- **Framework-aligned** — React-first architecture using `useSyncExternalStore`, portals, and standard hooks.

---

## Architecture at a Glance

- **React 18+**, TypeScript, Vite library build
- **@floating-ui/react** for tooltip/popover positioning
- **Vanilla CSS** with `--guide-pilot-*` custom properties for theming
- **External singleton store** (`tourStore.ts`) for cross-React-root state sharing in micro frontends
- **Optional postMessage bridge** for coordinating tours across iframed micro frontends
- **Portal to `document.body`** with `position: fixed` to escape stacking contexts

For the full implementation internals, see [Technical Architecture](technical-architecture.md).

---

## Who Is It For?

- **SaaS product teams** building user onboarding flows
- **Internal tooling teams** creating guided workflows for non-technical users
- **Platform teams** standardising tour experiences across micro frontends
- **Frontend developers** who want a React-native, TypeScript-first solution they can maintain and extend

---

## Maturity and Support

- **License**: MIT
- **Versioning**: Semantic Versioning (semver), Conventional Commits
- **Distribution**: npm package — ESM + CJS + TypeScript declarations
- **Browser support**: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+, iOS Safari 14+
- **CI/CD**: GitHub Actions — automated test, lint, and publish pipeline
- **Supply chain**: npm provenance enabled on all releases

---

## What's Out of Scope (v1)

The following are intentionally deferred to future versions:

- Analytics / step completion tracking
- Visual no-code tour editor
- Multi-page / cross-route tours with persistence
- User segmentation (show tour only to specific users)
- A/B testing for tour variants
