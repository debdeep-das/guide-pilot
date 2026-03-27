# Tour Frequency — Showing a Tour a Limited Number of Times

GuidePilot runs a tour whenever `startTour()` is called. Deciding *when* to call it — and how many times — is application logic. This guide covers the most common patterns.

---

## Show a tour at most N times

Use `localStorage` to track how many times the tour has been shown:

```ts
// utils/tourGuard.ts
const STORAGE_KEY = 'guide_pilot_shown_count';
const MAX_TIMES = 3;

export function shouldShowTour(): boolean {
  const count = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
  return count < MAX_TIMES;
}

export function recordTourShown(): void {
  const count = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
  localStorage.setItem(STORAGE_KEY, String(count + 1));
}
```

```tsx
// App.tsx
import { useEffect } from 'react';
import { useTour } from 'guide-pilot';
import { shouldShowTour, recordTourShown } from './utils/tourGuard';

function App() {
  const { startTour } = useTour();

  useEffect(() => {
    if (shouldShowTour()) {
      startTour(onboardingTour);
      recordTourShown();
    }
  }, []);
}
```

---

## Show a tour only once (never repeat)

```ts
const STORAGE_KEY = 'onboarding_complete';

useEffect(() => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    startTour(onboardingTour);
  }
}, []);

// In your TourConfig:
const onboardingTour: TourConfig = {
  id: 'onboarding',
  onComplete: () => localStorage.setItem(STORAGE_KEY, '1'),
  onSkip:     () => localStorage.setItem(STORAGE_KEY, '1'),
};
```

This marks the tour as done whether the user completes it or skips it.

---

## Reset the count on logout

If your app supports multiple users on the same device, scope the key to the user:

```ts
function getTourKey(userId: string) {
  return `guide_pilot_shown_${userId}`;
}

export function shouldShowTour(userId: string): boolean {
  const count = parseInt(localStorage.getItem(getTourKey(userId)) ?? '0', 10);
  return count < 3;
}

export function recordTourShown(userId: string): void {
  const key = getTourKey(userId);
  const count = parseInt(localStorage.getItem(key) ?? '0', 10);
  localStorage.setItem(key, String(count + 1));
}
```

---

## Server-side persistence

For apps where users log in from multiple devices, store the count server-side:

```ts
useEffect(() => {
  async function maybeShowTour() {
    const { tourShownCount } = await api.getUserPreferences();
    if (tourShownCount < 3) {
      startTour(onboardingTour);
      await api.incrementTourShownCount();
    }
  }
  maybeShowTour();
}, []);
```

---

## Why this is application logic

GuidePilot intentionally does not manage tour frequency or persistence. The library's job is to run a tour when told to. Whether to show it depends on:

- Your storage backend (localStorage, cookie, database)
- Your user model (anonymous vs authenticated)
- Your business rules (show 3 times, show once, show until completed)

Keeping this in the application means you have full control with no hidden opinions from the library.
