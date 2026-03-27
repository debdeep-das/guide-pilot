import { tourStore } from '../../src/store/tourStore';

/** Reset singleton store state and registry between tests */
export function resetStore() {
  tourStore.dispatch({ type: 'STOP_TOUR' });
  tourStore.getRegistry().clear();
}
