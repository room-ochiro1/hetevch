import { useState, type KeyboardEvent } from 'react';

/**
 * Which data point a chart is showing details for. Pointer hover and the keyboard reach the
 * same state: the plot is one tab stop, ←/→ step through points, Home/End jump to the ends.
 */
export function useChartCursor(length: number) {
  const [active, setActive] = useState<number | null>(null);

  function onKeyDown(event: KeyboardEvent) {
    if (length === 0) return;
    const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
    if (step !== 0) {
      event.preventDefault();
      setActive((current) => Math.min(length - 1, Math.max(0, (current ?? length - 1) + step)));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActive(event.key === 'Home' ? 0 : length - 1);
    }
  }

  return {
    active: active !== null && active < length ? active : null,
    setActive,
    plotProps: {
      tabIndex: 0,
      onKeyDown,
      onFocus: () => setActive((current) => current ?? length - 1),
      onBlur: () => setActive(null),
      onMouseLeave: () => setActive(null),
    },
  };
}
