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
  /** Fluid width: row grows to its content (no label truncation) so the pane can
   *  scroll horizontally to reveal deep rows + the trailing overflow menu. */
  fluid?: boolean;
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
  fluid,
  onSelect,
  onToggle,
}: TreeRowProps) {
  // Bring a newly-selected row into view — so selecting from the preview (which
  // also expands the ancestor path) reveals the row without manual scrolling.
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
      className={cn(
        "group relative flex h-7 cursor-pointer items-center gap-1 rounded-sm pr-1 text-[13px] leading-none",
        "text-foreground/90 transition-colors",
        // --row-bg tracks the row's current background so the trailing menu's
        // fade mask can blend the label into whatever fill is showing.
        "hover:bg-accent [--row-bg:var(--color-bg-panel)] hover:[--row-bg:var(--color-bg-hover)]",
        // Fluid rows grow to content and always fill the pane width (so the
        // selection/hover fill spans the full — possibly scrolled — width).
        fluid && "w-max min-w-full",
        // Selection is a full-bleed band: square corners so it reads as a row
        // highlight spanning the pane, not a rounded chip.
        selected && "rounded-none bg-[var(--color-bg-selected)] [--row-bg:var(--color-bg-selected)] text-foreground",
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
          fluid ? "whitespace-nowrap" : "min-w-0 flex-1 truncate",
          muted && "font-mono text-[12px] text-muted-foreground",
          disabled && "line-through",
        )}
      >
        {label}
      </span>
      {trailing != null && (
        <span
          className={cn(
            // Pinned to the right edge of the scroll viewport (4px clear of the
            // 10px scrollbar) so the overflow menu is always in the same spot,
            // regardless of label length or horizontal scroll. It sits on the
            // row fill (--row-bg) and a gradient fade to its left dissolves the
            // label underneath so long names stay readable.
            // right-0 pins the container to the viewport edge; pr-3.5 (14px)
            // insets the icon to 4px clear of the 10px scrollbar while the solid
            // fill still covers the label all the way to the edge.
            "sticky right-0 z-10 ml-auto flex shrink-0 items-center gap-1 pl-1 pr-3.5 transition-opacity",
            "[background:var(--row-bg)]",
            "before:pointer-events-none before:absolute before:right-full before:top-0 before:h-full before:w-8 before:content-['']",
            "before:bg-[linear-gradient(to_right,transparent,var(--row-bg))]",
            // Show the overflow menu only on hover, when the row is selected, or
            // while its menu is open (so the dropdown doesn't vanish mid-use).
            "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
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
