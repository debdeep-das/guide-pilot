import { BridgeMessage, isBridgeMessage } from './protocol';
import { tourStore } from '../store/tourStore';

export interface GuestBridge {
  connect(): void;
  destroy(): void;
}

export function createGuestBridge(target: Window): GuestBridge {
  function handleMessage(event: MessageEvent) {
    if (!isBridgeMessage(event.data)) return;
    const msg = event.data as BridgeMessage;

    switch (msg.type) {
      case 'GUIDE_PILOT_STEP_ENTER':
        // Host told us to render a step
        break;
      case 'GUIDE_PILOT_NEXT':
        tourStore.dispatch({ type: 'NEXT_STEP' });
        break;
      case 'GUIDE_PILOT_PREV':
        tourStore.dispatch({ type: 'PREV_STEP' });
        break;
      case 'GUIDE_PILOT_SKIP':
        tourStore.dispatch({ type: 'SKIP_TOUR' });
        break;
    }
  }

  function sendAck(stepId: string) {
    const ack: BridgeMessage = { type: 'GUIDE_PILOT_ACK', stepId };
    target.postMessage(ack, '*');
  }

  // sendAck is part of the internal API, suppress unused warning
  void sendAck;

  return {
    connect() {
      window.addEventListener('message', handleMessage);
    },
    destroy() {
      window.removeEventListener('message', handleMessage);
    },
  };
}
