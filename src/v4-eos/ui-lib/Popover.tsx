import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface PopoverProps {
  trigger: string;
  children: ReactNode;
}

// Non-modal overlay; dismiss on click-outside, blur, or Esc.
export function Popover({ trigger, children }: PopoverProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const open = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ x: r.left, y: r.bottom + 4 });
  };

  useEffect(() => {
    if (!pos) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setPos(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPos(null);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [pos]);

  return (
    <div ref={wrapRef} style={{ display: "inline-flex" }}>
      <button
        ref={btnRef}
        type="button"
        className="ui-btn ui-btn--secondary ui-btn--sm"
        aria-expanded={pos != null}
        aria-haspopup="dialog"
        onClick={() => (pos ? setPos(null) : open())}
      >
        {trigger}
      </button>
      {pos && (
        <div className="ui-popover" role="dialog" style={{ left: pos.x, top: pos.y }}>
          {children}
        </div>
      )}
    </div>
  );
}
