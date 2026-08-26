import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/v2/ui/scroll-area";
import { routes, navigate } from "../browse";
import {
  FoundationsSection,
  ActionsSection,
  StatusSection,
  FormSection,
  PatternsSection,
} from "./catalog/sections";

// V2 design-system catalog. A living reference for the shadcn/Tailwind layer in
// src/v2/ui, rendered in the same dark theme as the rest of V2 so specimens
// match the real authoring surfaces. Distinct from V1's shared #/design-system
// catalog (src/ui/DesignSystem.tsx), which documents the light src/ui system.
// This route is V2-only and never touches V1.

const NAV = [
  { id: "foundations", label: "Foundations" },
  { id: "actions", label: "Actions" },
  { id: "status", label: "Status & badges" },
  { id: "form-controls", label: "Form controls" },
  { id: "patterns", label: "Patterns" },
] as const;

export function DesignSystem() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--color-bg-canvas)] text-foreground">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-3">
        <button
          type="button"
          onClick={() => navigate(routes.pages())}
          className="inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-[var(--color-action-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-4" />
          Back to workspace
        </button>
        <span className="text-[13px] text-muted-foreground">V2 Design System</span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[200px_minmax(0,1fr)]">
        <nav
          aria-label="Design system sections"
          className="shrink-0 border-r border-border bg-[var(--color-bg-panel)] px-3 py-4"
        >
          <ol className="flex flex-col gap-0.5">
            {NAV.map((s) => (
              <li key={s.id}>
                <a
                  href={`${routes.designSystem()}#${s.id}`}
                  className="block rounded-sm px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <ScrollArea className="min-h-0">
          <main className="mx-auto max-w-4xl px-8 py-8">
            <h1 className="text-[24px] font-semibold tracking-tight text-foreground">
              Iceberg V2 UI
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
              The shadcn/ui foundation for V2 — themed entirely through the
              Iceberg design tokens. One dark, cohesive component layer intended
              as the base for future internal tools.
            </p>
            <div className="mt-8 flex flex-col gap-8">
              <FoundationsSection />
              <ActionsSection />
              <StatusSection />
              <FormSection />
              <PatternsSection />
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
