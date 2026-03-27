import { describe, it, expect, beforeEach } from 'vitest';
import { scanForSteps } from '../../src/utils/domScanner';
import { StepType } from '../../src/types';

function makeEl(attrs: Record<string, string>): HTMLElement {
  const el = document.createElement('div');
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

describe('scanForSteps', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    document.body.removeChild(root);
  });

  it('returns empty array when no annotated elements', () => {
    expect(scanForSteps('my-tour', root)).toHaveLength(0);
  });

  it('ignores elements belonging to a different tour', () => {
    root.appendChild(makeEl({
      'data-guide-pilot-tour': 'other-tour',
      'data-guide-pilot-step': '1',
      'data-guide-pilot-content': 'Hello',
    }));
    expect(scanForSteps('my-tour', root)).toHaveLength(0);
  });

  it('parses a single annotated element', () => {
    root.appendChild(makeEl({
      'data-guide-pilot-tour': 'my-tour',
      'data-guide-pilot-step': '1',
      'data-guide-pilot-title': 'My Title',
      'data-guide-pilot-content': 'My Content',
      'data-guide-pilot-placement': 'bottom',
    }));
    const steps = scanForSteps('my-tour', root);
    expect(steps).toHaveLength(1);
    expect(steps[0].order).toBe(1);
    expect(steps[0].title).toBe('My Title');
    expect(steps[0].content).toBe('My Content');
    expect(steps[0].placement).toBe('bottom');
    expect(steps[0].type).toBe(StepType.Tooltip);
  });

  it('parses step type from data attribute', () => {
    root.appendChild(makeEl({
      'data-guide-pilot-tour': 'my-tour',
      'data-guide-pilot-step': '1',
      'data-guide-pilot-type': 'spotlight',
      'data-guide-pilot-content': 'Spot',
    }));
    const steps = scanForSteps('my-tour', root);
    expect(steps[0].type).toBe(StepType.Spotlight);
  });

  it('parses spotlightPadding', () => {
    root.appendChild(makeEl({
      'data-guide-pilot-tour': 'my-tour',
      'data-guide-pilot-step': '1',
      'data-guide-pilot-content': 'X',
      'data-guide-pilot-spotlight-padding': '16',
    }));
    const steps = scanForSteps('my-tour', root);
    expect(steps[0].spotlightPadding).toBe(16);
  });

  it('sorts steps by order', () => {
    root.appendChild(makeEl({ 'data-guide-pilot-tour': 'my-tour', 'data-guide-pilot-step': '3', 'data-guide-pilot-content': 'C' }));
    root.appendChild(makeEl({ 'data-guide-pilot-tour': 'my-tour', 'data-guide-pilot-step': '1', 'data-guide-pilot-content': 'A' }));
    root.appendChild(makeEl({ 'data-guide-pilot-tour': 'my-tour', 'data-guide-pilot-step': '2', 'data-guide-pilot-content': 'B' }));
    const steps = scanForSteps('my-tour', root);
    expect(steps.map((s) => s.order)).toEqual([1, 2, 3]);
  });

  it('stamps element with data-guide-pilot-id', () => {
    const el = makeEl({ 'data-guide-pilot-tour': 'my-tour', 'data-guide-pilot-step': '1', 'data-guide-pilot-content': 'X' });
    root.appendChild(el);
    scanForSteps('my-tour', root);
    expect(el.dataset.guidePilotId).toBeDefined();
  });

  it('target selector references the stamped id', () => {
    const el = makeEl({ 'data-guide-pilot-tour': 'my-tour', 'data-guide-pilot-step': '1', 'data-guide-pilot-content': 'X' });
    root.appendChild(el);
    const steps = scanForSteps('my-tour', root);
    expect(steps[0].target).toBe(`[data-guide-pilot-id="${el.dataset.guidePilotId}"]`);
  });
});
