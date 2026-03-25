import { TourStep } from '../types';

export function mergeSteps(scanSteps: TourStep[], configSteps: TourStep[]): TourStep[] {
  const map = new Map<string, TourStep>();
  scanSteps.forEach((s) => map.set(s.id, s));
  configSteps.forEach((s) => map.set(s.id, { ...map.get(s.id), ...s }));
  return Array.from(map.values()).sort((a, b) => a.order - b.order);
}
