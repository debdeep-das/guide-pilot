import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitForElement } from '../../src/utils/waitForElement';

describe('waitForElement', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('resolves immediately when element already exists', async () => {
    const el = document.createElement('div');
    el.id = 'target';
    document.body.appendChild(el);

    const result = await waitForElement('#target');
    expect(result).toBe(el);
  });

  it('resolves when element appears after a delay', async () => {
    let resolved: Element | null = null;
    const p = waitForElement('#late-target', { interval: 100, timeout: 1000 }).then((el) => {
      resolved = el;
    });

    expect(resolved).toBeNull();

    vi.advanceTimersByTime(200);
    const el = document.createElement('div');
    el.id = 'late-target';
    document.body.appendChild(el);

    vi.advanceTimersByTime(100);
    await p;

    expect(resolved).toBe(el);
  });

  it('rejects with ELEMENT_NOT_FOUND after timeout', async () => {
    const p = waitForElement('#missing', { timeout: 300, interval: 100 });
    vi.advanceTimersByTime(400);

    await expect(p).rejects.toMatchObject({ type: 'ELEMENT_NOT_FOUND' });
  });

  it('rejects immediately when called during SSR (no document)', async () => {
    const origDocument = global.document;
    // @ts-expect-error simulate SSR
    delete global.document;

    await expect(waitForElement('#anything')).rejects.toThrow('SSR');

    global.document = origDocument;
  });

  it('searches within a custom root', async () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    const el = document.createElement('span');
    el.id = 'inner';
    root.appendChild(el);

    const result = await waitForElement('#inner', { root });
    expect(result).toBe(el);
  });
});
