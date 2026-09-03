import { useState } from "react";
import type { AuthoringContext, SectionRole, StructureObjectType, VariantWorkspace } from "../data";
import type { PreviewModel, PreviewCard } from "../previewModel";
import { Button } from "../ui-lib/Button";
import { Select } from "../ui-lib/Select";
import { Badge } from "../ui-lib/Badge";

// The selected Structure object, as resolved by WorkspaceShell. Drives the
// canvas so the preview reflects what the author is editing. role is set only
// for Sections (its page role, e.g. "Plan Picker").
export interface SelectedObject {
  label: string;
  role: SectionRole | null;
  objectType: StructureObjectType | null;
}

interface LivePreviewProps {
  // The active experience. When null (a route — not an experience — is
  // selected) the canvas shows an empty state.
  variant: VariantWorkspace | null;
  // Active authoring context; selects the empty-state wording and the preview
  // framing (page vs retention widget).
  context: AuthoringContext;
  // The selected Structure object (metadata for the empty/idle states).
  selectedObject?: SelectedObject | null;
  // The live, renderable projection of the selection + the author's edits. This
  // is what makes the canvas dynamic: it re-derives as fields change.
  previewModel: PreviewModel;
}

// Audience options grounded in the real Iceberg Content Page form, whose
// configuration is tabbed by membership type. "Default" previews the base
// experience; the others frame the canvas as that membership audience.
const AUDIENCE_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Sky Cinema", value: "sky-cinema" },
  { label: "Kids", value: "kids" },
  { label: "Sky Sports", value: "sky-sports" },
];

// Preview viewport sizes. The value maps to a max-width class on the canvas
// frame so the preview visibly reframes (desktop / tablet / mobile).
const SIZE_OPTIONS = [
  { label: "Full Size", value: "full" },
  { label: "Tablet", value: "tablet" },
  { label: "Mobile", value: "mobile" },
];

// One plan/product card in the brand-rendered plan picker.
function BrandCard({ card }: { card: PreviewCard }) {
  return (
    <article className="ui-brand__card" data-featured={card.badge ? "true" : undefined}>
      {card.badge ? <span className="ui-brand__badge">{card.badge}</span> : null}
      <div className="ui-brand__card-body">
        {card.eyebrow ? <p className="ui-brand__eyebrow">{card.eyebrow}</p> : null}
        <h3 className="ui-brand__name">{card.title}</h3>
        {card.description ? <p className="ui-brand__desc">{card.description}</p> : null}
        {card.features.length > 0 ? (
          <ul className="ui-brand__features">
            {card.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        ) : null}
        {card.price ? (
          <p className="ui-brand__price">
            {card.price}
            {card.priceCadence ? (
              <span className="ui-brand__cadence"> / {card.priceCadence}</span>
            ) : null}
          </p>
        ) : null}
        <span className="ui-brand__cta">{card.cta ?? "Get Started"}</span>
      </div>
    </article>
  );
}

// The customer-facing brand render (Peacock). Deliberately styled with its own
// `--brand-*` scale (see eos.css), NOT the CMS design tokens — the tool's chrome
// and the previewed page are separate design systems.
function BrandRender({ model }: { model: PreviewModel }) {
  return (
    <div className="ui-brand">
      <header className="ui-brand__header">
        <span className="ui-brand__logo">peacock</span>
        <div className="ui-brand__nav">
          <span className="ui-brand__link">Sign In</span>
          <span className="ui-brand__btn">Get Started</span>
        </div>
      </header>

      <div className="ui-brand__section" data-align={model.alignment}>
        {model.eyebrow ? <p className="ui-brand__section-eyebrow">{model.eyebrow}</p> : null}
        {model.title ? <h2 className="ui-brand__title">{model.title}</h2> : null}
        {model.subtitle ? <p className="ui-brand__subtitle">{model.subtitle}</p> : null}

        {model.kind === "plans" && (
          <div className="ui-brand__cards" data-count={model.cards.length}>
            {model.cards.map((card) => (
              <BrandCard key={card.id} card={card} />
            ))}
          </div>
        )}

        {model.kind === "message" && model.message ? (
          <div className="ui-brand__message">{model.message}</div>
        ) : null}

        {model.disclaimer ? (
          <p className="ui-brand__disclaimer">{model.disclaimer}</p>
        ) : null}
      </div>
    </div>
  );
}

// Neutral central workspace hosting the Peacock preview. The canvas now renders
// a LIVE brand projection of the selected object + the author's edits (plan
// picker cards, hero, or a copy block), reframed by the toolbar's audience +
// size controls. Editing a field in Properties updates this immediately.
export function LivePreview({ variant, context, previewModel }: LivePreviewProps) {
  const isWidget = context === "widget";
  // Real, local preview controls. They reframe the canvas (audience + size).
  const [audience, setAudience] = useState("default");
  const [size, setSize] = useState("full");
  const audienceLabel =
    AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label ?? "Default";
  const hasContent = variant != null && previewModel.kind !== "empty";

  return (
    <section className="ui-ws__region ui-ws-preview" aria-label="Live preview">
      <div className="ui-ws-preview__inner">
        <div className="ui-preview">
          <div className="ui-preview__toolbar">
            <span className="ui-preview__gear" aria-hidden="true" />
            <Button variant="tertiary" size="sm" onClick={() => {}}>
              Preview In Tab
            </Button>
            <Button variant="tertiary" size="sm" onClick={() => {}}>
              Pick Section
            </Button>
            <label className="ui-preview__field">
              <span className="ui-visually-hidden">Audience</span>
              <Select
                size="sm"
                value={audience}
                onChange={setAudience}
                options={AUDIENCE_OPTIONS}
              />
            </label>
            <label className="ui-preview__field">
              <span className="ui-visually-hidden">Preview size</span>
              <Select
                size="sm"
                value={size}
                onChange={setSize}
                options={SIZE_OPTIONS}
              />
            </label>
            <span className="ui-preview__status">
              <Badge variant="success">LIVE</Badge>
            </span>
          </div>
          {/* The canvas renders customer output, so it is a LIGHT island even
              though the surrounding workspace is light already; data-theme keeps
              the brand render isolated from CMS token changes. */}
          <div className="ui-preview__canvas" data-theme="light">
            {hasContent ? (
              <div
                className={`ui-preview__frame ui-preview__frame--${size}`}
                data-audience={audience}
              >
                <BrandRender model={previewModel} />
                {audience !== "default" && (
                  <p className="ui-preview__audience">
                    <Badge variant="info">{audienceLabel} audience</Badge>
                  </p>
                )}
              </div>
            ) : (
              <span className="ui-preview__label">
                Select a {isWidget ? "widget config" : "variant"}, then an object
                in its structure to preview it.
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
