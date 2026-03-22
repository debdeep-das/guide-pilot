# SSR Support

GuidePilot is safe to use in SSR environments including Next.js, Remix, and React Server Components.

---

## Rules

| Rule | Reason |
|---|---|
| No DOM access during render | `document`, `window`, and `Element` are not available on the server |
| All DOM logic runs inside `useEffect` | `useEffect` is not called on the server |
| Provider renders `null` on server | Prevents hydration mismatches |
| `useSyncExternalStore` server snapshot returns idle state | Concurrent-safe SSR with consistent initial render |

---

## Next.js — App Router (13+)

The Provider is compatible with React Server Components as a client boundary wrapper:

```tsx
// app/layout.tsx
import { GuidePilotProvider } from 'guide-pilot';
import 'guide-pilot/styles';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="guide-pilot-root" />
        <GuidePilotProvider>
          {children}
        </GuidePilotProvider>
      </body>
    </html>
  );
}
```

The Provider itself has a `'use client'` directive. Server Components inside it remain server-rendered — only the Provider's own logic runs client-side.

---

## Next.js — Pages Router (12 and below)

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { GuidePilotProvider } from 'guide-pilot';
import 'guide-pilot/styles';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GuidePilotProvider>
      <Component {...pageProps} />
    </GuidePilotProvider>
  );
}
```

---

## Avoiding Hydration Mismatches

The most common SSR issue is calling `startTour()` or reading `isActive` during render:

```tsx
// ❌ Wrong — reads tour state during render, may differ between server and client
function MyComponent() {
  const { isActive } = useTour();
  return <div>{isActive ? 'Tour running' : 'No tour'}</div>;
}
```

```tsx
// ✅ Correct — defer to useEffect or event handlers
function MyComponent() {
  const { startTour } = useTour();

  useEffect(() => {
    // Safe: this runs only on the client, after hydration
    if (!localStorage.getItem('tour_done')) {
      startTour('onboarding');
    }
  }, []);

  return <button onClick={() => startTour('onboarding')}>Start tour</button>;
}
```

---

## What Happens on the Server

- `<GuidePilotProvider>` renders its children but no GuidePilot UI
- `useTour()` returns idle state (`isActive: false`, `currentStep: null`, etc.)
- All action functions (`startTour`, `nextStep`, etc.) are no-ops
- No warnings are emitted for the server no-ops

This means the rendered HTML is identical between server and client before hydration — no mismatch.

---

## Dynamic Imports (optional)

If you want to explicitly prevent GuidePilot from being included in the SSR bundle:

```tsx
// Next.js dynamic import with SSR disabled
import dynamic from 'next/dynamic';

const GuidePilotProvider = dynamic(
  () => import('guide-pilot').then(m => m.GuidePilotProvider),
  { ssr: false }
);
```

This is optional — the library handles SSR safely without it. Use only if you need to reduce server-side bundle size.
