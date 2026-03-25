import { useEffect } from 'react';
import { tourStore } from '../store/tourStore';
import { TourStatus } from '../types';

export function useKeyboardNav(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const state = tourStore.getState();
      if (state.status !== TourStatus.Running) return;

      if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
        if (e.key === 'Tab') e.preventDefault();
        const isLast = state.currentStepIndex >= state.steps.length - 1;
        if (isLast) {
          tourStore.dispatch({ type: 'COMPLETE_TOUR' });
        } else {
          tourStore.dispatch({ type: 'NEXT_STEP' });
        }
      } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
        if (e.key === 'Tab') e.preventDefault();
        tourStore.dispatch({ type: 'PREV_STEP' });
      } else if (e.key === 'Escape') {
        tourStore.dispatch({ type: 'SKIP_TOUR' });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
