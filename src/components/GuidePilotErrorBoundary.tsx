import React, { Component, ErrorInfo, ReactNode } from 'react';
import { tourStore } from '../store/tourStore';
import { errorDev } from '../utils/devWarnings';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class GuidePilotErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    errorDev(`Render failure: ${error.message}\n${info.componentStack ?? ''}`);
    const state = tourStore.getState();
    const config = state.activeTourId
      ? tourStore.getRegistry().get(state.activeTourId)
      : null;
    config?.onError?.({
      type: 'RENDER_FAILURE',
      message: error.message,
      tourId: state.activeTourId ?? undefined,
      stepId: state.steps[state.currentStepIndex]?.id,
    });
    tourStore.dispatch({ type: 'STOP_TOUR' });
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
