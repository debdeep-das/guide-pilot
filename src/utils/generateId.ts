export function generateId(tourId: string, order: string | number): string {
  return `gp-${tourId}-${order}`;
}
