import * as React from "react";
import { cn } from "@/v4-eos/ui/lib/utils";

// Shared layout scaffolding for the V4 (Eos) design-system catalog. Purely
// presentational, Tailwind-only, and themed via the same Eos-aligned Iceberg
// tokens the rest of V4 uses. Kept separate so each catalog section stays
// declarative.

// A titled catalog section with an id (for the in-page nav) and optional lead.
export function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-4 border-t border-border pt-8 first:border-t-0 first:pt-0">
      <h2 className="text-[length:var(--type-title-lg-size)] leading-[length:var(--type-title-lg-lh)] font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {lead && (
        <p className="mt-1 max-w-2xl text-[length:var(--type-body-md-size)] leading-relaxed text-muted-foreground">
          {lead}
        </p>
      )}
      <div className="mt-5 flex flex-col gap-6">{children}</div>
    </section>
  );
}

// A labelled specimen row: a small caption above a demo surface.
export function Specimen({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] font-medium text-foreground">{label}</span>
        {hint && <span className="text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] text-muted-foreground">{hint}</span>}
      </div>
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-md border border-border bg-[var(--color-bg-panel)] p-4",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

// A single color/token swatch chip. `brand` is the optional palette name (e.g.
// "Onyx", "Silver") documented alongside the semantic role + token.
export function Swatch({
  name,
  varName,
  brand,
}: {
  name: string;
  varName: string;
  brand?: string;
}) {
  return (
    <div className="flex w-[132px] flex-col gap-1.5">
      <div
        className="h-12 w-full rounded-md border border-border"
        style={{ background: `var(${varName})` }}
      />
      <div className="flex flex-col">
        <span className="text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] font-medium text-foreground">{name}</span>
        {brand && (
          <span className="text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] text-muted-foreground">{brand}</span>
        )}
        <code className="text-[length:var(--type-label-xs-size)] leading-[length:var(--type-label-xs-lh)] text-muted-foreground">{varName}</code>
      </div>
    </div>
  );
}
