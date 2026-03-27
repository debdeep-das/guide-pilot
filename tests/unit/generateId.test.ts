import { describe, it, expect } from 'vitest';
import { generateId } from '../../src/utils/generateId';

describe('generateId', () => {
  it('generates a prefixed id from tourId and order', () => {
    expect(generateId('onboarding', 1)).toBe('gp-onboarding-1');
  });

  it('works with string order', () => {
    expect(generateId('tour', '3')).toBe('gp-tour-3');
  });

  it('produces unique ids for different tours', () => {
    expect(generateId('tour-a', 1)).not.toBe(generateId('tour-b', 1));
  });

  it('produces unique ids for different orders', () => {
    expect(generateId('tour', 1)).not.toBe(generateId('tour', 2));
  });
});
