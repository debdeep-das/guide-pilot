import React, { useEffect, useState } from 'react';
import { TourStep, TourConfig, StepType } from '../types';
import { Portal } from './Portal';
import { Tooltip } from './Tooltip/Tooltip';
import { Spotlight } from './Spotlight/Spotlight';
import { InlineHint } from './InlineHint/InlineHint';
import { Modal } from './Modal/Modal';
import { waitForElement } from '../utils/waitForElement';
import { tourStore } from '../store/tourStore';
import { warnDev } from '../utils/devWarnings';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useScrollIntoView } from '../hooks/useScrollIntoView';

interface StepRendererProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  config: TourConfig | null;
  portalTarget: Element | null;
}

export function StepRenderer({
  step,
  stepIndex,
  totalSteps,
  config,
  portalTarget,
}: StepRendererProps) {
  const [targetEl, setTargetEl] = useState<Element | null>(null);
  const keyboardEnabled = config?.allowKeyboardNavigation !== false;

  useKeyboardNav(keyboardEnabled);
  useScrollIntoView(targetEl);

  useEffect(() => {
    setTargetEl(null);
    const stepType = step.type ?? StepType.Tooltip;
    if (stepType === StepType.Modal) return; // modal has no target

    const strategy = config?.missingTargetStrategy ?? 'skip';
    const timeout = step.targetTimeout ?? 3000;

    let cancelled = false;

    async function resolve() {
      try {
        const el = await waitForElement(step.target, { timeout });
        if (!cancelled) setTargetEl(el);
      } catch {
        if (cancelled) return;
        if (strategy === 'fail') {
          config?.onError?.({
            type: 'ELEMENT_NOT_FOUND',
            message: `Target not found: ${step.target}`,
            stepId: step.id,
            tourId: tourStore.getState().activeTourId ?? undefined,
          });
          tourStore.dispatch({ type: 'STOP_TOUR' });
        } else {
          warnDev(`Target not found for step "${step.id}": ${step.target} — skipping`);
          tourStore.dispatch({ type: 'NEXT_STEP' });
        }
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [step.id, step.target, config]);

  const stepType = step.type ?? StepType.Tooltip;

  if (stepType === StepType.Modal) {
    return (
      <Portal target={portalTarget}>
        <Modal
          step={step}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          config={config}
        />
      </Portal>
    );
  }

  if (!targetEl) return null;

  return (
    <Portal target={portalTarget}>
      {stepType === StepType.Tooltip && (
        <Tooltip
          step={step}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          config={config}
          targetEl={targetEl}
        />
      )}
      {stepType === StepType.Spotlight && (
        <Spotlight
          step={step}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          config={config}
          targetEl={targetEl}
        />
      )}
      {stepType === StepType.InlineHint && (
        <InlineHint
          step={step}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          config={config}
          targetEl={targetEl}
        />
      )}
    </Portal>
  );
}
