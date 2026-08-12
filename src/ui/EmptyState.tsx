import type { ReactNode } from "react";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="ui-empty">
      {icon && (
        <span className="ui-empty__icon">
          <Icon name={icon} size={28} />
        </span>
      )}
      <span className="ui-empty__title">{title}</span>
      {description && <span className="ui-empty__desc">{description}</span>}
      {action}
    </div>
  );
}
