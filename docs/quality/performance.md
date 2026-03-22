# Performance

GuidePilot is designed to be invisible to your app's performance. It does no work when no tour is running.

---

## Performance Targets

| Operation | Target |
|---|---|
| DOM scan (200 elements) | < 16ms |
| MutationObserver debounce interval | ≥ 50ms |
| Re-renders per step transition | StepRenderer only (Provider does not re-render) |
| Layout reads | Batched — no forced synchronous layout |

---

## DOM Scanning

The DOM scanner runs once when a tour starts (or on Provider mount if `scanOnMount={true}`). It queries `document` for all elements matching `[data-guide-pilot-tour]` using a single `querySelectorAll` call — not a recursive tree walk.

For 200 annotated elements, this scan completes in under 16ms. Results are cached until the tour ends or a re-scan is triggered.

---

## MutationObserver (`watchDom`)

When `watchDom={true}`, GuidePilot uses a `MutationObserver` to detect DOM changes and re-scan for new `data-guide-pilot-*` elements. The observer is **debounced at ≥ 50ms** — rapid DOM mutations (e.g. a large list rendering) are batched into a single re-scan.

```tsx
<GuidePilotProvider watchDom={true}>
```

Use `watchDom` only when needed (SPAs with dynamic routing that add annotated elements after mount). Leave it off by default to avoid unnecessary observer overhead.

---

## No Layout Thrashing

GuidePilot never interleaves DOM reads and writes in a way that causes forced synchronous layout. Specifically:

- Target element bounds are read in a single `getBoundingClientRect` pass
- Position calculations (`@floating-ui`) are deferred to `requestAnimationFrame`
- The spotlight cutout is updated via CSS `clip-path` — no layout-triggering properties

---

## Minimal Re-renders

The store update cycle is designed to minimize React work:

- **StepRenderer** re-renders on step change (expected — it must update the displayed step)
- **GuidePilotProvider** does not re-render when only position data changes
- **Your app components** never re-render due to GuidePilot state unless they call `useTour()` and subscribe to the state they care about

`useTour()` uses `useSyncExternalStore` which only triggers a re-render when the subscribed slice of state actually changes.

---

## Bundle Size

GuidePilot targets < 25KB gzipped for the full library including styles.

Dependencies that contribute to bundle size:
- `@floating-ui/react` — tooltip positioning (tree-shaken to only used utilities)
- No other runtime dependencies

The `guide-pilot/bridge` import (postMessage bridge) is separately code-split and only bundled if imported.

---

## Recommendations

- **Don't use `watchDom` unless needed.** Use it only when annotated elements are added after initial render.
- **Keep step counts reasonable.** Tours with > 20 steps work fine but consider splitting into multiple shorter tours for UX reasons.
- **Prefer CSS selectors over complex data-attribute queries.** Simple ID selectors (`#my-element`) are the fastest to resolve.
- **Avoid `beforeEnter` delays on early steps.** Async hooks add perceived latency to the first step appearance.
