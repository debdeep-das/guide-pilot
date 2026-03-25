type GlobalWithProcess = typeof globalThis & {
  process?: { env?: { NODE_ENV?: string } };
};

const isDev =
  typeof (globalThis as GlobalWithProcess).process === 'undefined' ||
  (globalThis as GlobalWithProcess).process?.env?.NODE_ENV !== 'production';

export function warnDev(message: string): void {
  if (isDev) {
    console.warn(`[GuidePilot] ${message}`);
  }
}

export function errorDev(message: string): void {
  if (isDev) {
    console.error(`[GuidePilot] ${message}`);
  }
}
