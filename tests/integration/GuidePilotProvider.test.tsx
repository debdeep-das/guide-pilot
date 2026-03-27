import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { GuidePilotProvider } from '../../src/context/GuidePilotProvider';
import { useTour } from '../../src/hooks/useTour';
import { TourConfig, TourStep } from '../../src/types';
import { resetStore } from '../helpers/resetStore';

beforeEach(() => resetStore());

const modalStep: TourStep = {
  id: 'welcome',
  order: 1,
  target: '',
  title: 'Welcome!',
  content: 'Tour started.',
  type: 'modal',
};

describe('GuidePilotProvider', () => {
  it('renders children', () => {
    render(
      <GuidePilotProvider>
        <div>App content</div>
      </GuidePilotProvider>
    );
    expect(screen.getByText('App content')).toBeInTheDocument();
  });

  it('renders nothing extra when idle', () => {
    const { container } = render(
      <GuidePilotProvider>
        <div>App</div>
      </GuidePilotProvider>
    );
    expect(container.querySelector('.guide-pilot-modal')).not.toBeInTheDocument();
  });

  it('registers tours passed via tours prop', () => {
    const config: TourConfig = { id: 'provider-tour', steps: [modalStep] };
    let startTourFn: ((input: any) => void) | null = null;

    function Inner() {
      const { startTour } = useTour();
      startTourFn = startTour;
      return null;
    }

    render(
      <GuidePilotProvider tours={[config]}>
        <Inner />
      </GuidePilotProvider>
    );

    act(() => startTourFn!('provider-tour'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders Modal step when tour is active', () => {
    function Inner() {
      const { startTour } = useTour();
      return (
        <button onClick={() => startTour({ id: 'modal-tour', steps: [modalStep] })}>
          Start
        </button>
      );
    }

    render(
      <GuidePilotProvider>
        <Inner />
      </GuidePilotProvider>
    );

    act(() => {
      screen.getByRole('button', { name: 'Start' }).click();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByText('Tour started.')).toBeInTheDocument();
  });

  it('removes step UI after tour is stopped', () => {
    let stopFn: (() => void) | null = null;

    function Inner() {
      const { startTour, stopTour } = useTour();
      stopFn = stopTour;
      return (
        <button onClick={() => startTour({ id: 'stop-tour', steps: [modalStep] })}>
          Start
        </button>
      );
    }

    render(
      <GuidePilotProvider>
        <Inner />
      </GuidePilotProvider>
    );

    act(() => screen.getByRole('button', { name: 'Start' }).click());
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    act(() => stopFn!());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
