import { useRef, useState } from "react";
import "./HoldButton.css";

/* Press-and-hold to confirm: replaces confirm() dialogs. */
export default function HoldButton({ onConfirm, children, hint, duration = 1200, className = "", disabled }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef(0);
  const start = useRef(0);

  const loop = (now) => {
    const p = Math.min(1, (now - start.current) / duration);
    setProgress(p);
    if (p >= 1) { setDone(true); onConfirm?.(); return; }
    raf.current = requestAnimationFrame(loop);
  };
  const down = () => {
    if (disabled || done) return;
    start.current = performance.now();
    raf.current = requestAnimationFrame(loop);
  };
  const up = () => {
    cancelAnimationFrame(raf.current);
    if (!done) setProgress(0);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={`hold-btn ${progress > 0 ? "holding" : ""} ${done ? "done" : ""} ${className}`}
      style={{ "--p": progress }}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && down()}
      onKeyUp={(e) => (e.key === " " || e.key === "Enter") && up()}
    >
      <span className="hold-fill" />
      <span className="hold-label">{children}</span>
      {hint && <span className="hold-hint">{hint}</span>}
    </button>
  );
}
