# Micro Frontend Support

GuidePilot supports two MFE topologies: same-document (Module Federation) and cross-iframe.

---

## Same-Document MFEs (Module Federation)

When multiple React apps share the same browser document, GuidePilot's **singleton store** automatically bridges them — no special wiring required.

### How It Works

The store lives at module scope, outside React. When `guide-pilot` is configured as a shared singleton in Webpack Module Federation, all MFEs and the shell share one instance of the store. Tour state is visible to all of them simultaneously.

The DOM scanner queries `document` (not the React tree), so it finds `data-guide-pilot-*` elements across all MFE DOM nodes in a single pass.

### Setup

**Step 1: Declare `guide-pilot` as a shared singleton in every webpack config**

```javascript
// webpack.config.js — shell AND every MFE
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      shared: {
        react:        { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom':  { singleton: true, requiredVersion: '^18.0.0' },
        'guide-pilot': { singleton: true, requiredVersion: '^1.0.0' },
      },
    }),
  ],
};
```

**Step 2: Mount one `<GuidePilotProvider>` in the shell only**

```tsx
// Shell app — shell/src/App.tsx
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

**Step 3: Annotate elements in each MFE — no Provider or `useTour` needed**

```html
<!-- mfe-nav/src/Nav.tsx -->
<button
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="1"
  data-guide-pilot-content="Start here."
>
  Dashboard
</button>
```

```html
<!-- mfe-main/src/Workspace.tsx -->
<div
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="2"
  data-guide-pilot-content="This is your workspace."
>
```

Steps from all MFEs are merged into a single ordered list when the tour runs.

### Controlling the Tour from an MFE

MFEs can also use `useTour()` to start or control tours:

```tsx
// Any MFE — guide-pilot must be the same shared instance
import { useTour } from 'guide-pilot';

function OnboardingTrigger() {
  const { startTour } = useTour();
  return <button onClick={() => startTour('onboarding')}>Start tour</button>;
}
```

---

## Cross-Iframe MFEs (postMessage Bridge)

When MFEs are loaded inside `<iframe>` elements, the singleton store cannot be shared directly (separate JS contexts). GuidePilot provides an optional postMessage bridge to coordinate tours across iframe boundaries.

The bridge is included in the main package:

```ts
import { createGuidePilotBridge } from 'guide-pilot/bridge';
```

### Architecture

- The **host** (shell) holds the authoritative tour state
- **Guests** (iframed MFEs) receive step-render commands and report interaction events back
- Communication uses `window.postMessage` with origin validation

### Host Setup

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

### Guest Setup (inside each iframe)

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
      <button
        data-guide-pilot-tour="onboarding"
        data-guide-pilot-step="2"
        data-guide-pilot-content="This lives in an iframe."
      >
        Action
      </button>
    </GuidePilotProvider>
  );
}
```

### Single-iframe Tours

If your tour only touches elements inside one iframe and does not cross the boundary, use a standard `<GuidePilotProvider>` inside the iframe. No bridge required.

---

## Choosing the Right Pattern

| Topology | Approach |
|---|---|
| Multiple React roots, same document | Module Federation singleton — no extra work |
| MFEs in iframes, tour crosses frames | postMessage bridge |
| Tour stays inside one iframe | Standard Provider inside the iframe |
