import { createHostBridge, HostBridge } from './host';
import { createGuestBridge, GuestBridge } from './guest';

export type { BridgeMessage } from './protocol';

interface BridgeOptions {
  mode: 'host';
  target?: never;
}

interface GuestBridgeOptions {
  mode: 'guest';
  target: Window;
}

export function createGuidePilotBridge(options: BridgeOptions): HostBridge;
export function createGuidePilotBridge(options: GuestBridgeOptions): GuestBridge;
export function createGuidePilotBridge(
  options: BridgeOptions | GuestBridgeOptions
): HostBridge | GuestBridge {
  if (options.mode === 'host') {
    return createHostBridge();
  }
  return createGuestBridge(options.target);
}
