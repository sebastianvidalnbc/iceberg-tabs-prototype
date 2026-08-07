import { useEffect, useRef } from "react";

export interface MenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

// A floating menu anchored at absolute page coordinates. Used for both the
// overflow (•••) menu and the right-click context menu.
export function Menu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Keep the menu inside the viewport.
  const left = Math.min(x, window.innerWidth - 180);
  const top = Math.min(y, window.innerHeight - items.length * 30 - 8);

  return (
    <div ref={ref} className="menu" style={{ left, top }} role="menu">
      {items.map((item, i) => (
        <div key={i}>
          {item.separatorBefore && <div className="menu-sep" />}
          <button
            className={`menu-item${item.danger ? " danger" : ""}`}
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            {item.label}
          </button>
        </div>
      ))}
    </div>
  );
}
