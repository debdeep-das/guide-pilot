# Getting Started

## Install

```bash
npm install guide-pilot
# or
yarn add guide-pilot
# or
pnpm add guide-pilot
```

**Requirements:** React 18+, react-dom 18+

---

## Option 1 — Zero Config (Data Attributes)

The fastest setup. No JavaScript tour definition required.

### Step 1: Wrap your app

```tsx
// main.tsx or app/layout.tsx
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

### Step 2: Annotate elements

Add `data-guide-pilot-*` attributes to the elements you want to highlight:

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

**Supported data attributes:**

| Attribute | Type | Description |
|---|---|---|
| `data-guide-pilot-tour` | `string` | Tour ID this step belongs to |
| `data-guide-pilot-step` | `number` | Step order (ascending) |
| `data-guide-pilot-title` | `string` | Step heading |
| `data-guide-pilot-content` | `string` | Step body text |
| `data-guide-pilot-type` | `string` | `tooltip` \| `spotlight` \| `modal` \| `inline` |
| `data-guide-pilot-placement` | `string` | Tooltip placement (e.g. `bottom`, `right`) |

### Step 3: Start the tour

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

## Option 2 — Programmatic Config

Define tours as TypeScript objects for full control over steps, callbacks, and behaviour:

```tsx
import { GuidePilotProvider, useTour } from 'guide-pilot';
import type { TourConfig } from 'guide-pilot';
import 'guide-pilot/styles';

const onboardingTour: TourConfig = {
  id: 'onboarding',
  missingTargetStrategy: 'skip',
  onComplete: () => localStorage.setItem('onboarding_done', '1'),
  steps: [
    {
      id: 'step-1',
      order: 1,
      target: '#new-project-btn',
      title: 'Create a project',
      content: 'Click here to create your first project.',
      placement: 'bottom',
    },
    {
      id: 'step-2',
      order: 2,
      target: '#project-name-input',
      title: 'Name your project',
      content: 'Give it a memorable name.',
      type: 'spotlight',
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

## Option 3 — Inline Steps

Pass steps directly to `startTour()` without pre-registering a config:

```tsx
import { useTour } from 'guide-pilot';

function QuickTour() {
  const { startTour } = useTour();

  return (
    <button onClick={() =>
      startTour([
        { id: 's1', target: '#save-btn', content: 'Save your work here.', placement: 'top' },
        { id: 's2', target: '#share-btn', content: 'Share with your team.', placement: 'left' },
      ])
    }>
      Show me around
    </button>
  );
}
```

---

## Next Steps

- [Step Types](rendering/step-types.md) — learn about Tooltip, Spotlight, Modal, and InlineHint
- [useTour() API](api/use-tour.md) — full hook reference
- [TourConfig](api/tour-config.md) — all config options
- [Theming](styling/theming.md) — CSS variables and customization
