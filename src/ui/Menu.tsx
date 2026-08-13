import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

// Back-compatible with the prototype's MenuItem; adds optional icon.
export interface UiMenuItem {
  label: string;
  onClick: () => void;
  icon?: IconName;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

export interface MenuProps {
  x: number;
  y: number;
  items: UiMenuItem[];
  onClose: () => void;
}

// Floating menu anchored at page coordinates. Used by right-click context menus
// and overflow (•••) buttons. Arrow/Home/End move focus, Esc closes, first item
// is focused on open, click-outside closes, position is clamped to the viewport.
export function Menu({ x, y, items, onClose }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const enabledIndexes = items
    .map((it, i) => (it.disabled ? -1 : i))
    .filter((i) => i >= 0);

  useEffect(() => {
    const first = enabledIndexes[0] ?? 0;
    setActive(first);
    btnRefs.current[first]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [onClose]);

  const moveTo = (idx: number) => {
    if (enabledIndexes.length === 0) return;
    const pos = enabledIndexes.indexOf(idx);
    const next = enabledIndexes[(pos + enabledIndexes.length) % enabledIndexes.length];
    setActive(next);
    btnRefs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const pos = enabledIndexes.indexOf(active);
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") moveTo(enabledIndexes[(pos + 1) % enabledIndexes.length]);
    else if (e.key === "ArrowUp")
      moveTo(enabledIndexes[(pos - 1 + enabledIndexes.length) % enabledIndexes.length]);
    else if (e.key === "Home") moveTo(enabledIndexes[0]);
    else if (e.key === "End") moveTo(enabledIndexes[enabledIndexes.length - 1]);
    else return;
    e.preventDefault();
  };

  const left = Math.min(x, window.innerWidth - 180);
  const top = Math.min(y, window.innerHeight - items.length * 34 - 8);

  return (
    <div
      ref={ref}
      className="ui-menu"
      style={{ left, top }}
      role="menu"
      onKeyDown={onKeyDown}
    >
      {items.map((item, i) => (
        <div key={i}>
          {item.separatorBefore && <div className="ui-menu__sep" role="separator" />}
          <button
            ref={(el) => (btnRefs.current[i] = el)}
            className={`ui-menu__item${item.danger ? " ui-menu__item--danger" : ""}`}
            role="menuitem"
            tabIndex={i === active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            {item.icon && (
              <span className="ui-menu__item-icon">
                <Icon name={item.icon} />
              </span>
            )}
            {item.label}
          </button>
        </div>
      ))}
    </div>
  );
}

// Presentational exports for the docs page.
export function MenuItem({ item }: { item: UiMenuItem }) {
  return (
    <button
      className={`ui-menu__item${item.danger ? " ui-menu__item--danger" : ""}`}
      role="menuitem"
      disabled={item.disabled}
      onClick={item.onClick}
    >
      {item.icon && (
        <span className="ui-menu__item-icon">
          <Icon name={item.icon} />
        </span>
      )}
      {item.label}
    </button>
  );
}

export function MenuDivider() {
  return <div className="ui-menu__sep" role="separator" />;
}

export interface DropdownMenuProps {
  label: string;
  items: UiMenuItem[];
}

// Trigger button that opens the floating Menu anchored at its own rect.
export function DropdownMenu({ label, items }: DropdownMenuProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const open = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ x: r.left, y: r.bottom + 4 });
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="ui-btn ui-btn--secondary ui-btn--sm"
        aria-haspopup="menu"
        aria-expanded={pos != null}
        onClick={() => (pos ? setPos(null) : open())}
      >
        {label}
        <Icon name="chevron-down" className="ui-btn__icon" />
      </button>
      {pos && <Menu x={pos.x} y={pos.y} items={items} onClose={() => setPos(null)} />}
    </>
  );
}
