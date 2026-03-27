import { describe, it, expect } from 'vitest';
import { mergeSteps } from '../../src/utils/mergeSteps';
import { TourStep } from '../../src/types';

const s = (id: string, order: number, extra?: Partial<TourStep>): TourStep => ({
  id,
  order,
  target: `#${id}`,
  content: `Content ${id}`,
  ...extra,
});

describe('mergeSteps', () => {
  it('returns scan steps when no config steps', () => {
    const result = mergeSteps([s('a', 1), s('b', 2)], []);
    expect(result.map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('returns config steps when no scan steps', () => {
    const result = mergeSteps([], [s('x', 1), s('y', 2)]);
    expect(result.map((r) => r.id)).toEqual(['x', 'y']);
  });

  it('merges non-overlapping steps from both sources', () => {
    const result = mergeSteps([s('a', 1)], [s('b', 2)]);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('a');
    expect(result[1].id).toBe('b');
  });

  it('config step overrides scan step on id collision', () => {
    const scan = s('a', 1, { content: 'from scan' });
    const config = s('a', 1, { content: 'from config' });
    const result = mergeSteps([scan], [config]);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('from config');
  });

  it('config step merges with scan step properties', () => {
    const scan = s('a', 1, { title: 'Scan title' });
    const config = { id: 'a', order: 1, target: '#a', content: 'Config content' };
    const result = mergeSteps([scan], [config]);
    expect(result[0].title).toBe('Scan title');
    expect(result[0].content).toBe('Config content');
  });

  it('sorts merged steps by order', () => {
    const result = mergeSteps([s('b', 3), s('a', 1)], [s('c', 2)]);
    expect(result.map((r) => r.order)).toEqual([1, 2, 3]);
  });

  it('returns empty array for empty inputs', () => {
    expect(mergeSteps([], [])).toHaveLength(0);
  });
});
