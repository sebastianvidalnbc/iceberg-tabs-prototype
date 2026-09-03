import * as React from "react";
import { MSym } from "@/v4-eos/ui/msym";
import { cn } from "@/v4-eos/ui/lib/utils";

// Iceberg-specific TreeRow (§16/§17) — shadcn supplies primitives, but the
// content-authoring tree interaction is ours. Composed from tokens/Tailwind, not
// a generic shadcn component. Compact 28px rows, token-driven indentation, and
// selection communicated by BOTH a tinted fill AND a left accent bar (never
// color alone, §15).
const INDENT_PX = 16;

export interface TreeRowProps {
  depth: number;
  hasChildren: boolean;
  isOpen: boolean;
  selected: boolean;
  label: React.ReactNode;
  /** Dimmed/mono treatment for route ("path") rows. */
  muted?: boolean;
  /** Trailing slot: status badge, count, overflow menu. */
  trailing?: React.ReactNode;
  /** Drag handle slot (rendered before the disclosure control). */
  grip?: React.ReactNode;
  /** Drop-target handlers (onDragOver/onDrop) spread on the row element. */
  dropHandlers?: React.HTMLAttributes<HTMLDivElement>;
  /** Drag visual states. */
  isDragging?: boolean;
  isOver?: boolean;
  /** Disabled (dimmed + struck-through) layer. */
  disabled?: boolean;
  onSelect: () => void;
  onToggle: () => void;
}

export function TreeRow({
  depth,
  hasChildren,
  isOpen,
  selected,
  label,
  muted,
  trailing,
  grip,
  dropHandlers,
  isDragging,
  isOver,
  disabled,
  onSelect,
  onToggle,
}: TreeRowProps) {
  return (
    <div
      role="treeitem"
      aria-selected={selected}
      aria-expanded={hasChildren ? isOpen : undefined}
      data-drag-row
      onClick={onSelect}
      {...dropHandlers}
      className={cn(
        "group relative flex h-7 cursor-pointer items-center gap-1 rounded-sm pr-1 text-[13px] leading-none",
        "text-foreground/90 transition-colors",
        "hover:bg-accent",
        selected && "bg-[var(--color-bg-selected)] text-foreground",
        isDragging && "opacity-40",
        isOver && "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary before:content-['']",
        disabled && "opacity-55",
      )}
      style={{ paddingLeft: 8 + depth * INDENT_PX }}
    >
      {/* Left accent bar — a non-color redundant cue for selection. */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full",
          selected ? "bg-primary" : "bg-transparent",
        )}
      />
      {grip != null && grip}
      {hasChildren ? (
        <button
          type="button"
          aria-label={isOpen ? "Collapse" : "Expand"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <MSym
            name="chevron_right"
            size={18}
            className={cn("transition-transform", isOpen && "rotate-90")}
          />
        </button>
      ) : (
        <span aria-hidden className="size-4 shrink-0" />
      )}
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          muted && "font-mono text-[12px] text-muted-foreground",
          disabled && "line-through",
        )}
      >
        {label}
      </span>
      {trailing != null && (
        <span className="ml-auto flex shrink-0 items-center gap-1 pl-1">
          {trailing}
        </span>
      )}
    </div>
  );
}
