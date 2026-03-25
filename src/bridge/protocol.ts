import { TourStep } from '../types';

export type BridgeMessage =
  | { type: 'GUIDE_PILOT_REGISTER'; tourId: string; steps: TourStep[] }
  | { type: 'GUIDE_PILOT_STEP_ENTER'; tourId: string; stepId: string }
  | { type: 'GUIDE_PILOT_NEXT' }
  | { type: 'GUIDE_PILOT_PREV' }
  | { type: 'GUIDE_PILOT_SKIP' }
  | { type: 'GUIDE_PILOT_ACK'; stepId: string };

export const BRIDGE_MESSAGE_TYPES = new Set([
  'GUIDE_PILOT_REGISTER',
  'GUIDE_PILOT_STEP_ENTER',
  'GUIDE_PILOT_NEXT',
  'GUIDE_PILOT_PREV',
  'GUIDE_PILOT_SKIP',
  'GUIDE_PILOT_ACK',
]);

export function isBridgeMessage(data: unknown): data is BridgeMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    BRIDGE_MESSAGE_TYPES.has((data as { type: string }).type)
  );
}
