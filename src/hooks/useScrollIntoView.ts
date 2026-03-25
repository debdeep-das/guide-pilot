import { useEffect } from 'react';

export function useScrollIntoView(element: Element | null) {
  useEffect(() => {
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [element]);
}
