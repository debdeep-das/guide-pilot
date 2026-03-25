import React, { useEffect, useState } from 'react';
import { ElementRect, getElementRect } from '../../utils/elementRect';

interface SpotlightOverlayProps {
  targetEl: Element | null;
  padding: number;
  borderRadius?: number;
  overlayColor?: string;
  overlayClassName?: string;
  allowInteraction?: boolean;
}

export function SpotlightOverlay({
  targetEl,
  padding,
  borderRadius = 4,
  overlayColor = 'rgba(0,0,0,0.5)',
  overlayClassName,
  allowInteraction = false,
}: SpotlightOverlayProps) {
  const [rect, setRect] = useState<ElementRect | null>(null);

  useEffect(() => {
    if (!targetEl) return;

    function update() {
      if (targetEl) setRect(getElementRect(targetEl));
    }

    update();

    const ro = new ResizeObserver(update);
    ro.observe(targetEl);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [targetEl]);

  const height = typeof window !== 'undefined' ? window.innerHeight : 0;

  if (!rect) return null;

  const holeX = rect.left - padding;
  const holeY = rect.top - padding;
  const holeW = rect.width + padding * 2;
  const holeH = rect.height + padding * 2;

  return (
    <>
      <svg
        className={['guide-pilot-overlay', overlayClassName].filter(Boolean).join(' ')}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height,
          pointerEvents: 'all',
          zIndex: 9000,
        }}
        aria-hidden="true"
      >
        <defs>
          <mask id="guide-pilot-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={holeX}
              y={holeY}
              width={holeW}
              height={holeH}
              rx={borderRadius}
              fill="black"
              style={{ transition: 'all 0.2s ease' }}
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={overlayColor}
          mask="url(#guide-pilot-mask)"
        />
      </svg>
      {!allowInteraction && (
        <div
          style={{
            position: 'fixed',
            top: holeY,
            left: holeX,
            width: holeW,
            height: holeH,
            zIndex: 9001,
            pointerEvents: 'all',
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
