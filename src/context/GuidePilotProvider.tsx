import React, { useEffect, useSyncExternalStore } from 'react';
import { tourStore } from '../store/tourStore';
import { GuidePilotContext } from './GuidePilotContext';
import { GuidePilotProviderProps, TourStatus } from '../types';
import { StepRenderer } from '../components/StepRenderer';
import { GuidePilotErrorBoundary } from '../components/GuidePilotErrorBoundary';
import { scanForSteps } from '../utils/domScanner';
import { mergeSteps } from '../utils/mergeSteps';

export function GuidePilotProvider({
  children,
  tours = [],
  scanOnMount: _scanOnMount = true,
  scanRoot = 'body',
  watchDom = false,
  portalTarget = null,
  tooltipClassName,
  overlayClassName,
}: GuidePilotProviderProps) {
  const state = useSyncExternalStore(
    tourStore.subscribe,
    tourStore.getState,
    tourStore.getState,
  );

  // Register pre-defined tours
  useEffect(() => {
    tours.forEach((t) => tourStore.registerTour(t));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scan DOM when a tour starts
  useEffect(() => {
    if (state.status !== TourStatus.Running || !state.activeTourId) return;
    if (typeof document === 'undefined') return;

    const root = document.querySelector(scanRoot) ?? document.body;
    const scanned = scanForSteps(state.activeTourId, root);
    const registry = tourStore.getRegistry();
    const config = registry.get(state.activeTourId);
    const configSteps = config?.steps ?? [];

    const merged = mergeSteps(scanned, configSteps);
    if (merged.length > 0) {
      tourStore.dispatch({ type: 'SET_STEPS', steps: merged });
    }
  }, [state.status, state.activeTourId, scanRoot]);

  // watchDom MutationObserver
  useEffect(() => {
    if (!watchDom || typeof MutationObserver === 'undefined') return;

    let debounceTimer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const s = tourStore.getState();
        if (s.status !== TourStatus.Running || !s.activeTourId) return;
        const root = document.querySelector(scanRoot) ?? document.body;
        const scanned = scanForSteps(s.activeTourId, root);
        const config = tourStore.getRegistry().get(s.activeTourId);
        const merged = mergeSteps(scanned, config?.steps ?? []);
        if (merged.length > 0) {
          tourStore.dispatch({ type: 'SET_STEPS', steps: merged });
        }
      }, 50);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      clearTimeout(debounceTimer);
    };
  }, [watchDom, scanRoot]);

  const isActive = state.status === TourStatus.Running;
  const activeConfig = state.activeTourId
    ? tourStore.getRegistry().get(state.activeTourId) ?? null
    : null;

  const currentStep = isActive && state.steps.length > 0
    ? state.steps[state.currentStepIndex] ?? null
    : null;

  return (
    <GuidePilotContext.Provider value={{ portalTarget, tooltipClassName, overlayClassName, activeConfig }}>
      {children}
      {isActive && currentStep && (
        <GuidePilotErrorBoundary>
          <StepRenderer
            step={currentStep}
            stepIndex={state.currentStepIndex}
            totalSteps={state.steps.length}
            config={activeConfig}
            portalTarget={portalTarget}
          />
        </GuidePilotErrorBoundary>
      )}
    </GuidePilotContext.Provider>
  );
}
