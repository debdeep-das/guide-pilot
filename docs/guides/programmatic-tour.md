# Guide: Programmatic Tour

This guide covers building tours entirely in TypeScript — no data attributes. Use this when you need full control over step logic, async navigation, callbacks, or dynamic step lists.

---

## When to Use This Approach

- Steps need to trigger route changes or async operations (`beforeEnter`)
- Tour content is dynamic (fetched from an API, based on user role, etc.)
- You want TypeScript types and IDE autocompletion for all step config
- You need fine-grained lifecycle hooks

---

## Basic Programmatic Tour

```ts
import { useTour } from 'guide-pilot';
import type { TourConfig } from 'guide-pilot';

const featureTour: TourConfig = {
  id: 'feature-tour',
  missingTargetStrategy: 'skip',

  steps: [
    {
      id: 'step-intro',
      order: 1,
      type: 'modal',
      title: 'New: Advanced Filters',
      content: 'We\'ve added powerful filtering options. Let us show you.',
      nextButtonLabel: 'Show me',
    },
    {
      id: 'step-filters',
      order: 2,
      target: '#filter-panel',
      type: 'spotlight',
      title: 'Filter Panel',
      content: 'Use these options to narrow your results.',
      spotlightPadding: 12,
    },
    {
      id: 'step-apply',
      order: 3,
      target: '#apply-filters-btn',
      title: 'Apply Filters',
      content: 'Click here to apply your selections.',
      placement: 'top',
    },
  ],

  onComplete: () => {
    analytics.track('feature_tour_complete', { feature: 'advanced_filters' });
  },
  onSkip: () => {
    analytics.track('feature_tour_skipped');
  },
};
```

Register and start:

```tsx
function App() {
  return (
    <GuidePilotProvider tours={[featureTour]}>
      <YourApp />
    </GuidePilotProvider>
  );
}

function FeatureBanner() {
  const { startTour } = useTour();
  return (
    <button onClick={() => startTour('feature-tour')}>
      See what's new
    </button>
  );
}
```

---

## Async Navigation Steps

Use `beforeEnter` to navigate to the right route before a step renders:

```ts
import { router } from './router';

const onboardingTour: TourConfig = {
  id: 'onboarding',
  steps: [
    {
      id: 'dashboard',
      order: 1,
      target: '#dashboard-overview',
      title: 'Your Dashboard',
      content: 'Everything starts here.',
      beforeEnter: async () => {
        await router.push('/dashboard');
      },
    },
    {
      id: 'projects',
      order: 2,
      target: '#projects-list',
      title: 'Your Projects',
      content: 'All your active projects appear here.',
      beforeEnter: async () => {
        await router.push('/projects');
      },
    },
    {
      id: 'settings',
      order: 3,
      target: '#account-settings',
      title: 'Account Settings',
      content: 'Manage your profile and preferences.',
      beforeEnter: async () => {
        await router.push('/settings');
      },
    },
  ],
};
```

---

## Dynamic Step Lists

Build steps at runtime based on user role or feature flags:

```ts
function buildTourSteps(user: User): TourStep[] {
  const steps: TourStep[] = [
    {
      id: 'welcome',
      order: 1,
      type: 'modal',
      title: `Welcome, ${user.firstName}!`,
      content: 'Let\'s get you set up.',
    },
  ];

  if (user.role === 'admin') {
    steps.push({
      id: 'admin-panel',
      order: 2,
      target: '#admin-panel',
      title: 'Admin Panel',
      content: 'As an admin, you have access to user management here.',
    });
  }

  steps.push({
    id: 'profile',
    order: 10,
    target: '#user-profile',
    title: 'Your Profile',
    content: 'Update your details here.',
  });

  return steps;
}
```

```tsx
function App({ user }: { user: User }) {
  const { registerTour, startTour } = useTour();

  useEffect(() => {
    registerTour({
      id: 'onboarding',
      steps: buildTourSteps(user),
      onComplete: () => markOnboardingComplete(user.id),
    });
  }, [user]);

  return <button onClick={() => startTour('onboarding')}>Start tour</button>;
}
```

---

## Resuming a Tour from a Specific Step

```tsx
// Resume from step index 2 (the third step, 0-based)
startTour('onboarding', { startFrom: 2 });
```

Useful for re-entry flows where the user has partially completed a tour.

---

## Reacting to Step Changes

```ts
const tour: TourConfig = {
  id: 'onboarding',
  onStepChange: (step, index) => {
    // Track which steps the user reaches
    analytics.track('tour_step_viewed', {
      tourId: 'onboarding',
      stepId: step.id,
      stepIndex: index,
    });
  },
};
```

---

## Cleanup with afterLeave

```ts
{
  id: 'interactive-step',
  target: '#search-input',
  type: 'spotlight',
  allowInteraction: true,
  afterLeave: () => {
    // Reset any state changed during the interactive step
    searchRef.current?.clear();
  },
}
```

---

## Related

- [TourConfig reference](../api/tour-config.md)
- [TourStep reference](../api/tour-step.md)
- [Execution Model](../core-concepts/execution-model.md)
- [Basic Tour guide](basic-tour.md)
