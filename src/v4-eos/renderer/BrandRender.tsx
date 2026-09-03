import { useState } from "react";
import type {
  PreviewModel,
  PreviewCard,
  PreviewSection,
  PreviewItem,
} from "../previewModel";

// Customer-facing brand render (Peacock), living INSIDE the preview iframe. It
// renders the WHOLE variant as a vertical stack of sections (like a Figma frame
// showing every element), NOT just the selected layer. Each selectable element
// carries a `data-node-id` so the CMS can (a) outline the selected node and
// (b) receive a Pick Section click that selects it. Styling inherits the real
// Peacock design system from brand.css (dark canvas, gold CTA, branded cards).

// A checkmark glyph for feature bullets (the real render uses the Peacock icon
// set; a check reads correctly for every feature icon name).
function Check() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="ui-brand__check">
      <path
        d="M20 6L9 17l-5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
    <li className="ui-brand__card-li">
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
        <div className="ui-brand__card-top">
          <div className="ui-brand__card-title">
            {card.titleIcon ? <span className="ui-brand__card-icon" aria-hidden="true" /> : null}
            <h3 className="ui-brand__name">{card.title}</h3>
          </div>
          {card.description ? <p className="ui-brand__desc">{card.description}</p> : null}
          {card.features.length > 0 ? (
            <ul className="ui-brand__features">
              {card.features.map((f, i) => (
                <li key={i}>
                  <span className="ui-brand__feature-icon">
                    <Check />
                  </span>
                  <span className="ui-brand__feature-text">{f.text}</span>
                </li>
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
        </div>
        {card.cta ? (
          <div className="ui-brand__card-bottom">
            <span className="ui-brand__cta">{card.cta}</span>
          </div>
        ) : null}
      </article>
    </li>
  );
}

// The product-card grid.
function PlanCards({
  cards,
  selectedId,
  onPick,
}: {
  cards: PreviewCard[];
  selectedId: string | null;
  onPick: (nodeId: string) => void;
}) {
  return (
    <ol className="ui-brand__cards" data-count={cards.length}>
      {cards.map((card) => (
        <BrandCard key={card.id} card={card} selectedId={selectedId} onPick={onPick} />
      ))}
    </ol>
  );
}

// Plans / Bundles segmented toggle — shown when a plan picker has 2+ categories
// (the real Peacock category switcher). Switching swaps the rendered card set.
function Plans({
  section,
  selectedId,
  onPick,
}: {
  section: PreviewSection;
  selectedId: string | null;
  onPick: (nodeId: string) => void;
}) {
  const cats = section.categories;
  const [active, setActive] = useState(0);
  if (cats && cats.length > 1) {
    const idx = Math.min(active, cats.length - 1);
    const activeCards = cats[idx]?.cards ?? [];
    return (
      <>
        <div
          className="ui-brand__cat-toggle"
          role="tablist"
          aria-label="Categories"
          onClick={(e) => e.stopPropagation()}
        >
          {cats.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              className="ui-brand__cat-tab"
              data-active={i === idx ? "true" : undefined}
              onClick={(e) => {
                e.stopPropagation();
                setActive(i);
              }}
            >
              {c.title}
            </button>
          ))}
        </div>
        {activeCards.length ? (
          <PlanCards cards={activeCards} selectedId={selectedId} onPick={onPick} />
        ) : (
          <p className="ui-brand__cat-empty">No plans in this category yet.</p>
        )}
      </>
    );
  }
  const cards = cats && cats.length === 1 ? cats[0].cards : section.cards;
  return cards.length ? (
    <PlanCards cards={cards} selectedId={selectedId} onPick={onPick} />
  ) : null;
}

// --- Non-plan-picker layout bodies (schematic, on-brand) -------------------

function Faq({ items }: { items: PreviewItem[] }) {
  return (
    <div className="ui-brand__faq">
      {items.map((it, i) => (
        <details key={i} className="ui-brand__faq-item" open={i === 0}>
          <summary>{it.title}</summary>
          {it.body ? <p>{it.body}</p> : null}
        </details>
      ))}
    </div>
  );
}

function Rail({ items }: { items: PreviewItem[] }) {
  return (
    <div className="ui-brand__rail">
      {items.map((it, i) => (
        <div key={i} className="ui-brand__tile ui-brand__tile--wide">
          <span className="ui-brand__tile-label">{it.title}</span>
        </div>
      ))}
    </div>
  );
}

function Grid({ items }: { items: PreviewItem[] }) {
  return (
    <div className="ui-brand__grid">
      {items.map((it, i) => (
        <div key={i} className="ui-brand__tile">
          <span className="ui-brand__tile-label">{it.title}</span>
        </div>
      ))}
    </div>
  );
}

function Comparison({ items }: { items: PreviewItem[] }) {
  return (
    <div className="ui-brand__compare">
      <div className="ui-brand__compare-head">
        <span />
        <span>Free</span>
        <span>Premium</span>
        <span>Premium+</span>
      </div>
      {items.map((it, i) => (
        <div key={i} className="ui-brand__compare-row">
          <span className="ui-brand__compare-feat">{it.title}</span>
          <span className="ui-brand__compare-cell" data-on={i > 0 ? undefined : "true"}>
            {i === 0 ? "✓" : "—"}
          </span>
          <span className="ui-brand__compare-cell" data-on="true">✓</span>
          <span className="ui-brand__compare-cell" data-on="true">✓</span>
        </div>
      ))}
    </div>
  );
}

function Footer({ items }: { items: PreviewItem[] }) {
  return (
    <div className="ui-brand__footcols">
      {items.map((it, i) => (
        <div key={i} className="ui-brand__footcol">
          <p className="ui-brand__footcol-h">{it.title}</p>
          {it.body ? <p className="ui-brand__footcol-b">{it.body}</p> : null}
        </div>
      ))}
    </div>
  );
}

function Steps({ items }: { items: PreviewItem[] }) {
  return (
    <div className="ui-brand__steps">
      {items.map((it, i) => (
        <div key={i} className="ui-brand__step">
          <span className="ui-brand__step-num">{i + 1}</span>
          <div>
            <p className="ui-brand__step-h">{it.title}</p>
            {it.body ? <p className="ui-brand__step-b">{it.body}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function Countdown() {
  const units = [
    { n: "02", l: "Days" },
    { n: "11", l: "Hrs" },
    { n: "45", l: "Min" },
    { n: "30", l: "Sec" },
  ];
  return (
    <div className="ui-brand__countdown">
      {units.map((u) => (
        <div key={u.l} className="ui-brand__count-unit">
          <span className="ui-brand__count-n">{u.n}</span>
          <span className="ui-brand__count-l">{u.l}</span>
        </div>
      ))}
    </div>
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
  const { kind } = section;
  const showHeader = kind !== "footer";
  return (
    <section
      className="ui-brand__section"
      data-kind={kind}
      data-bg={section.background}
      data-align={section.alignment}
      data-node-id={section.nodeId}
      data-selected={section.nodeId === selectedId ? "true" : undefined}
      onClick={() => onPick(section.nodeId)}
    >
      {showHeader && (section.eyebrow || section.title || section.subtitle) ? (
        <div className="ui-brand__head">
          {section.eyebrow ? (
            <p className="ui-brand__section-eyebrow">{section.eyebrow}</p>
          ) : null}
          {section.title ? <h2 className="ui-brand__title">{section.title}</h2> : null}
          {section.subtitle ? (
            <p className="ui-brand__subtitle">{section.subtitle}</p>
          ) : null}
        </div>
      ) : null}

      {kind === "plans" ? (
        <Plans section={section} selectedId={selectedId} onPick={onPick} />
      ) : null}

      {kind === "hero" ? (
        <div className="ui-brand__hero-cta">
          <span className="ui-brand__cta ui-brand__cta--lg">Get Started</span>
        </div>
      ) : null}

      {kind === "banner" ? (
        <div className="ui-brand__banner-cta">
          <span className="ui-brand__cta">Learn more</span>
        </div>
      ) : null}

      {kind === "faq" ? <Faq items={section.items} /> : null}
      {kind === "rail" ? <Rail items={section.items} /> : null}
      {kind === "grid" ? <Grid items={section.items} /> : null}
      {kind === "comparison" ? <Comparison items={section.items} /> : null}
      {kind === "footer" ? <Footer items={section.items} /> : null}
      {kind === "steps" ? <Steps items={section.items} /> : null}
      {kind === "countdown" ? <Countdown /> : null}

      {kind === "message" && section.message ? (
        <div className="ui-brand__message">{section.message}</div>
      ) : null}

      {section.disclaimer ? (
        <p className="ui-brand__disclaimer">{section.disclaimer}</p>
      ) : null}
    </section>
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

      {model.sections.length === 0 ? (
        <div className="ui-brand__empty">Select a variant to preview the page.</div>
      ) : null}
    </div>
  );
}
