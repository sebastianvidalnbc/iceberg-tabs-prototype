import type { PreviewModel, PreviewCard, PreviewSection } from "../previewModel";

// Customer-facing brand render (Peacock), living INSIDE the preview iframe. It
// renders the WHOLE variant as a vertical stack of sections (like a Figma frame
// showing every element), NOT just the selected layer. Each selectable element
// carries a `data-node-id` so the CMS can (a) outline the selected node and
// (b) receive a Pick Section click that selects it.

function BrandCard({
  card,
  selectedId,
  onPick,
}: {
  card: PreviewCard;
  selectedId: string | null;
  onPick: (nodeId: string) => void;
}) {
  return (
    <article
      className="ui-brand__card"
      data-node-id={card.id}
      data-featured={card.badge ? "true" : undefined}
      data-selected={card.id === selectedId ? "true" : undefined}
      onClick={(e) => {
        e.stopPropagation();
        onPick(card.id);
      }}
    >
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

function BrandSection({
  section,
  selectedId,
  onPick,
}: {
  section: PreviewSection;
  selectedId: string | null;
  onPick: (nodeId: string) => void;
}) {
  return (
    <div
      className="ui-brand__section"
      data-align={section.alignment}
      data-node-id={section.nodeId}
      data-selected={section.nodeId === selectedId ? "true" : undefined}
      onClick={() => onPick(section.nodeId)}
    >
      {section.eyebrow ? (
        <p className="ui-brand__section-eyebrow">{section.eyebrow}</p>
      ) : null}
      {section.title ? <h2 className="ui-brand__title">{section.title}</h2> : null}
      {section.subtitle ? (
        <p className="ui-brand__subtitle">{section.subtitle}</p>
      ) : null}

      {section.kind === "plans" && (
        <div className="ui-brand__cards" data-count={section.cards.length}>
          {section.cards.map((card) => (
            <BrandCard
              key={card.id}
              card={card}
              selectedId={selectedId}
              onPick={onPick}
            />
          ))}
        </div>
      )}

      {section.kind === "message" && section.message ? (
        <div className="ui-brand__message">{section.message}</div>
      ) : null}

      {section.disclaimer ? (
        <p className="ui-brand__disclaimer">{section.disclaimer}</p>
      ) : null}
    </div>
  );
}

export function BrandRender({
  model,
  selectedId,
  pickMode,
  onPick,
}: {
  model: PreviewModel;
  selectedId: string | null;
  pickMode: boolean;
  onPick: (nodeId: string) => void;
}) {
  return (
    <div className="ui-brand" data-pick={pickMode ? "true" : undefined}>
      <header className="ui-brand__header">
        <span className="ui-brand__logo">peacock</span>
        <div className="ui-brand__nav">
          <span className="ui-brand__link">Sign In</span>
          <span className="ui-brand__btn">Get Started</span>
        </div>
      </header>

      {model.sections.map((section) => (
        <BrandSection
          key={section.nodeId}
          section={section}
          selectedId={selectedId}
          onPick={onPick}
        />
      ))}
    </div>
  );
}
