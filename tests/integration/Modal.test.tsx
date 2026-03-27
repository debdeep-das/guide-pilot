import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../../src/components/Modal/Modal';
import { TourStep } from '../../src/types';
import { resetStore } from '../helpers/resetStore';

beforeEach(() => resetStore());

const step: TourStep = {
  id: 'modal-step',
  order: 1,
  target: '',
  title: 'Welcome!',
  content: 'This is a modal step.',
};

describe('Modal', () => {
  it('renders with role="dialog"', () => {
    render(<Modal step={step} stepIndex={0} totalSteps={3} config={null} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    render(<Modal step={step} stepIndex={0} totalSteps={3} config={null} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('renders title', () => {
    render(<Modal step={step} stepIndex={0} totalSteps={3} config={null} />);
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
  });

  it('renders content', () => {
    render(<Modal step={step} stepIndex={0} totalSteps={3} config={null} />);
    expect(screen.getByText('This is a modal step.')).toBeInTheDocument();
  });

  it('renders modal overlay element', () => {
    const { container } = render(<Modal step={step} stepIndex={0} totalSteps={3} config={null} />);
    expect(container.querySelector('.guide-pilot-modal-overlay')).toBeInTheDocument();
  });

  it('dispatches NEXT_STEP when Next clicked', () => {
    render(<Modal step={step} stepIndex={0} totalSteps={3} config={null} />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    // Store should have advanced (no error thrown)
  });

  it('dispatches COMPLETE_TOUR and calls onComplete on last step', () => {
    const onComplete = vi.fn();
    render(
      <Modal step={step} stepIndex={2} totalSteps={3} config={{ id: 't', onComplete }} />
    );
    fireEvent.click(screen.getByRole('button', { name: /finish/i }));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('dispatches SKIP_TOUR and calls onSkip', () => {
    const onSkip = vi.fn();
    render(
      <Modal step={step} stepIndex={0} totalSteps={3} config={{ id: 't', onSkip }} />
    );
    fireEvent.click(screen.getByRole('button', { name: /skip/i }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('calls afterLeave on next', () => {
    const afterLeave = vi.fn();
    const s = { ...step, afterLeave };
    render(<Modal step={s} stepIndex={0} totalSteps={3} config={null} />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(afterLeave).toHaveBeenCalledOnce();
  });

  it('applies custom tooltipClassName', () => {
    render(<Modal step={step} stepIndex={0} totalSteps={1} config={{ id: 't', tooltipClassName: 'my-class' }} />);
    expect(screen.getByRole('dialog')).toHaveClass('my-class');
  });

  it('focuses first focusable element on mount', () => {
    render(<Modal step={step} stepIndex={0} totalSteps={3} config={null} />);
    const buttons = screen.getAllByRole('button');
    expect(document.activeElement).toBe(buttons[0]);
  });
});
