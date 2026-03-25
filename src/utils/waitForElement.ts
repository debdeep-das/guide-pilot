import { GuidePilotError } from '../types';

export function waitForElement(
  selector: string,
  options: { timeout?: number; interval?: number; root?: Element | Document } = {}
): Promise<Element> {
  if (typeof document === 'undefined') {
    return Promise.reject<Element>(new Error('[GuidePilot] waitForElement called during SSR'));
  }

  const { timeout = 3000, interval = 100, root = document } = options;

  return new Promise<Element>((resolve, reject) => {
    const el = root.querySelector(selector);
    if (el) {
      resolve(el);
      return;
    }

    let elapsed = 0;
    const timer = setInterval(() => {
      const found = root.querySelector(selector);
      if (found) {
        clearInterval(timer);
        resolve(found);
        return;
      }
      elapsed += interval;
      if (elapsed >= timeout) {
        clearInterval(timer);
        const error: GuidePilotError = {
          type: 'ELEMENT_NOT_FOUND',
          message: `[GuidePilot] Element not found: ${selector}`,
        };
        reject(error);
      }
    }, interval);
  });
}
