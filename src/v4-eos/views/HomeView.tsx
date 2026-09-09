import { useId, useState } from "react";
import { MSym } from "@/v4-eos/ui/msym";
import { Button } from "@/v4-eos/ui/button";
import { Input } from "@/v4-eos/ui/input";
import { Checkbox } from "@/v4-eos/ui/checkbox";
import { SelectField } from "@/v4-eos/ui/form-controls";
import { cn } from "@/v4-eos/ui/lib/utils";
import { navigate, routes } from "../browse";

// The Home dashboard — the landing an author reaches by clicking the Iceberg
// mark. It mirrors the real Iceberg homepage (UAT configurator, quick links,
// operational KPIs, PASS-score audit, module/layout usage) but re-skinned in the
// Eos authoring system: warm-neutral surfaces, tonal cards with no resting
// shadow, Iceberg-blue only for action, and status hues as a semantic family.
//
// PROTOTYPE: every number is illustrative (not wired to real data) — the point
// is to showcase the new visual language of this screen.

// --- tokens for card + eyebrow (kept local; consistent with the panels) ------
const CARD =
  "rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]";
const EYEBROW =
  "text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]";

type Tone = "info" | "warning" | "danger" | "success" | "experiment" | "neutral";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  info: { bg: "var(--color-status-info-bg)", fg: "var(--color-status-info)" },
  warning: {
    bg: "var(--color-status-warning-bg)",
    fg: "var(--color-status-warning)",
  },
  danger: {
    bg: "var(--color-status-danger-bg)",
    fg: "var(--color-status-danger)",
  },
  success: {
    bg: "var(--color-status-success-bg)",
    fg: "var(--color-status-success)",
  },
  experiment: {
    bg: "var(--color-status-experiment-bg)",
    fg: "var(--color-status-experiment)",
  },
  neutral: { bg: "var(--color-bg-subtle)", fg: "var(--color-text-secondary)" },
};

// --- Operational KPIs (illustrative) -----------------------------------------
interface Stat {
  label: string;
  value: number;
  hint: string;
  tone: Tone;
  icon: string;
}
const STATS: Stat[] = [
  { label: "QA Queue", value: 3, hint: "Pages in the QA queue", tone: "info", icon: "fact_check" },
  { label: "Warnings", value: 18, hint: "Pages with unavailable atom data", tone: "warning", icon: "warning" },
  { label: "Optimizely On", value: 112, hint: "Pages with Optimizely switched on", tone: "experiment", icon: "science" },
  { label: "Scheduled · Live", value: 9, hint: "Pages scheduled to go live", tone: "success", icon: "event_available" },
  { label: "Scheduled · Expire", value: 0, hint: "Pages scheduled to expire", tone: "neutral", icon: "event_busy" },
  { label: "Hidden Pages", value: 231, hint: "Hidden from search engines", tone: "info", icon: "visibility_off" },
];

function StatCard({ label, value, hint, tone, icon }: Stat) {
  const t = TONES[tone];
  return (
    <div className={cn(CARD, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <span className={EYEBROW}>{label}</span>
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-full"
          style={{ background: t.bg, color: t.fg }}
        >
          <MSym name={icon} size={18} />
        </span>
      </div>
      <div className="mt-3 text-[40px] font-bold leading-none tabular-nums text-[var(--color-text-primary)]">
        {value}
      </div>
      <p className="mt-2 text-[12px] leading-snug text-[var(--color-text-secondary)]">
        {hint}
      </p>
    </div>
  );
}

// --- Quick access -------------------------------------------------------------
interface Action {
  icon: string;
  label: string;
  hint: string;
  onClick?: () => void;
  disabled?: boolean;
}
const ACTIONS: Action[] = [
  { icon: "description", label: "Page List", hint: "Browse & edit pages", onClick: () => navigate(routes.pages()) },
  { icon: "widgets", label: "Widget List", hint: "Reusable widgets", onClick: () => navigate(routes.widgets()) },
  { icon: "deployed_code", label: "Central Management", hint: "Shared modules & layouts", disabled: true },
  { icon: "dns", label: "Services CMS", hint: "Service & system pages", disabled: true },
];

function ActionCard({ icon, label, hint, onClick, disabled }: Action) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Not available in this prototype" : undefined}
      className={cn(
        CARD,
        "group flex items-center gap-3 p-4 text-left transition-colors",
        "hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
        "disabled:cursor-default disabled:opacity-60 disabled:hover:border-[var(--color-border-subtle)] disabled:hover:bg-[var(--color-bg-surface)]",
      )}
    >
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[var(--color-action-primary-bg)] text-[var(--color-action-primary)]"
      >
        <MSym name={icon} size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold text-[var(--color-text-primary)]">
          {label}
        </span>
        <span className="block truncate text-[12px] text-[var(--color-text-secondary)]">
          {hint}
        </span>
      </span>
      <MSym
        name="chevron_right"
        size={20}
        className="shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5 group-disabled:hidden"
      />
    </button>
  );
}

