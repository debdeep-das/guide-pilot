import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GuidePilotProvider } from '../../src/context/GuidePilotProvider';
import { useTour } from '../../src/hooks/useTour';
import { TourStatus, TourConfig, TourStep } from '../../src/types';
import { resetStore } from '../helpers/resetStore';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GuidePilotProvider>{children}</GuidePilotProvider>
);

const steps: TourStep[] = [
  { id: 's1', order: 1, target: '#a', content: 'Step 1' },
  { id: 's2', order: 2, target: '#b', content: 'Step 2' },
  { id: 's3', order: 3, target: '#c', content: 'Step 3' },
];

beforeEach(() => resetStore());

describe('useTour — initial state', () => {
  it('returns idle state by default', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    expect(result.current.isActive).toBe(false);
    expect(result.current.status).toBe(TourStatus.Idle);
    expect(result.current.activeTourId).toBeNull();
    expect(result.current.currentStep).toBeNull();
    expect(result.current.totalSteps).toBe(0);
  });

  it('isFirstStep and isLastStep are true when idle', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(true);
  });
});

describe('useTour — startTour', () => {
  it('starts a tour with an inline steps array', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour(steps));
    expect(result.current.isActive).toBe(true);
    expect(result.current.totalSteps).toBe(3);
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.activeTourId).toBe('__inline__');
  });

  it('starts a tour with a TourConfig object', () => {
    const config: TourConfig = { id: 'cfg-tour', steps };
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour(config));
    expect(result.current.isActive).toBe(true);
    expect(result.current.activeTourId).toBe('cfg-tour');
  });

  it('starts a tour by registered id', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.registerTour({ id: 'reg-tour', steps }));
    act(() => result.current.startTour('reg-tour'));
    expect(result.current.isActive).toBe(true);
    expect(result.current.activeTourId).toBe('reg-tour');
  });

  it('warns and does nothing when tourId is not in registry', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour('unknown-tour'));
    expect(result.current.isActive).toBe(false);
    warn.mockRestore();
  });

  it('sets isFirstStep on first step', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour(steps));
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });
});

describe('useTour — navigation', () => {
  it('nextStep advances to next step', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour(steps));
    act(() => result.current.nextStep());
    expect(result.current.currentStepIndex).toBe(1);
  });

  it('nextStep on last step sets Complete status', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour(steps));
    act(() => result.current.nextStep());
    act(() => result.current.nextStep());
    act(() => result.current.nextStep());
    expect(result.current.status).toBe(TourStatus.Complete);
  });

  it('prevStep goes back', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour(steps));
    act(() => result.current.nextStep());
    act(() => result.current.prevStep());
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('prevStep is no-op at first step', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour(steps));
    act(() => result.current.prevStep());
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('goToStep jumps to given index', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour(steps));
    act(() => result.current.goToStep(2));
    expect(result.current.currentStepIndex).toBe(2);
    expect(result.current.isLastStep).toBe(true);
  });
});

describe('useTour — stopTour / skipTour', () => {
  it('stopTour resets to idle', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour(steps));
    act(() => result.current.stopTour());
    expect(result.current.isActive).toBe(false);
    expect(result.current.status).toBe(TourStatus.Idle);
  });

  it('skipTour sets Skipped status', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour(steps));
    act(() => result.current.skipTour());
    expect(result.current.status).toBe(TourStatus.Skipped);
  });

  it('skipTour calls onSkip callback', () => {
    const onSkip = vi.fn();
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour({ id: 'skip-tour', steps, onSkip }));
    act(() => result.current.skipTour());
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('nextStep on last step calls onComplete callback', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour({ id: 'complete-tour', steps, onComplete }));
    act(() => result.current.nextStep());
    act(() => result.current.nextStep());
    act(() => result.current.nextStep());
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('onStepChange fires when navigating', () => {
    const onStepChange = vi.fn();
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.startTour({ id: 'sc-tour', steps, onStepChange }));
    act(() => result.current.nextStep());
    expect(onStepChange).toHaveBeenCalledWith(steps[1], 1);
  });
});

describe('useTour — registerTour', () => {
  it('registers a tour for later use', () => {
    const { result } = renderHook(() => useTour(), { wrapper });
    act(() => result.current.registerTour({ id: 'late-tour', steps }));
    act(() => result.current.startTour('late-tour'));
    expect(result.current.activeTourId).toBe('late-tour');
  });
});
