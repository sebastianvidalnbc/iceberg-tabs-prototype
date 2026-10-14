import * as React from "react";
import { MSym } from "@/v4-eos/ui/msym";
import { cn } from "@/v4-eos/ui/lib/utils";
import { WIDGET_FAMILY_HUE, type WidgetType } from "@/v4-eos/browse";
import type { StructureLabelWeight } from "@/v4-eos/ui/structure-tree-visual";

const INDENT_PX = 12;
const ROW_CLASS =
  "structure-tree-row group/row relative flex cursor-pointer items-center gap-0.5 rounded-[var(--radius-field)] pr-2 font-[family-name:var(--font-sans)] text-[length:var(--structure-tree-size)] leading-[length:var(--structure-tree-lh)] transition-colors";

export interface StructureTreeRowProps {
  depth: number;
  hasChildren: boolean;
  isOpen: boolean;
  selected: boolean;
  label: React.ReactNode;
  labelWeight?: StructureLabelWeight;
  icon?: string;
  trailing?: React.ReactNode;
  grip?: React.ReactNode;
  dropHandlers?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  isOver?: boolean;
  disabled?: boolean;
  fluid?: boolean;
  boxed?: boolean;
  noTrailingFade?: boolean;
  famType?: WidgetType;
  onSelect: () => void;
  onToggle: () => void;
}

export function StructureTreeRow({
  depth,
  hasChildren,
  isOpen,
  selected,
  label,
  labelWeight = "regular",
  icon,
  trailing,
  grip,
  dropHandlers,
  isDragging,
  isOver,
  disabled,
  fluid,
  boxed,
  noTrailingFade,
  famType,
  onSelect,
  onToggle,
}: StructureTreeRowProps) {
  const rowRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (selected) {
      rowRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [selected]);

  return (
    <div
      ref={rowRef}
      role="treeitem"
      aria-selected={selected}
      aria-expanded={hasChildren ? isOpen : undefined}
      data-drag-row
      onClick={onSelect}
      {...dropHandlers}
      style={{ paddingLeft: `calc(var(--structure-tree-pad-x) + ${depth} * ${INDENT_PX}px)` }}
      className={cn(
        ROW_CLASS,
        "min-h-[var(--structure-tree-row-h)]",
        fluid && "w-max min-w-full",
        !selected && !boxed && "hover:bg-[var(--color-bg-hover)] [--row-bg:var(--color-bg-panel)] hover:[--row-bg:var(--color-bg-hover)]",
        selected &&
          !boxed &&
          "bg-[var(--color-bg-selected)] [--row-bg:var(--color-bg-selected)] text-foreground shadow-[inset_2px_0_0_0_var(--color-action-primary)]",
        selected && boxed && "text-foreground",
        isDragging && "opacity-40",
        isOver &&
          "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-[var(--color-action-primary)] before:content-['']",
        disabled && "opacity-55",
      )}
    >
      <span className="flex w-4 shrink-0 items-center justify-center">{grip}</span>
      {hasChildren ? (
        <button
          type="button"
          aria-label={isOpen ? "Collapse" : "Expand"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="flex size-5 shrink-0 items-center justify-center rounded-[var(--radius-field)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-focus-ring)]"
        >
          <MSym
            name="chevron_right"
            size={16}
            className={cn("transition-transform duration-150", isOpen && "rotate-90")}
          />
        </button>
      ) : (
        <span aria-hidden className="size-5 shrink-0" />
      )}
      {famType ? (
        <span aria-hidden className="flex size-5 shrink-0 items-center justify-center">
          <span
            className="size-1.5 rounded-full"
            style={{ background: WIDGET_FAMILY_HUE[famType].fam }}
          />
        </span>
      ) : icon ? (
        <span
          aria-hidden
          className="flex size-5 shrink-0 items-center justify-center text-[var(--color-text-secondary)]"
        >
          <MSym name={icon} size={16} />
        </span>
      ) : (
        <span aria-hidden className="size-5 shrink-0" />
      )}
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          labelWeight === "medium" ? "font-medium text-foreground" : "font-normal text-foreground/90",
          disabled && "line-through",
        )}
      >
        {label}
      </span>
      {trailing != null && (
        <span
          className={cn(
            "sticky right-0 z-10 ml-auto flex shrink-0 items-center gap-0.5 pl-2 pr-3 transition-opacity",
            !noTrailingFade && "[background:var(--row-bg)]",
            !noTrailingFade &&
              "before:pointer-events-none before:absolute before:right-full before:top-0 before:h-full before:w-6 before:content-['']",
            !noTrailingFade &&
              "before:bg-[linear-gradient(to_right,transparent,var(--row-bg))]",
            "opacity-0 group-hover/row:opacity-100 focus-within:opacity-100",
            "group-has-[[data-state=open]]:opacity-100",
            selected && "opacity-100",
          )}
        >
          {trailing}
        </span>
      )}
    </div>
  );
}