// --- UAT configurator (interactive prototype state) --------------------------
const COOKIES = [
  "Add CMS cookies",
  "Add API cookies",
  "Add WEB-API cookies",
  "Add Renderer cookies",
];

function UatConfigurator() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [pr, setPr] = useState("");
  const prId = useId();
  const toggle = (c: string, v?: boolean) =>
    setChecks((p) => ({ ...p, [c]: v ?? !p[c] }));
  return (
    <section className={cn(CARD, "flex flex-col gap-4 p-5")}>
      <header>
        <span className={EYEBROW}>UAT Configurator</span>
        <p className="mt-1 text-[12px] leading-snug text-[var(--color-text-secondary)]">
          Attach environment cookies for a CMS test build.
        </p>
      </header>
      <div className="grid gap-1 sm:grid-cols-2">
        {COOKIES.map((c) => (
          <div key={c} className="flex items-center gap-2.5 py-1">
            <Checkbox
              checked={checks[c] ?? false}
              onCheckedChange={(v) => toggle(c, !!v)}
            />
            <span
              className="cursor-pointer text-[13px] text-[var(--color-text-primary)]"
              onClick={() => toggle(c)}
            >
              {c}
            </span>
          </div>
        ))}
      </div>
      <div>
        <label
          htmlFor={prId}
          className="mb-1 block text-[12px] font-normal text-[var(--color-text-secondary)]"
        >
          PR number
        </label>
        <Input
          id={prId}
          value={pr}
          onChange={(e) => setPr(e.target.value)}
          inputMode="numeric"
          placeholder="e.g. 4821"
          className="h-8 max-w-[220px] bg-[var(--color-bg-subtle)] text-[13px]"
        />
        <p className="mt-1 text-[11px] leading-snug text-[var(--color-text-muted)]">
          Add a GitHub pull-request number to target its preview build.
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => {}}>
          Apply cookies
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setChecks({});
            setPr("");
          }}
        >
          Clear
        </Button>
      </div>
    </section>
  );
}

// --- Module / layout usage ----------------------------------------------------
const MODULE_OPTIONS = [
  "Plan Picker",
  "Hero",
  "Carousel",
  "FAQ",
  "Text Block",
  "Offer Banner",
];

function ModuleUsage() {
  const [sel, setSel] = useState("");
  return (
    <section className={cn(CARD, "flex flex-col gap-4 p-5")}>
      <header>
        <span className={EYEBROW}>Module / Layout Usage</span>
        <p className="mt-1 text-[12px] leading-snug text-[var(--color-text-secondary)]">
          See which variants across published pages, widgets and central
          management use a module or layout.
        </p>
      </header>
      <div className="max-w-[280px]">
        <SelectField
          aria-label="Module or layout"
          placeholder="Select module or layout"
          value={sel}
          onValueChange={setSel}
          options={MODULE_OPTIONS}
        />
      </div>
      <div>
        <Button variant="secondary" size="sm" disabled={!sel} onClick={() => {}}>
          View section usage report
          <MSym name="arrow_forward" size={16} />
        </Button>
      </div>
    </section>
  );
}

// --- Page --------------------------------------------------------------------
export function HomeView() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-6 px-6 py-6">
        {/* Hero header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <span className={EYEBROW}>Iceberg · Commerce CMS</span>
            <h1 className="mt-1 text-[24px] font-bold leading-tight tracking-[-0.01em] text-[var(--color-text-primary)]">
              Dashboard
            </h1>
            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
              Content operations overview · US · en-US
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-semibold"
            style={{
              background: "var(--color-status-warning-bg)",
              color: "var(--color-status-warning)",
            }}
          >
            <MSym name="dns" size={14} />
            Peacock Stable-int
          </span>
        </header>

        {/* UAT configurator — first block on the real homepage */}
        <UatConfigurator />

        {/* Quick access */}
        <section aria-label="Quick access" className="flex flex-col gap-3">
          <span className={EYEBROW}>Quick access</span>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
            {ACTIONS.map((a) => (
              <ActionCard key={a.label} {...a} />
            ))}
          </div>
        </section>

        {/* KPI grid */}
        <section
          aria-label="Operational metrics"
          className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]"
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </section>

        {/* PASS score audit — a highlighted, semaforo-style card */}
        <section className={cn(CARD, "p-5")}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: "var(--color-status-danger)" }}
              >
                <MSym name="accessibility_new" size={14} />
                PASS Score Audit
              </span>
              <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                Published pages with a PASS score below 60% · US · en-US
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(routes.pages())}
            >
              Review pages
              <MSym name="arrow_forward" size={16} />
            </Button>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span
              className="text-[48px] font-bold leading-none tabular-nums"
              style={{ color: "var(--color-status-danger)" }}
            >
              153
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]"
              style={{
                background: "var(--color-status-danger-bg)",
                color: "var(--color-status-danger)",
              }}
            >
              Needs attention
            </span>
          </div>
        </section>

        {/* Module / layout usage — final block on the real homepage */}
        <ModuleUsage />
      </div>
    </div>
  );
}
