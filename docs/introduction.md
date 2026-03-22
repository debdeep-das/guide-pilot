# GuidePilot

GuidePilot is a **lightweight, self-hosted React library** for building guided product tours and UI walkthroughs.

It enables teams to create interactive, step-by-step guides that highlight UI elements, show contextual tooltips, and lead users through any flow — with minimal or zero JavaScript configuration.

---

## What You Can Build

- **Onboarding walkthroughs** — guide new users through a product on first login
- **Feature announcements** — spotlight new UI elements after a release
- **Contextual hints** — show non-blocking inline tips next to complex controls
- **Interactive tutorials** — let users interact with highlighted elements mid-tour

---

## Why GuidePilot?

| | GuidePilot | React Joyride | Shepherd.js | Intro.js | Driver.js |
|---|:---:|:---:|:---:|:---:|:---:|
| Zero-JS data-attribute config | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| TypeScript-first | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| SSR / Next.js safe | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| Micro frontend support | ✅ | ❌ | ❌ | ❌ | ❌ |
| iframed MFE bridge | ✅ | ❌ | ❌ | ❌ | ❌ |
| Built-in XSS sanitization | ✅ | ❌ | ❌ | ❌ | ❌ |
| Bundle size (gzip) | **< 25KB** | ~35KB | ~45KB | ~25KB | ~20KB |
| No external SaaS dependency | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Core Philosophy

- **Declarative where possible** — annotate HTML elements with `data-*` attributes, call `startTour('id')`. Done.
- **Programmatic where necessary** — full `TourConfig` API with TypeScript types for complete control.
- **Fail-safe always** — no unhandled exceptions in production; errors are routed to callbacks or swallowed silently.
- **Framework-aligned** — React-first architecture using `useSyncExternalStore`, portals, and standard hooks.

---

## Who Is It For?

- **SaaS product teams** building user onboarding flows
- **Internal tooling teams** creating guided workflows for non-technical users
- **Platform teams** standardising tour experiences across micro frontends
- **Frontend developers** who want a React-native, TypeScript-first solution they can maintain and extend

---

## What's Out of Scope (v1)

The following are intentionally deferred:

- Analytics / step completion tracking
- Visual no-code tour editor
- Multi-page / cross-route tours with persistence
- User segmentation (show tour only to specific users)
- A/B testing for tour variants

---

## License & Distribution

- **License**: MIT
- **Package**: `guide-pilot` on npm — ESM + CJS + TypeScript declarations
- **Browser support**: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+, iOS Safari 14+
