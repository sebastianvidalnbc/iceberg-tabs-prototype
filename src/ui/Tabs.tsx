import { useRef } from "react";
import type { ReactNode } from "react";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";

export interface TabDef {
  id: string;
  label: string;
  icon?: IconName;
}

export interface TabsProps {
  tabs: TabDef[];
  value: string;
  onChange: (id: string) => void;
  children?: ReactNode;
}

// Switches mutually-exclusive peer views. Roving tabIndex + Arrow/Home/End.
export function Tabs({ tabs, value, onChange, children }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (i: number) => {
    const next = (i + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "ArrowRight") focusTab(i + 1);
    else if (e.key === "ArrowLeft") focusTab(i - 1);
    else if (e.key === "Home") focusTab(0);
    else if (e.key === "End") focusTab(tabs.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="ui-tabs">
      <div className="ui-tablist" role="tablist">
        {tabs.map((t, i) => {
          const selected = t.id === value;
          return (
            <button
              key={t.id}
              ref={(el) => (refs.current[i] = el)}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`tabpanel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              className="ui-tab"
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {t.icon && <Icon name={t.icon} />}
              {t.label}
            </button>
          );
        })}
      </div>
      {children && (
        <div
          className="ui-tabpanel"
          role="tabpanel"
          id={`tabpanel-${value}`}
          aria-labelledby={`tab-${value}`}
          tabIndex={0}
        >
          {children}
        </div>
      )}
    </div>
  );
}
