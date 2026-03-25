import React, { useEffect, useRef } from 'react';
import { TourStep, TourConfig } from '../../types';
import { StepContent } from '../StepContent';
import { tourStore } from '../../store/tourStore';

interface ModalProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  config: TourConfig | null;
  tooltipClassName?: string;
  overlayClassName?: string;
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function Modal({
  step,
  stepIndex,
  totalSteps,
  config,
  tooltipClassName,
  overlayClassName,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const el = dialogRef.current;
    if (el) {
      const first = el.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }
    return () => {
      (previousFocusRef.current as HTMLElement | null)?.focus();
    };
  }, []);

  useEffect(() => {
    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', trapFocus);
    return () => window.removeEventListener('keydown', trapFocus);
  }, []);

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

  const classNames = ['guide-pilot-modal', tooltipClassName, config?.tooltipClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div
        className={['guide-pilot-modal-overlay', overlayClassName, config?.overlayClassName].filter(Boolean).join(' ')}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className={classNames}
        role="dialog"
        aria-modal="true"
        aria-label={step.title ?? 'Tour step'}
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
