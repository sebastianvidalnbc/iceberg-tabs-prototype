import type { ReactNode } from "react";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";

export interface SidebarNavItemProps {
  icon?: IconName;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({ icon, label, active, onClick }: SidebarNavItemProps) {
  return (
    <button
      type="button"
      className={`ui-navitem${active ? " ui-navitem--active" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {icon && <Icon name={icon} />}
      {label}
    </button>
  );
}

export interface DisclosureNavItemProps {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function DisclosureNavItem({ label, expanded, onToggle, children }: DisclosureNavItemProps) {
  return (
    <div>
      <button
        type="button"
        className="ui-navitem"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <Icon name={expanded ? "chevron-down" : "chevron-right"} />
        {label}
      </button>
      {expanded && <div className="ui-disclosure-nav__children">{children}</div>}
    </div>
  );
}
