import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/v2/ui/lib/utils";
import { Input } from "@/v2/ui/input";

// Dark panel surfaces + headers shared by Explorer/Properties (§22). Tonal
// hierarchy over heavy borders: panel = primary dark surface; headers use a
// small-caps eyebrow. All values resolve through Iceberg tokens.

export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col bg-[var(--color-bg-panel)] text-foreground",
        className,
      )}
      {...props}
    />
  );
}

// Eyebrow = small semibold uppercase label (§34). Optional title/sub lines.
export function PanelHeader({
  eyebrow,
  title,
  sub,
  actions,
  className,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-start justify-between gap-2 border-b border-border px-3 py-2",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {eyebrow}
          </span>
        )}
        {title && (
          <span className="truncate text-[13px] font-semibold text-foreground">
            {title}
          </span>
        )}
        {sub && (
          <span className="truncate text-[12px] text-muted-foreground">
            {sub}
          </span>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
}

// Compact search field with a leading icon and a clear affordance. One visual
// treatment for Explorer search + Offers filter (§29).
export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 rounded-sm bg-[var(--color-bg-control)] pl-7 pr-7 text-[12px]"
      />
      {value && onClear && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="absolute right-1.5 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}
