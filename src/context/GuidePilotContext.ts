import { createContext } from 'react';
import { TourConfig } from '../types';

export interface GuidePilotContextValue {
  portalTarget: Element | null;
  tooltipClassName?: string;
  overlayClassName?: string;
  activeConfig: TourConfig | null;
}

export const GuidePilotContext = createContext<GuidePilotContextValue | null>(null);
