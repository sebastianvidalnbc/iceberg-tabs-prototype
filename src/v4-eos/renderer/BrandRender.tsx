import type { PreviewModel, PreviewCard } from "../previewModel";

// Customer-facing brand render (Peacock), living INSIDE the preview iframe. This
// is the leaf renderer the CMS drives via postMessage — the V4 analog of an
// elements-peacock module render. Each selectable element carries a
// `data-node-id` so the CMS can (a) outline the selected node and (b) receive a
// Pick Section click that selects it.

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

      <div
        className="ui-brand__section"
        data-align={model.alignment}
        data-node-id={model.nodeId}
        data-selected={model.nodeId && model.nodeId === selectedId ? "true" : undefined}
        onClick={() => model.nodeId && onPick(model.nodeId)}
      >
        {model.eyebrow ? <p className="ui-brand__section-eyebrow">{model.eyebrow}</p> : null}
        {model.title ? <h2 className="ui-brand__title">{model.title}</h2> : null}
        {model.subtitle ? <p className="ui-brand__subtitle">{model.subtitle}</p> : null}

        {model.kind === "plans" && (
          <div className="ui-brand__cards" data-count={model.cards.length}>
            {model.cards.map((card) => (
              <BrandCard
                key={card.id}
                card={card}
                selectedId={selectedId}
                onPick={onPick}
              />
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
