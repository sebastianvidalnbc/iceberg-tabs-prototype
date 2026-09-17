import { MSym } from "@/v4-eos/ui/msym";
import { ScrollArea } from "@/v4-eos/ui/scroll-area";
import { routes, navigate } from "../browse";
import {
  FoundationsSection,
  ActionsSection,
  StatusSection,
  FormSection,
  PatternsSection,
  ContributionsSection,
} from "./catalog/sections";

// V4 (Eos) design-system catalog. A living, truthful reference for the
// Eos-aligned components this workspace actually runs on (Phases 1\u20138),
// grouped into the four categories that matter for this migration: the raw
// Eos tokens, the Eos components Iceberg consumes as-is, the Iceberg-specific
// compositions built on top of them, and the Iceberg pieces that could go
// the other way \u2014 back into Eos as new library primitives. Distinct from
// V1's shared #/design-system catalog (src/ui/DesignSystem.tsx) and V2's own
// copy (src/v2/regions/DesignSystem.tsx); this route only documents V4.
const NAV_GROUPS = [
  {
    label: "Eos Foundations",
    items: [{ id: "foundations", label: "Foundations" }],
  },
  {
    label: "Eos Components Used by Iceberg",
    items: [
      { id: "actions", label: "Actions" },
      { id: "status", label: "Status & badges" },
      { id: "form-controls", label: "Form controls" },
    ],
  },
  {
    label: "Iceberg Patterns",
    items: [{ id: "patterns", label: "Patterns" }],
  },
  {
    label: "Potential Eos Contributions",
    items: [{ id: "contributions", label: "Contributions" }],
  },
] as const;

export function DesignSystem() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--color-bg-canvas)] text-foreground">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-3">
        <button
          type="button"
          onClick={() => navigate(routes.pages())}
          className="inline-flex items-center gap-1.5 rounded-sm text-[length:var(--type-label-lg-size)] leading-[length:var(--type-label-lg-lh)] font-medium text-[var(--color-action-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <MSym name="arrow_back" size={16} />
          Back to workspace
        </button>
        <span className="text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] text-muted-foreground">Eos Design System</span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)]">
        <nav
          aria-label="Design system sections"
          className="shrink-0 border-r border-border bg-[var(--color-bg-panel)] px-3 py-4"
        >
          <ol className="flex flex-col gap-4">
            {NAV_GROUPS.map((group) => (
              <li key={group.label}>
                <span className="block px-2 text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {group.label}
                </span>
                <ol className="mt-1 flex flex-col gap-0.5">
                  {group.items.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`${routes.designSystem()}#${s.id}`}
                        className="block rounded-sm px-2 py-1.5 text-[length:var(--type-label-lg-size)] leading-[length:var(--type-label-lg-lh)] text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </nav>

        <ScrollArea className="min-h-0">
          <main className="mx-auto max-w-4xl px-8 py-8">
            <h1 className="text-[length:var(--type-headline-sm-size)] font-semibold tracking-tight text-foreground">
              Iceberg on Eos
            </h1>
            <p className="mt-2 max-w-2xl text-[length:var(--type-body-md-size)] leading-relaxed text-muted-foreground">
              V4 authoring UI, aligned to the Eos Design System v1.0 (Phases
              1–8): shared M3-derived tokens, Eos-spec'd primitives, and the
              Iceberg-specific compositions built on top of them — plus, at
              the end, the pieces that go the other way.
            </p>
            <div className="mt-8 flex flex-col gap-8">
              <FoundationsSection />
              <ActionsSection />
              <StatusSection />
              <FormSection />
              <PatternsSection />
              <ContributionsSection />
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
