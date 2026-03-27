import React, { useEffect } from 'react';
import { useTour, TourConfig, StepType } from '../../src/index';

const demoTour: TourConfig = {
  id: 'demo',
  allowSkip: true,
  onComplete: () => alert('Tour complete!'),
  steps: [
    {
      id: 'welcome',
      order: 1,
      type: StepType.Modal,
      title: 'Welcome to GuidePilot!',
      content: "Let's take a quick tour of what this library can do.",
      nextButtonLabel: "Let's go!",
      target: '',
    },
    {
      id: 'tooltip-step',
      order: 2,
      type: StepType.Tooltip,
      target: '#new-project-btn',
      title: 'Create a project',
      content: 'Click here to create your first project.',
      placement: 'bottom',
    },
    {
      id: 'spotlight-step',
      order: 3,
      type: StepType.Spotlight,
      target: '#analytics-panel',
      title: 'Your analytics',
      content: 'This panel shows your activity. The spotlight focuses attention here.',
      spotlightPadding: 12,
    },
    {
      id: 'interactive-step',
      order: 4,
      type: StepType.Spotlight,
      target: '#search-input',
      title: 'Try searching',
      content: 'Type anything to search. The element is still interactive.',
      allowInteraction: true,
    },
    {
      id: 'inline-step',
      order: 5,
      type: StepType.InlineHint,
      target: '#help-link',
      title: 'Need help?',
      content: 'Click here any time for documentation.',
      placement: 'right',
    },
  ],
};

export default function App() {
  const { startTour, isActive, stopTour } = useTour();
  useEffect(() => {
    startTour(demoTour);
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto', padding: 32 }}>
      <h1 style={{ marginBottom: 8 }}>GuidePilot Demo</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>
        A lightweight React product tour library.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        <button
          id="new-project-btn"
          onClick={() => !isActive && startTour(demoTour)}
          style={{
            padding: '10px 20px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {isActive ? 'Tour running...' : 'Restart Tour'}
        </button>
        {isActive && (
          <button
            onClick={stopTour}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Stop Tour
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <div
          id="analytics-panel"
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Analytics</h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
            28 sessions this week
          </p>
        </div>
        <div
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Projects</h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>3 active projects</p>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          id="search-input"
          type="text"
          placeholder="Search projects..."
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <a
          id="help-link"
          href="#"
          style={{ color: '#2563eb', fontSize: 14, textDecoration: 'none' }}
          onClick={(e) => e.preventDefault()}
        >
          Documentation &amp; Help &rarr;
        </a>
      </div>

      <div style={{ marginTop: 48, padding: '16px 20px', background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
        <strong style={{ fontSize: 13 }}>Data-attribute mode</strong>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#0369a1' }}>
          Elements annotated with <code>data-guide-pilot-*</code> attrs are discovered automatically on tour start.
        </p>
        <button
          data-guide-pilot-tour="attr-tour"
          data-guide-pilot-step="1"
          data-guide-pilot-title="Annotated button"
          data-guide-pilot-content="This step was defined via data attributes — no JS config needed."
          data-guide-pilot-placement="top"
          onClick={() => !isActive && startTour('attr-tour')}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            background: '#0ea5e9',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Start data-attr tour
        </button>
      </div>
    </div>
  );
}
