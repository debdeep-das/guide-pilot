import React from 'react';
import { TourStep, TourConfig } from '../types';
import { sanitizeHtml } from '../utils/sanitizeHtml';

interface StepContentProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  config: TourConfig | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function StepContent({
  step,
  stepIndex,
  totalSteps,
  config,
  onNext,
  onPrev,
  onSkip,
}: StepContentProps) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex >= totalSteps - 1;
  const allowSkip = config?.allowSkip !== false;

  const contentHtml =
    step.contentType === 'html' && step.content
      ? sanitizeHtml(step.content)
      : null;

  return (
    <div className="guide-pilot-step-content">
      {step.title && (
        <div className="guide-pilot-step-title">{step.title}</div>
      )}
      <div className="guide-pilot-step-body">
        {contentHtml ? (
          <p dangerouslySetInnerHTML={{ __html: contentHtml }} />
        ) : (
          <p>{step.content}</p>
        )}
      </div>
      {totalSteps > 1 && (
        <div className="guide-pilot-progress">
          {stepIndex + 1} / {totalSteps}
        </div>
      )}
      <div className="guide-pilot-nav">
        {allowSkip && (
          <button
            className="guide-pilot-btn guide-pilot-btn-ghost"
            onClick={onSkip}
            aria-label="Skip tour"
          >
            Skip
          </button>
        )}
        <div className="guide-pilot-nav-arrows">
          {!isFirst && (
            <button
              className="guide-pilot-btn guide-pilot-btn-ghost"
              onClick={onPrev}
              aria-label="Previous step"
            >
              ← Back
            </button>
          )}
          <button
            className="guide-pilot-btn guide-pilot-btn-primary"
            onClick={onNext}
            aria-label={isLast ? 'Finish tour' : 'Next step'}
          >
            {isLast ? 'Finish' : (step.nextButtonLabel ?? 'Next →')}
          </button>
        </div>
      </div>
    </div>
  );
}
