import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface TooltipProps {
  content: string;
  children: ReactNode;
}

// Shows on hover AND focus; Esc hides; described by the tooltip via
// aria-describedby. Positioned near the trigger.
export function Tooltip({ content, children }: TooltipProps) {
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const show = () => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) setPos({ x: r.left, y: r.bottom + 6 });
  };
  const hide = () => setPos(null);

  return (
    <span
      ref={wrapRef}
      className="ui-tooltip-wrap"
      aria-describedby={pos ? id : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => e.key === "Escape" && hide()}
    >
      {children}
      {pos && (
        <span id={id} role="tooltip" className="ui-tooltip" style={{ left: pos.x, top: pos.y }}>
          {content}
        </span>
      )}
    </span>
  );
}
