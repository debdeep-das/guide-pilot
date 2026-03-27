import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepContent } from '../../src/components/StepContent';
import { TourStep } from '../../src/types';

const step: TourStep = {
  id: 'step-1',
  order: 1,
  target: '#el',
  title: 'My Title',
  content: 'My content text',
};

const noop = () => {};

describe('StepContent', () => {
  it('renders title', () => {
    render(<StepContent step={step} stepIndex={0} totalSteps={3} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('renders plain text content', () => {
    render(<StepContent step={step} stepIndex={0} totalSteps={3} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(screen.getByText('My content text')).toBeInTheDocument();
  });

  it('renders progress indicator', () => {
    render(<StepContent step={step} stepIndex={1} totalSteps={3} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('hides progress when only 1 step', () => {
    render(<StepContent step={step} stepIndex={0} totalSteps={1} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument();
  });

  it('renders Next button', () => {
    render(<StepContent step={step} stepIndex={0} totalSteps={3} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
  });

  it('shows Finish on last step', () => {
    render(<StepContent step={step} stepIndex={2} totalSteps={3} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument();
  });

  it('hides Back button on first step', () => {
    render(<StepContent step={step} stepIndex={0} totalSteps={3} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
  });

  it('shows Back button when not first step', () => {
    render(<StepContent step={step} stepIndex={1} totalSteps={3} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
  });

  it('shows Skip button by default', () => {
    render(<StepContent step={step} stepIndex={0} totalSteps={3} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
  });

  it('hides Skip when allowSkip is false', () => {
    render(<StepContent step={step} stepIndex={0} totalSteps={3} config={{ id: 't', allowSkip: false }} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
  });

  it('calls onNext when Next clicked', () => {
    const onNext = vi.fn();
    render(<StepContent step={step} stepIndex={0} totalSteps={3} config={null} onNext={onNext} onPrev={noop} onSkip={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('calls onPrev when Back clicked', () => {
    const onPrev = vi.fn();
    render(<StepContent step={step} stepIndex={1} totalSteps={3} config={null} onNext={noop} onPrev={onPrev} onSkip={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('calls onSkip when Skip clicked', () => {
    const onSkip = vi.fn();
    render(<StepContent step={step} stepIndex={0} totalSteps={3} config={null} onNext={noop} onPrev={noop} onSkip={onSkip} />);
    fireEvent.click(screen.getByRole('button', { name: /skip/i }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('uses custom nextButtonLabel', () => {
    const s = { ...step, nextButtonLabel: "Let's go!" };
    render(<StepContent step={s} stepIndex={0} totalSteps={3} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(screen.getByText("Let's go!")).toBeInTheDocument();
  });

  it('renders HTML content with contentType html', () => {
    const s = { ...step, content: '<b>bold text</b>', contentType: 'html' as const };
    const { container } = render(<StepContent step={s} stepIndex={0} totalSteps={1} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(container.querySelector('b')).toBeInTheDocument();
    expect(container.querySelector('b')?.textContent).toBe('bold text');
  });

  it('does not render HTML when contentType is text', () => {
    const s = { ...step, content: '<b>bold</b>' };
    const { container } = render(<StepContent step={s} stepIndex={0} totalSteps={1} config={null} onNext={noop} onPrev={noop} onSkip={noop} />);
    expect(container.querySelector('b')).not.toBeInTheDocument();
    expect(screen.getByText('<b>bold</b>')).toBeInTheDocument();
  });
});
