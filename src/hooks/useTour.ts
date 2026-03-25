import { useSyncExternalStore, useCallback } from 'react';
import { tourStore } from '../store/tourStore';
import { TourConfig, TourStep, TourStatus, UseTourReturn } from '../types';
import { warnDev } from '../utils/devWarnings';

export function useTour(): UseTourReturn {
  const state = useSyncExternalStore(
    tourStore.subscribe,
    tourStore.getState,
    tourStore.getState,
  );

  const startTour = useCallback((input: string | TourStep[] | TourConfig) => {
    if (typeof input === 'string') {
      // tourId — look up registry
      const registry = tourStore.getRegistry();
      const config = registry.get(input);
      if (!config) {
        warnDev(`startTour('${input}'): tour not found in registry. Register it via <GuidePilotProvider tours={[...]}> or registerTour().`);
        return;
      }
      tourStore.dispatch({
        type: 'START_TOUR',
        tourId: input,
        steps: config.steps ?? [],
        startFrom: 0,
      });
    } else if (Array.isArray(input)) {
      // Inline steps array
      tourStore.dispatch({
        type: 'START_TOUR',
        tourId: '__inline__',
        steps: input,
        startFrom: 0,
      });
    } else {
      // TourConfig object
      tourStore.registerTour(input);
      tourStore.dispatch({
        type: 'START_TOUR',
        tourId: input.id,
        steps: input.steps ?? [],
        startFrom: 0,
      });
    }
  }, []);

  const stopTour = useCallback(() => {
    const s = tourStore.getState();
    const config = s.activeTourId ? tourStore.getRegistry().get(s.activeTourId) : null;
    tourStore.dispatch({ type: 'STOP_TOUR' });
    config?.onComplete?.();
  }, []);

  const nextStep = useCallback(() => {
    const s = tourStore.getState();
    const isLast = s.currentStepIndex >= s.steps.length - 1;
    if (isLast) {
      const config = s.activeTourId ? tourStore.getRegistry().get(s.activeTourId) : null;
      tourStore.dispatch({ type: 'COMPLETE_TOUR' });
      config?.onComplete?.();
    } else {
      const config = s.activeTourId ? tourStore.getRegistry().get(s.activeTourId) : null;
      const nextIdx = s.currentStepIndex + 1;
      tourStore.dispatch({ type: 'NEXT_STEP' });
      const nextStepObj = s.steps[nextIdx];
      if (nextStepObj) config?.onStepChange?.(nextStepObj, nextIdx);
    }
  }, []);

  const prevStep = useCallback(() => {
    const s = tourStore.getState();
    if (s.currentStepIndex === 0) return;
    const config = s.activeTourId ? tourStore.getRegistry().get(s.activeTourId) : null;
    const prevIdx = s.currentStepIndex - 1;
    tourStore.dispatch({ type: 'PREV_STEP' });
    const prevStepObj = s.steps[prevIdx];
    if (prevStepObj) config?.onStepChange?.(prevStepObj, prevIdx);
  }, []);

  const goToStep = useCallback((index: number) => {
    const s = tourStore.getState();
    const clamped = Math.max(0, Math.min(index, s.steps.length - 1));
    const config = s.activeTourId ? tourStore.getRegistry().get(s.activeTourId) : null;
    tourStore.dispatch({ type: 'GO_TO_STEP', index: clamped });
    const stepObj = s.steps[clamped];
    if (stepObj) config?.onStepChange?.(stepObj, clamped);
  }, []);

  const skipTour = useCallback(() => {
    const s = tourStore.getState();
    const config = s.activeTourId ? tourStore.getRegistry().get(s.activeTourId) : null;
    tourStore.dispatch({ type: 'SKIP_TOUR' });
    config?.onSkip?.();
  }, []);

  const registerTour = useCallback((config: TourConfig) => {
    tourStore.registerTour(config);
  }, []);

  const isActive = state.status === TourStatus.Running;
  const currentStep = isActive && state.steps.length > 0
    ? state.steps[state.currentStepIndex] ?? null
    : null;

  return {
    isActive,
    activeTourId: state.activeTourId,
    currentStep,
    currentStepIndex: state.currentStepIndex,
    totalSteps: state.steps.length,
    isFirstStep: state.currentStepIndex === 0,
    isLastStep: state.currentStepIndex >= state.steps.length - 1,
    status: state.status,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    goToStep,
    skipTour,
    registerTour,
  };
}
