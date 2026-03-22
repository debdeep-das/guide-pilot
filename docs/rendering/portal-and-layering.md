# Portal & Layering

GuidePilot renders all step UI (tooltips, overlays, modals) via a React Portal. Understanding this is important when debugging z-index issues or integrating with apps that have complex stacking contexts.

---

## Why a Portal?

React Portals let GuidePilot render outside the component tree, directly into a target DOM node (by default `document.body`). This solves two common problems:

1. **Stacking context escape** — CSS properties like `transform`, `filter`, `opacity < 1`, and `isolation: isolate` on ancestor elements create new stacking contexts that trap `position: fixed` children. By rendering at `document.body`, GuidePilot escapes all of these.

2. **Overlay coverage** — the spotlight and modal overlays must cover the entire viewport. Rendering inside an app root with `overflow: hidden` or a constrained height would clip the overlay.

---

## Default Render Target

By default, GuidePilot appends its portal container to `document.body`. This is handled client-side only — the Provider renders `null` on the server.

---

## Custom Portal Target

If your app has a specific DOM node that's guaranteed to sit above all stacking contexts, you can direct GuidePilot to render there:

```html
<!-- index.html -->
<body>
  <div id="guide-pilot-root"></div>  <!-- place BEFORE your app root -->
  <div id="root"></div>
</body>
```

```tsx
<GuidePilotProvider
  portalTarget={document.getElementById('guide-pilot-root')}
>
```

This is the recommended fix when tooltips appear behind modals from UI libraries like MUI or Ant Design.

---

## Z-Index Layering

All GuidePilot elements share a single base z-index, controlled via CSS variable. The internal layers are stacked relative to that base:

```
overlay  (z-base + 0)
content  (z-base + 1)
arrow    (z-base + 2)
```

Default base: `9000`

### Adjusting for UI Libraries

| UI Library | Recommended `--guide-pilot-z-base` |
|---|---|
| MUI / Material UI | `1600` |
| Ant Design | `1100` |
| Chakra UI | `1500` |
| Bootstrap | `1100` |
| Default (unknown) | `9000` |

```css
:root {
  --guide-pilot-z-base: 1600;
}
```

Or override per-tour:

```ts
const tour: TourConfig = {
  id: 'my-tour',
  zIndex: 1600,
};
```

---

## Positioning

Tooltip placement is handled by [`@floating-ui/react`](https://floating-ui.com/). It:

- Positions the tooltip relative to the target element
- Auto-updates on scroll, resize, and layout changes (via `autoUpdate`)
- Applies automatic flip/shift when the preferred placement would overflow the viewport

Available placements: `top`, `top-start`, `top-end`, `bottom`, `bottom-start`, `bottom-end`, `left`, `left-start`, `left-end`, `right`, `right-start`, `right-end`, `auto`.

---

## Debugging Stacking Context Issues

**Symptom:** Tooltip appears behind a modal, drawer, or overlay from another library.

**Diagnosis:** GuidePilot logs a dev-mode warning identifying ancestor elements with stacking context properties. Check the browser console.

**Common causes:**

```css
/* Any of these on an ancestor will trap position:fixed children */
transform: translateX(0);
filter: blur(0);
opacity: 0.99;
isolation: isolate;
will-change: transform;
```

**Fix options (in order of preference):**

1. Use a `portalTarget` outside the problematic ancestor (see above)
2. Increase `--guide-pilot-z-base` above the offending element's z-index
3. Remove the stacking context from the ancestor if it's not needed

---

## Related

- [Step Types](step-types.md)
- [Theming](../styling/theming.md) — z-index CSS variable
- [Troubleshooting](../developers-guide.md#tooltip-appears-behind-a-modal-or-overlay)
