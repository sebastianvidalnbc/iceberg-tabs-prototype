import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "../components/Icon";
import { IconButton } from "./Button";
import { StatusIndicator, ValidationIndicator } from "./Indicators";
import { indentStyle } from "./Collection";

type Status = "default" | "success" | "warning" | "danger";

export function DisclosureButton({
  expanded,
  onToggle,
  label = "Toggle",
}: {
  expanded: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className="ui-disclosure"
      aria-expanded={expanded}
      aria-label={label}
      onClick={onToggle}
    >
      <Icon name={expanded ? "chevron-down" : "chevron-right"} />
    </button>
  );
}

// Grip that preserves whatever drag handlers/classes the caller passes.
export function DragHandle(props: HTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      type="button"
      className={["ui-drag-handle", className ?? ""].filter(Boolean).join(" ")}
      aria-label="Drag to reorder"
      {...rest}
    >
      <Icon name="grip" />
    </button>
  );
}

export interface TreeRowProps {
  level?: number;
  label: ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  hasChildren?: boolean;
  status?: { status?: Status; label: string };
  validation?: string;
  selected?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  onOverflow?: (e: React.MouseEvent) => void;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
}

// Hierarchical, nestable, reorderable row. Composes DragHandle + Disclosure +
// label + status/validation + overflow. Indentation is token-driven via level.
export function TreeRow({
  level = 0,
  label,
  expanded = false,
  onToggle,
  hasChildren,
  status,
  validation,
  selected,
  onContextMenu,
  onOverflow,
  dragHandleProps,
}: TreeRowProps) {
  return (
    <div
      className="ui-tree-row"
      role="treeitem"
      aria-level={level + 1}
      aria-selected={selected || undefined}
      aria-expanded={hasChildren ? expanded : undefined}
      style={indentStyle(level)}
      onContextMenu={onContextMenu}
    >
      {dragHandleProps && <DragHandle {...dragHandleProps} />}
      {hasChildren && onToggle && (
        <DisclosureButton expanded={expanded} onToggle={onToggle} />
      )}
      <span className="ui-tree-row__main">{label}</span>
      {status && <StatusIndicator status={status.status} label={status.label} />}
      {validation && <ValidationIndicator label={validation} />}
      {onOverflow && (
        <IconButton
          icon="dots"
          size="sm"
          aria-label="More actions"
          className="ui-tree-row__overflow"
          onClick={onOverflow}
        />
      )}
    </div>
  );
}
