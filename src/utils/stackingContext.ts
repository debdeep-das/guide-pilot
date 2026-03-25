import { warnDev } from './devWarnings';

export function detectStackingContext(element: Element): void {
  let current: Element | null = element.parentElement;

  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);

    const hasTransform = style.transform !== 'none';
    const hasFilter = style.filter !== 'none';
    const hasWillChange = style.willChange !== 'auto';
    const hasIsolation = style.isolation === 'isolate';
    const hasLowOpacity = parseFloat(style.opacity) < 1;

    if (hasTransform || hasFilter || hasWillChange || hasIsolation || hasLowOpacity) {
      const offender = current.tagName.toLowerCase() +
        (current.id ? `#${current.id}` : '') +
        (current.className ? `.${String(current.className).split(' ').join('.')}` : '');

      warnDev(
        `Stacking context detected on <${offender}>. ` +
        `This may trap position:fixed tour elements. ` +
        `Consider using <GuidePilotProvider portalTarget={...}> to escape it.`
      );
      return;
    }

    current = current.parentElement;
  }
}
