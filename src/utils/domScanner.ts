import { TourStep, StepType, StepPlacement } from '../types';
import { generateId } from './generateId';

export function scanForSteps(tourId: string, root: Element): TourStep[] {
  const elements = root.querySelectorAll('[data-guide-pilot-tour]');
  const steps: TourStep[] = [];

  elements.forEach((el) => {
    const ds = (el as HTMLElement).dataset;
    if (ds.guidePilotTour !== tourId) return;

    if (!ds.guidePilotId) {
      ds.guidePilotId = generateId(tourId, ds.guidePilotStep ?? '0');
    }

    steps.push({
      id: ds.guidePilotId,
      order: parseInt(ds.guidePilotStep ?? '0', 10),
      type: (ds.guidePilotType as StepType) ?? StepType.Tooltip,
      title: ds.guidePilotTitle,
      content: ds.guidePilotContent ?? '',
      target: `[data-guide-pilot-id="${ds.guidePilotId}"]`,
      placement: ds.guidePilotPlacement as StepPlacement,
      spotlightPadding: ds.guidePilotSpotlightPadding
        ? parseInt(ds.guidePilotSpotlightPadding, 10)
        : undefined,
    });
  });

  return steps.sort((a, b) => a.order - b.order);
}
