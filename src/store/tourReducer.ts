import { TourState, TourAction, TourStatus } from '../types';

export const initialState: TourState = {
  status: TourStatus.Idle,
  activeTourId: null,
  currentStepIndex: 0,
  steps: [],
};

export function tourReducer(state: TourState, action: TourAction): TourState {
  switch (action.type) {
    case 'START_TOUR':
      return {
        status: TourStatus.Running,
        activeTourId: action.tourId,
        currentStepIndex: action.startFrom,
        steps: action.steps,
      };

    case 'SET_STEPS':
      return { ...state, steps: action.steps };

    case 'NEXT_STEP': {
      if (state.status !== TourStatus.Running) return state;
      const next = state.currentStepIndex + 1;
      if (next >= state.steps.length) {
        return { ...state, status: TourStatus.Complete };
      }
      return { ...state, currentStepIndex: next };
    }

    case 'PREV_STEP': {
      if (state.status !== TourStatus.Running) return state;
      const prev = state.currentStepIndex - 1;
      if (prev < 0) return state;
      return { ...state, currentStepIndex: prev };
    }

    case 'GO_TO_STEP': {
      if (state.status !== TourStatus.Running) return state;
      const clamped = Math.max(0, Math.min(action.index, state.steps.length - 1));
      return { ...state, currentStepIndex: clamped };
    }

    case 'SKIP_TOUR':
      return { ...state, status: TourStatus.Skipped };

    case 'STOP_TOUR':
      return { ...initialState };

    case 'COMPLETE_TOUR':
      return { ...state, status: TourStatus.Complete };

    default:
      return state;
  }
}
