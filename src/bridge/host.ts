import { BridgeMessage, isBridgeMessage } from './protocol';
import { tourStore } from '../store/tourStore';

export interface HostBridge {
  listen(): void;
  destroy(): void;
}

export function createHostBridge(): HostBridge {
  function handleMessage(event: MessageEvent) {
    if (!isBridgeMessage(event.data)) return;
    const msg = event.data as BridgeMessage;

    switch (msg.type) {
      case 'GUIDE_PILOT_REGISTER':
        // Guest iframes register their steps
        tourStore.registerTour({ id: msg.tourId, steps: msg.steps });
        break;
      case 'GUIDE_PILOT_ACK':
        // Guest acknowledged step render — host can show nav
        break;
    }
  }

  return {
    listen() {
      window.addEventListener('message', handleMessage);
    },
    destroy() {
      window.removeEventListener('message', handleMessage);
    },
  };
}
