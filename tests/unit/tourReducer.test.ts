import { describe, it, expect } from 'vitest';
import { tourReducer, initialState } from '../../src/store/tourReducer';
import { TourStatus, TourStep } from '../../src/types';

const steps: TourStep[] = [
  { id: 's1', order: 1, target: '#a', content: 'Step 1' },
  { id: 's2', order: 2, target: '#b', content: 'Step 2' },
  { id: 's3', order: 3, target: '#c', content: 'Step 3' },
];

const runningState = tourReducer(initialState, {
  type: 'START_TOUR',
  tourId: 'test',
  steps,
  startFrom: 0,
});

describe('tourReducer', () => {
  it('starts with idle state', () => {
    expect(initialState.status).toBe(TourStatus.Idle);
    expect(initialState.activeTourId).toBeNull();
    expect(initialState.steps).toHaveLength(0);
  });

  it('START_TOUR sets running state', () => {
    expect(runningState.status).toBe(TourStatus.Running);
    expect(runningState.activeTourId).toBe('test');
    expect(runningState.currentStepIndex).toBe(0);
    expect(runningState.steps).toHaveLength(3);
  });

  it('START_TOUR respects startFrom', () => {
    const s = tourReducer(initialState, { type: 'START_TOUR', tourId: 'test', steps, startFrom: 2 });
    expect(s.currentStepIndex).toBe(2);
  });

  it('SET_STEPS replaces steps', () => {
    const newSteps: TourStep[] = [{ id: 'x', order: 1, target: '#x', content: 'X' }];
    const s = tourReducer(runningState, { type: 'SET_STEPS', steps: newSteps });
    expect(s.steps).toHaveLength(1);
  });

  it('NEXT_STEP advances index', () => {
    const s = tourReducer(runningState, { type: 'NEXT_STEP' });
    expect(s.currentStepIndex).toBe(1);
  });

  it('NEXT_STEP at last step completes tour', () => {
    const atLast = { ...runningState, currentStepIndex: 2 };
    const s = tourReducer(atLast, { type: 'NEXT_STEP' });
    expect(s.status).toBe(TourStatus.Complete);
  });

  it('PREV_STEP decrements index', () => {
    const atSecond = { ...runningState, currentStepIndex: 1 };
    const s = tourReducer(atSecond, { type: 'PREV_STEP' });
    expect(s.currentStepIndex).toBe(0);
  });

  it('PREV_STEP at first step is no-op', () => {
    const s = tourReducer(runningState, { type: 'PREV_STEP' });
    expect(s.currentStepIndex).toBe(0);
  });

  it('NEXT_STEP when not running is no-op', () => {
    const s = tourReducer(initialState, { type: 'NEXT_STEP' });
    expect(s).toBe(initialState);
  });

  it('PREV_STEP when not running is no-op', () => {
    const s = tourReducer(initialState, { type: 'PREV_STEP' });
    expect(s).toBe(initialState);
  });

  it('GO_TO_STEP jumps to index', () => {
    const s = tourReducer(runningState, { type: 'GO_TO_STEP', index: 2 });
    expect(s.currentStepIndex).toBe(2);
  });

  it('GO_TO_STEP clamps to valid range', () => {
    const low = tourReducer(runningState, { type: 'GO_TO_STEP', index: -5 });
    expect(low.currentStepIndex).toBe(0);

    const high = tourReducer(runningState, { type: 'GO_TO_STEP', index: 99 });
    expect(high.currentStepIndex).toBe(2);
  });

  it('GO_TO_STEP when not running is no-op', () => {
    const s = tourReducer(initialState, { type: 'GO_TO_STEP', index: 1 });
    expect(s).toBe(initialState);
  });

  it('SKIP_TOUR sets skipped status', () => {
    const s = tourReducer(runningState, { type: 'SKIP_TOUR' });
    expect(s.status).toBe(TourStatus.Skipped);
  });

  it('STOP_TOUR resets to initial state', () => {
    const s = tourReducer(runningState, { type: 'STOP_TOUR' });
    expect(s.status).toBe(TourStatus.Idle);
    expect(s.activeTourId).toBeNull();
    expect(s.steps).toHaveLength(0);
  });

  it('COMPLETE_TOUR sets complete status', () => {
    const s = tourReducer(runningState, { type: 'COMPLETE_TOUR' });
    expect(s.status).toBe(TourStatus.Complete);
  });
});
