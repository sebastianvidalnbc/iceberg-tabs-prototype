import { cn } from "@/v4-eos/ui/lib/utils";

/**
 * Authoring-shell typography roles (Explorer, preview toolbar, panel headers,
 * structure tree). Purpose-named classes on Eos tokens — complements
 * `inspectorType` in property.tsx for the Properties panel.
 */
export const chromeType = {
  panelEyebrow:
    "text-[length:var(--type-label-md-size)] font-semibold leading-[length:var(--type-label-md-lh)] uppercase tracking-[0.06em] text-muted-foreground",
  panelTitle:
    "truncate text-[length:var(--type-title-sm-size)] font-semibold leading-[length:var(--type-title-sm-lh)] text-foreground",
  panelSub:
    "truncate text-[length:var(--type-body-sm-size)] font-normal leading-[length:var(--type-body-sm-lh)] text-muted-foreground",
  treeLabel:
    "text-[length:var(--type-body-md-size)] font-normal leading-[length:var(--type-body-md-lh)] text-foreground/90",
  treeLabelSelected: "font-medium text-foreground",
  treeLabelMuted:
    "font-mono text-[length:var(--type-body-sm-size)] font-normal leading-[length:var(--type-body-sm-lh)] text-muted-foreground",
  toolbarControl:
    "text-[length:var(--type-body-md-size)] font-normal leading-[length:var(--type-body-md-lh)]",
  breadcrumb:
    "text-[length:var(--type-body-sm-size)] font-normal leading-[length:var(--type-body-sm-lh)] text-muted-foreground",
  breadcrumbCurrent:
    "text-[length:var(--type-body-sm-size)] font-medium leading-[length:var(--type-body-sm-lh)] text-foreground",
} as const;

export function chromePanelHeaderClass(className?: string) {
  return cn(
    "flex shrink-0 items-center justify-between gap-2 border-b border-[var(--color-border-subtle)] px-3 py-2.5",
    className,
  );
}
