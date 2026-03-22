# Guide: Basic Tour

This guide walks through building a simple onboarding tour using data attributes — no JavaScript config required.

---

## What We're Building

A 3-step tour that:
1. Opens with a welcome modal
2. Spotlights the main navigation
3. Points to a create button with a tooltip

---

## Step 1: Install and add the Provider

```bash
npm install guide-pilot
```

```tsx
// main.tsx
import { GuidePilotProvider } from 'guide-pilot';
import 'guide-pilot/styles';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GuidePilotProvider>
    <App />
  </GuidePilotProvider>
);
```

---

## Step 2: Annotate your HTML elements

Add `data-guide-pilot-*` attributes to the elements you want to highlight. The tour ID (`onboarding`) connects all steps together.

```html
<!-- Step 1: Welcome modal — no target element needed -->
<!-- We'll trigger this programmatically, not via a data attribute -->

<!-- Step 2: Spotlight the navigation -->
<nav
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="2"
  data-guide-pilot-type="spotlight"
  data-guide-pilot-title="Your navigation"
  data-guide-pilot-content="Use these links to move between sections."
>
  <a href="/dashboard">Dashboard</a>
  <a href="/projects">Projects</a>
  <a href="/settings">Settings</a>
</nav>

<!-- Step 3: Tooltip on the create button -->
<button
  data-guide-pilot-tour="onboarding"
  data-guide-pilot-step="3"
  data-guide-pilot-title="Create your first project"
  data-guide-pilot-content="Click here to get started."
  data-guide-pilot-placement="bottom"
>
  New Project
</button>
```

---

## Step 3: Add the welcome modal via config

The welcome modal (step 1) has no target element, so we define it as a config step and mix it with the DOM steps:

```tsx
import { GuidePilotProvider } from 'guide-pilot';
import type { TourConfig } from 'guide-pilot';

const onboardingTour: TourConfig = {
  id: 'onboarding',
  steps: [
    {
      id: 'welcome',
      order: 1,
      type: 'modal',
      title: 'Welcome!',
      content: 'Let us show you around. This takes about 1 minute.',
      nextButtonLabel: "Let's go",
    },
  ],
  onComplete: () => localStorage.setItem('onboarding_done', '1'),
};

// GuidePilot merges these config steps with the data-attribute steps (order 2 and 3)
<GuidePilotProvider tours={[onboardingTour]}>
  <App />
</GuidePilotProvider>
```

---

## Step 4: Start the tour

Add a trigger — for example, auto-start on first visit:

```tsx
import { useTour } from 'guide-pilot';
import { useEffect } from 'react';

function OnboardingController() {
  const { startTour } = useTour();

  useEffect(() => {
    if (!localStorage.getItem('onboarding_done')) {
      startTour('onboarding');
    }
  }, []);

  return null;
}
```

Or a manual trigger button:

```tsx
function TourButton() {
  const { startTour } = useTour();
  return (
    <button onClick={() => startTour('onboarding')}>
      Take a tour
    </button>
  );
}
```

---

## Result

When the tour runs:
1. A centered modal appears: "Welcome! Let us show you around."
2. The navigation is spotlighted with an overlay
3. A tooltip appears below the "New Project" button

---

## Next Steps

- Add more step types: see [Step Types](../rendering/step-types.md)
- Customize colours: see [Theming](../styling/theming.md)
- Add lifecycle callbacks: see [TourConfig](../api/tour-config.md)
- Build a fully programmatic tour: see [Programmatic Tour](programmatic-tour.md)
