import React, { useRef, useEffect } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
  FloatingArrow,
  type Placement,
} from '@floating-ui/react';
import { TourStep, TourConfig } from '../../types';
import { StepContent } from '../StepContent';
import { tourStore } from '../../store/tourStore';

interface TooltipProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  config: TourConfig | null;
  targetEl: Element | null;
  tooltipClassName?: string;
}

export function Tooltip({
  step,
  stepIndex,
  totalSteps,
  config,
  targetEl,
  tooltipClassName,
}: TooltipProps) {
  const arrowRef = useRef<SVGSVGElement>(null);

  const rawPlacement = step.placement ?? config?.defaultPlacement ?? 'bottom';
  const placement = rawPlacement === 'auto' ? 'bottom' : (rawPlacement as Placement);

  const { refs, floatingStyles, middlewareData, context } = useFloating({
    placement,
    strategy: 'fixed',
    middleware: [
      offset(step.offset ?? 12),
      flip({ fallbackAxisSideDirection: 'start' }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (targetEl) {
      refs.setReference(targetEl);
    }
  }, [targetEl, refs]);

  const tooltipId = `guide-pilot-tooltip-${step.id}`;

  useEffect(() => {
    if (!targetEl) return;
    const prev = targetEl.getAttribute('aria-describedby');
    targetEl.setAttribute('aria-describedby', tooltipId);
    return () => {
      prev
        ? targetEl.setAttribute('aria-describedby', prev)
        : targetEl.removeAttribute('aria-describedby');
    };
  }, [targetEl, tooltipId]);

  function handleNext() {
    const s = tourStore.getState();
    step.afterLeave?.();
    if (stepIndex >= totalSteps - 1) {
      tourStore.dispatch({ type: 'COMPLETE_TOUR' });
      config?.onComplete?.();
    } else {
      tourStore.dispatch({ type: 'NEXT_STEP' });
      const next = s.steps[stepIndex + 1];
      if (next) config?.onStepChange?.(next, stepIndex + 1);
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

  const classNames = ['guide-pilot-tooltip', tooltipClassName, config?.tooltipClassName]
    .filter(Boolean)
    .join(' ');

  // middlewareData is used by FloatingArrow via context
  void middlewareData;

  return (
    <div
      id={tooltipId}
      ref={refs.setFloating}
      style={floatingStyles}
      className={classNames}
      role="tooltip"
    >
      <FloatingArrow ref={arrowRef} context={context} className="guide-pilot-arrow" />
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
  );
}
