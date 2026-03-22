# Theming

GuidePilot uses CSS custom properties (variables) for all visual customization. No CSS-in-JS, no runtime style injection — just override variables in your stylesheet.

---

## Setup

Import the default styles in your app entry point or root layout:

```ts
import 'guide-pilot/styles';
```

Then override variables in your own stylesheet:

```css
@import 'guide-pilot/styles';

:root {
  --guide-pilot-tooltip-bg: #1e1e2e;
  --guide-pilot-tooltip-color: #cdd6f4;
}
```

---

## Full Variable Reference

### Tooltip & Modal

| Variable | Default | Description |
|---|---|---|
| `--guide-pilot-bg` | `#ffffff` | Background colour |
| `--guide-pilot-color` | `#111827` | Text colour |
| `--guide-pilot-border-radius` | `8px` | Corner radius |
| `--guide-pilot-shadow` | `0 4px 16px rgba(0,0,0,0.12)` | Drop shadow |
| `--guide-pilot-tooltip-bg` | inherits `--guide-pilot-bg` | Tooltip-specific background |
| `--guide-pilot-tooltip-color` | inherits `--guide-pilot-color` | Tooltip-specific text |
| `--guide-pilot-tooltip-border` | `1px solid #e5e7eb` | Tooltip border |
| `--guide-pilot-tooltip-radius` | inherits `--guide-pilot-border-radius` | Tooltip corner radius |
| `--guide-pilot-tooltip-shadow` | inherits `--guide-pilot-shadow` | Tooltip shadow |

### Buttons

| Variable | Default | Description |
|---|---|---|
| `--guide-pilot-btn-primary-bg` | `#2563eb` | Primary button background |
| `--guide-pilot-btn-primary-color` | `#ffffff` | Primary button text |
| `--guide-pilot-btn-ghost-color` | `#6b7280` | Ghost/secondary button text |

### Overlay & Spotlight

| Variable | Default | Description |
|---|---|---|
| `--guide-pilot-overlay-color` | `rgba(0, 0, 0, 0.5)` | Full-page overlay colour |
| `--guide-pilot-spotlight-radius` | `4px` | Spotlight cutout corner radius |

### Z-Index

| Variable | Default | Description |
|---|---|---|
| `--guide-pilot-z-base` | `9000` | Base z-index for all GuidePilot elements |

Internal layers relative to `--guide-pilot-z-base`:
- Overlay: `z-base + 0`
- Content: `z-base + 1`
- Arrow: `z-base + 2`

---

## Dark Mode

Override variables inside a `prefers-color-scheme: dark` media query:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --guide-pilot-tooltip-bg:     #1f2937;
    --guide-pilot-tooltip-color:  #f9fafb;
    --guide-pilot-tooltip-border: 1px solid #374151;
    --guide-pilot-btn-primary-bg: #3b82f6;
    --guide-pilot-overlay-color:  rgba(0, 0, 0, 0.7);
  }
}
```

Or scope to a `.dark` class for manual theme switching:

```css
.dark {
  --guide-pilot-tooltip-bg:    #1e1e2e;
  --guide-pilot-tooltip-color: #cdd6f4;
}
```

---

## Brand Example (Catppuccin Mocha)

```css
:root {
  --guide-pilot-tooltip-bg:        #1e1e2e;
  --guide-pilot-tooltip-color:     #cdd6f4;
  --guide-pilot-tooltip-border:    1px solid #313244;
  --guide-pilot-tooltip-radius:    12px;
  --guide-pilot-tooltip-shadow:    0 8px 32px rgba(0,0,0,0.4);
  --guide-pilot-btn-primary-bg:    #cba6f7;
  --guide-pilot-btn-primary-color: #1e1e2e;
  --guide-pilot-btn-ghost-color:   #a6adc8;
  --guide-pilot-overlay-color:     rgba(0, 0, 0, 0.7);
  --guide-pilot-spotlight-radius:  6px;
}
```

---

## Tailwind Integration

Use `tooltipClassName` / `overlayClassName` on the config alongside CSS variables:

```ts
const tour: TourConfig = {
  id: 'onboarding',
  tooltipClassName: 'shadow-2xl border border-gray-200 rounded-xl font-sans text-sm',
};
```

Or globally via the Provider:

```tsx
<GuidePilotProvider tooltipClassName="font-sans" overlayClassName="backdrop-blur-sm">
```

---

## Per-Step Class Overrides

Apply classes to individual steps for one-off styling:

```ts
// Not yet in TourStep — use tooltipClassName on TourConfig for tour-level overrides,
// or CSS variable scoping via a wrapper element for element-level theming.
```

---

## Customization Priority

CSS variables (lowest) → `className` prop overrides → inline styles (highest)

---

## Replacing Default Styles Entirely

Skip the `import 'guide-pilot/styles'` import and provide your own stylesheet that defines all `--guide-pilot-*` variables. GuidePilot will use whatever values are set.

---

## Z-Index for UI Libraries

If GuidePilot appears behind library components (modals, drawers, etc.):

| UI Library | Set `--guide-pilot-z-base` to |
|---|---|
| MUI / Material UI | `1600` |
| Ant Design | `1100` |
| Chakra UI | `1500` |
| Bootstrap | `1100` |

```css
:root { --guide-pilot-z-base: 1600; }
```

See [Portal & Layering](../rendering/portal-and-layering.md) for the full explanation.
