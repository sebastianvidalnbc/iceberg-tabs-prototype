import * as React from "react";
import { MSym } from "@/v4-eos/ui/msym";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/v4-eos/ui/collapsible";
import { cn } from "@/v4-eos/ui/lib/utils";

// Properties compositions built on the Eos Workset list family
// (Figma YgLwZNnExyyvfUVcyyelzh · 02 Components / Content & navigation):
// List item 117:424, List accessory 116:201, List subheader 117:6210,
// List divider 117:6194, List 118:534. Rows sit in a 4px-inset column so the
// 12px row padding lands their text on the panel's 16px content edge.

// Object header: eyebrow + name, with an optional trailing slot (status badge).
export function ObjectHeader({
  eyebrow,
  name,
  children,
  bleed,
}: {
  eyebrow: string;
  name: string;
  children?: React.ReactNode;
  // When set, the bottom divider runs edge-to-edge of the p-4 panel (Figma-style
  // section anchoring). Content stays inset via px-4.
  bleed?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-[var(--color-border-default)] pb-3",
        bleed && "-mx-4 px-4",
      )}
    >
      <span className="basis-full text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {eyebrow}
      </span>
      <span className="text-[length:var(--type-title-md-size)] font-semibold leading-tight tracking-[-0.01em] text-foreground">
        {name}
      </span>
      {children}
    </div>
  );
}

// --- List accessory (116:201) ------------------------------------------------
// 32px-tall slot. Width follows the accessory type: 24 for Icon / Avatar /
// Checkbox / Radio, 44 for Switch, 48 (min) for Label.
const ACCESSORY_WIDTH = {
  icon: "w-6",
  switch: "w-11",
  label: "min-w-12",
} as const;

export function ListAccessory({
  type = "icon",
  children,
}: {
  type?: keyof typeof ACCESSORY_WIDTH;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex h-8 shrink-0 items-center justify-center",
        ACCESSORY_WIDTH[type],
        type === "label" &&
          "justify-end whitespace-nowrap text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] font-medium text-[var(--color-text-secondary)]",
      )}
    >
      {children}
    </span>
  );
}

// --- List item (117:424) ------------------------------------------------------
// 44px one-line / 60px two-line, 12px padding and gap, 8px radius. Primary is
// Body/Medium (14/20), secondary is Body/Small (12/16, secondary text) and may
// wrap to two lines. States: hover (surface hover), focus (2px focus ring),
// selected (selected fill + 3px brand indicator), disabled (38% text).
export function ListItem({
  primary,
  secondary,
  secondaryId,
  leading,
  trailing,
  labelFor,
  rowFor,
  selected,
  disabled,
  className,
}: {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  secondaryId?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  // Associates the primary text with a trailing control (switch rows): the
  // control stays the only target, per Eos "Switch is a separate action".
  labelFor?: string;
  // Makes the whole row the label of its control (checkbox rows): the row is
  // the primary action, so it takes the hover state.
  rowFor?: string;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const Row = rowFor ? "label" : "div";
  const Primary = labelFor ? "label" : "span";
  return (
    <Row
      htmlFor={rowFor}
      aria-disabled={disabled || undefined}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-sm px-3 py-1 text-left",
        secondary ? "min-h-[60px]" : "min-h-11",
        rowFor &&
          "cursor-pointer transition-colors hover:bg-[var(--color-bg-hover)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-[var(--color-focus-ring)]",
        selected && "bg-[var(--color-bg-selected)] hover:bg-[var(--color-bg-selected)]",
        disabled && "pointer-events-none",
        className,
      )}
    >
      {selected && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[var(--color-action-primary)]" />
      )}
      {leading}
      <span className="flex min-w-0 flex-1 flex-col">
        <Primary
          htmlFor={labelFor}
          className={cn(
            "truncate text-[length:var(--type-body-md-size)] leading-[length:var(--type-body-md-lh)] font-normal",
            disabled ? "text-foreground/40" : "text-foreground",
            labelFor && "cursor-pointer",
          )}
        >
          {primary}
        </Primary>
        {secondary && (
          <span
            id={secondaryId}
            className="line-clamp-2 text-[length:var(--type-body-sm-size)] leading-[length:var(--type-body-sm-lh)] text-[var(--color-text-secondary)]"
          >
            {secondary}
          </span>
        )}
      </span>
      {trailing}
    </Row>
  );
}

// --- Field row ----------------------------------------------------------------
// Text, select, textarea and radio controls don't fit a list row, so they stack
// under a Label/Medium caption on the same 12px row inset as List item.
export function PropertyRow({
  label,
  htmlFor,
  required,
  help,
  children,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  help?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 px-3 py-2">
      <label
        htmlFor={htmlFor}
        className="min-w-0 break-words text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] font-medium text-[var(--color-text-secondary)]"
      >
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <div className="min-w-0">
        {children}
        {help && (
          <p className="mt-1 text-[length:var(--type-body-sm-size)] leading-[length:var(--type-body-sm-lh)] text-[var(--color-text-secondary)]">
            {help}
          </p>
        )}
      </div>
    </div>
  );
}

// Rows container (one semantic list). Pass `-mx-3` when it sits directly in a
// p-4 panel body so rows land on the 4px inset column.
export function PropertyRows({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}

// --- List divider (117:6194) ---------------------------------------------------
export function ListDivider({ inset = "full" }: { inset?: "full" | "content" }) {
  return (
    <div aria-hidden className={cn("h-px shrink-0", inset === "content" && "pl-12")}>
      <div className="h-px bg-[var(--color-border-default)]" />
    </div>
  );
}

// Data stores group headers in caps ("COMMERCE / CONFIGURATION"); the Eos
// subheader is sentence case. Acronyms keep their caps.
const ACRONYMS = new Set(["CTA", "FAQ", "URL", "URLS", "ID", "SEO", "T&C", "TV", "AI"]);
function sentenceCase(text: string): string {
  if (text !== text.toUpperCase()) return text;
  return text
    .split(" ")
    .map((word, i) => {
      if (ACRONYMS.has(word)) return word;
      const lower = word.toLowerCase();
      return i === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
    })
    .join(" ");
}

// --- List subheader (117:6210), Inset=Full, Sticky=Off -------------------------
// 36px, 12px padding, Label/Large Emphasised (14/20 semibold). Headed groups
// collapse, so the subheader carries a trailing 24px chevron accessory. An
// optional `action` renders as a SIBLING of the trigger, never nested inside it.
export function PropertySection({
  header,
  expanded,
  onToggle,
  action,
  children,
}: {
  header?: string;
  expanded?: boolean;
  onToggle?: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!header) {
    return <section className="px-1 py-2">{children}</section>;
  }
  return (
    <Collapsible open={expanded} onOpenChange={onToggle} className="px-1 py-2">
      <div className="flex items-center gap-1">
        <CollapsibleTrigger className="group flex h-9 min-w-0 flex-1 items-center gap-3 rounded-sm px-3 text-left text-[length:var(--type-label-lg-size)] leading-[length:var(--type-label-lg-lh)] font-semibold text-foreground transition-colors hover:bg-[var(--color-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-focus-ring)]">
          <span className="min-w-0 flex-1 truncate">{sentenceCase(header)}</span>
          <span aria-hidden className="flex h-8 w-6 shrink-0 items-center justify-center text-[var(--color-text-secondary)]">
            <MSym name="expand_more" size={24} className="transition-transform group-data-[state=closed]:-rotate-90" />
          </span>
        </CollapsibleTrigger>
        {action}
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
