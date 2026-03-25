import { TourState, TourAction, TourConfig, TourStore } from '../types';
import { tourReducer, initialState } from './tourReducer';

function createTourStore(): TourStore {
  let state: TourState = { ...initialState };
  const subscribers = new Set<() => void>();
  const registry = new Map<string, TourConfig>();

  function getState(): TourState {
    return state;
  }

  function dispatch(action: TourAction): void {
    state = tourReducer(state, action);
    subscribers.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  }

  function getRegistry(): Map<string, TourConfig> {
    return registry;
  }

  function registerTour(config: TourConfig): void {
    registry.set(config.id, config);
  }

  return { getState, dispatch, subscribe, getRegistry, registerTour };
}

export const tourStore: TourStore = createTourStore();
