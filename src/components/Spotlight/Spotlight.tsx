import React, { useEffect } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  type Placement,
} from '@floating-ui/react';
import { TourStep, TourConfig } from '../../types';
import { StepContent } from '../StepContent';
import { SpotlightOverlay } from './SpotlightOverlay';
import { tourStore } from '../../store/tourStore';

interface SpotlightProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  config: TourConfig | null;
  targetEl: Element | null;
  tooltipClassName?: string;
  overlayClassName?: string;
}

export function Spotlight({
  step,
  stepIndex,
  totalSteps,
  config,
  targetEl,
  tooltipClassName,
  overlayClassName,
}: SpotlightProps) {
  const rawPlacement = step.placement ?? config?.defaultPlacement ?? 'bottom';
  const placement = rawPlacement === 'auto' ? 'bottom' : (rawPlacement as Placement);

  const { refs, floatingStyles } = useFloating({
    placement,
    strategy: 'fixed',
    middleware: [
      offset(step.offset ?? 12),
      flip({ fallbackAxisSideDirection: 'start' }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (targetEl) refs.setReference(targetEl);
  }, [targetEl, refs]);

  function handleNext() {
    step.afterLeave?.();
    if (stepIndex >= totalSteps - 1) {
      tourStore.dispatch({ type: 'COMPLETE_TOUR' });
      config?.onComplete?.();
    } else {
      tourStore.dispatch({ type: 'NEXT_STEP' });
    }
  }

  function handlePrev() {
    step.afterLeave?.();
    tourStore.dispatch({ type: 'PREV_STEP' });
  }

  function handleSkip() {
    step.afterLeave?.();
    tourStore.dispatch({ type: 'SKIP_TOUR' });
    config?.onSkip?.();
  }

  const dialogId = `guide-pilot-spotlight-${step.id}`;
  const classNames = ['guide-pilot-spotlight-content', tooltipClassName, config?.tooltipClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <SpotlightOverlay
        targetEl={targetEl}
        padding={step.spotlightPadding ?? 8}
        overlayClassName={overlayClassName ?? config?.overlayClassName}
        allowInteraction={step.allowInteraction}
      />
      <div
        id={dialogId}
        ref={refs.setFloating}
        style={floatingStyles}
        className={classNames}
        role="dialog"
        aria-modal="false"
      >
        <StepContent
          step={step}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          config={config}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={handleSkip}
        />
      </div>
    </>
  );
}
