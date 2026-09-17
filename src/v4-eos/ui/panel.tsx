import * as React from "react";
import { MSym } from "@/v4-eos/ui/msym";
import { cn } from "@/v4-eos/ui/lib/utils";
import { Input } from "@/v4-eos/ui/input";

// Panel surfaces + headers shared by Explorer/Properties (§22). Eos ships a
// dense, light-mode authoring UI (design.md "Principle"), so --color-bg-panel
// resolves to white; tonal hierarchy still comes from surface/spacing over
// heavy borders, with a small-caps eyebrow on headers. A dark theme remains
// available via [data-theme="dark"] (tokens.css) for surfaces that opt in
// (e.g. V2), but is not the Eos default. All values resolve through tokens.

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
  leading,
  actions,
  className,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  sub?: React.ReactNode;
  // Optional control rendered flush-left of the eyebrow/title (e.g. a
  // disclosure chevron) so the header owns its own left-aligned toggle.
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {leading}
        <div className="flex min-w-0 flex-col gap-0.5">
          {eyebrow && (
            <span className="text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {eyebrow}
            </span>
          )}
          {title && (
            <span className="truncate text-[length:var(--type-title-sm-size)] leading-[length:var(--type-title-sm-lh)] font-semibold text-foreground">
              {title}
            </span>
          )}
          {sub && (
            <span className="truncate text-[length:var(--type-body-sm-size)] text-muted-foreground">
              {sub}
            </span>
          )}
        </div>
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
      <MSym
        name="search"
        size={16}
        className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 rounded-sm bg-[var(--color-bg-control)] pl-7 pr-7 text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)]"
      />
      {value && onClear && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="absolute right-1.5 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <MSym name="close" size={16} />
        </button>
      )}
    </div>
  );
}
