import * as React from "react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/v2/ui/collapsible";
import { cn } from "@/v2/ui/lib/utils";

// V2-local Properties compositions (§19–§21). Dense two-column rows, a section
// treatment with an uppercase eyebrow, and an object header. Built from tokens
// and the shadcn Collapsible.

// Object header: eyebrow + name, with an optional trailing slot (status badge).
export function ObjectHeader({
  eyebrow,
  name,
  children,
}: {
  eyebrow: string;
  name: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="basis-full text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {eyebrow}
      </span>
      <span className="text-[15px] font-semibold text-foreground">{name}</span>
      {children}
    </div>
  );
}

// One label/control row. Full-width controls (textarea/radio/asset) stack.
export function PropertyRow({
  label,
  htmlFor,
  required,
  stacked,
  help,
  children,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  stacked?: boolean;
  help?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid items-start gap-x-3 gap-y-1",
        stacked
          ? "grid-cols-1"
          : "grid-cols-[150px_minmax(0,1fr)] max-[900px]:grid-cols-1",
      )}
    >
      <label
        htmlFor={htmlFor}
        className={cn(
          "min-w-0 break-words pt-1.5 text-[12px] font-medium leading-snug text-muted-foreground",
          stacked && "pt-0",
        )}
      >
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <div className="min-w-0">
        {children}
        {help && (
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            {help}
          </p>
        )}
      </div>
    </div>
  );
}

// Rows container.
export function PropertyRows({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

// A titled, collapsible section (§21). Headless sections render flush.
export function PropertySection({
  header,
  expanded,
  onToggle,
  children,
}: {
  header?: string;
  expanded?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}) {
  if (!header) {
    return <section>{children}</section>;
  }
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="group flex w-full items-center gap-1.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <ChevronRight className="size-3 transition-transform group-data-[state=open]:rotate-90" />
        {header}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pb-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}
