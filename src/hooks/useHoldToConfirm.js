import { useCallback, useEffect, useRef, useState } from "react";

/*
 * "Press and hold" confirmation (replaces confirm() dialogs).
 * progress goes 0 → 1 while the button is held; onConfirm fires at 1.
 */
export default function useHoldToConfirm(onConfirm, ms = 1100) {
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const startedAt = useRef(0);
  const done = useRef(false);

  const cancel = useCallback(() => {
    cancelAnimationFrame(frame.current);
    done.current = false;
    setProgress(0);
  }, []);

  const start = useCallback(() => {
    startedAt.current = performance.now();
    done.current = false;
    const loop = (now) => {
      const p = Math.min(1, (now - startedAt.current) / ms);
      setProgress(p);
      if (p >= 1) {
        if (!done.current) {
          done.current = true;
          onConfirm();
        }
        return;
      }
      frame.current = requestAnimationFrame(loop);
    };
    frame.current = requestAnimationFrame(loop);
  }, [ms, onConfirm]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return {
    progress,
    bind: {
      onPointerDown: start,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onKeyDown: (e) => (e.key === " " || e.key === "Enter") && !e.repeat && start(),
      onKeyUp: cancel,
    },
  };
}
