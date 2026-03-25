// Components
export { GuidePilotProvider } from './context/GuidePilotProvider';

// Hooks
export { useTour } from './hooks/useTour';

// Types
export type {
  TourConfig,
  TourStep,
  TourState,
  GuidePilotError,
  GuidePilotErrorType,
  StepPlacement,
  UseTourReturn,
  GuidePilotProviderProps,
} from './types';

export { StepType, TourStatus } from './types';

// CSS — consumers import 'guide-pilot/styles'
import './styles/guide-pilot.css';
