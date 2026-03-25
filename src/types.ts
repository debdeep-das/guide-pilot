// src/types.ts

export type StepPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'
  | 'auto';

export enum StepType {
  Tooltip = 'tooltip',
  Spotlight = 'spotlight',
  Modal = 'modal',
  InlineHint = 'inline',
}

export enum TourStatus {
  Idle = 'idle',
  Running = 'running',
  Paused = 'paused',
  Complete = 'complete',
  Skipped = 'skipped',
  Error = 'error',
}

export type GuidePilotErrorType =
  | 'ELEMENT_NOT_FOUND'
  | 'INVALID_CONFIG'
  | 'TIMEOUT'
  | 'RENDER_FAILURE';

export interface GuidePilotError {
  type: GuidePilotErrorType;
  message: string;
  stepId?: string;
  tourId?: string;
}

export interface TourStep {
  id: string;
  order: number;
  target: string;

  title?: string;
  content?: string;
  contentType?: 'text' | 'html';

  type?: StepType;

  placement?: StepPlacement;
  offset?: number;

  spotlightPadding?: number;
  allowInteraction?: boolean;

  targetTimeout?: number;
  nextButtonLabel?: string;

  beforeEnter?: () => Promise<void> | void;
  afterLeave?: () => void;
}

export interface TourConfig {
  id: string;
  steps?: TourStep[];

  defaultPlacement?: StepPlacement;
  zIndex?: number;

  missingTargetStrategy?: 'skip' | 'retry' | 'fail';

  allowSkip?: boolean;
  allowKeyboardNavigation?: boolean;
  tooltipClassName?: string;
  overlayClassName?: string;

  onStart?: () => void;
  onStepChange?: (step: TourStep, index: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  onError?: (error: GuidePilotError) => void;
}

export interface TourState {
  status: TourStatus;
  activeTourId: string | null;
  currentStepIndex: number;
  steps: TourStep[];
}

export type TourAction =
  | { type: 'START_TOUR'; tourId: string; steps: TourStep[]; startFrom: number }
  | { type: 'SET_STEPS'; steps: TourStep[] }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; index: number }
  | { type: 'SKIP_TOUR' }
  | { type: 'STOP_TOUR' }
  | { type: 'COMPLETE_TOUR' };

export interface TourStore {
  getState(): TourState;
  dispatch(action: TourAction): void;
  subscribe(listener: () => void): () => void;
  getRegistry(): Map<string, TourConfig>;
  registerTour(config: TourConfig): void;
}

export interface GuidePilotProviderProps {
  children: React.ReactNode;
  tours?: TourConfig[];
  scanOnMount?: boolean;
  scanRoot?: string;
  watchDom?: boolean;
  portalTarget?: Element | null;
  tooltipClassName?: string;
  overlayClassName?: string;
}

export interface UseTourReturn {
  isActive: boolean;
  activeTourId: string | null;
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  status: TourStatus;
  startTour: (input: string | TourStep[] | TourConfig) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: () => void;
  registerTour: (config: TourConfig) => void;
}
