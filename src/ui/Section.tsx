import type { ReactNode } from "react";
import { Icon } from "./Icon";

export interface SectionProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

// Static titled container.
export function Section({ title, actions, children }: SectionProps) {
  return (
    <section className="ui-section">
      <div className="ui-section__head" role="presentation">
        <span>{title}</span>
        {actions && <span style={{ marginLeft: "auto" }}>{actions}</span>}
      </div>
      <div className="ui-section__body">{children}</div>
    </section>
  );
}

export interface CollapsibleSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  actions?: ReactNode;
  children: ReactNode;
}

// Expand/collapse content in place; reduced-motion-aware reveal handled in CSS.
export function CollapsibleSection({
  title,
  expanded,
  onToggle,
  actions,
  children,
}: CollapsibleSectionProps) {
  return (
    <section className="ui-section">
      <button
        type="button"
        className="ui-section__head"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <Icon name={expanded ? "chevron-down" : "chevron-right"} />
        <span>{title}</span>
        {actions && <span style={{ marginLeft: "auto" }}>{actions}</span>}
      </button>
      {expanded && <div className="ui-section__body">{children}</div>}
    </section>
  );
}
