import { colorGroups, controlHeights, radii, spacingSteps, typeScale } from "../foundations";

// Foundations render entirely from foundations.ts (single source of truth).
export function FoundationsSection() {
  return (
    <section id="foundations">
      <h2>Foundations</h2>
      <p className="ui-ds__lead">
        Semantic tokens map 1:1 to the prototype's raw values, so adopting the system causes zero
        visual drift. Every component style references a token — never a literal.
      </p>

      <h3>Color</h3>
      {colorGroups.map((group) => (
        <div key={group.name} className="ui-ds__stack" style={{ maxWidth: "100%" }}>
          <span className="ui-ds__meta">{group.name}</span>
          <div className="ui-swatches">
            {group.tokens.map((t) => (
              <div key={t.var} className="ui-swatch">
                <div className="ui-swatch__chip" style={{ background: `var(${t.var})` }} />
                <div className="ui-swatch__meta">
                  <span className="ui-swatch__name">{t.var}</span>
                  <span className="ui-swatch__value">{t.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h3>Typography</h3>
      {typeScale.map((t) => (
        <div key={t.var} className="ui-scale-row">
          <span className="ui-scale-row__meta">
            {t.var} · {t.px}px
          </span>
          <span style={{ fontSize: `var(${t.var})` }}>The quick brown fox</span>
        </div>
      ))}

      <h3>Spacing</h3>
      {spacingSteps.map((s) => (
        <div key={s.var} className="ui-scale-row">
          <span className="ui-scale-row__meta">
            {s.var} · {s.px}px
          </span>
          <span className="ui-scale-bar" style={{ width: `var(${s.var})` }} />
        </div>
      ))}

      <h3>Radius</h3>
      <div className="ui-ds__row">
        {radii.map((r) => (
          <div key={r.var} className="ui-ds__stack" style={{ margin: 0 }}>
            <span className="ui-radius-demo" style={{ borderRadius: `var(${r.var})` }} />
            <span className="ui-swatch__value">
              {r.var} · {r.px}px
            </span>
          </div>
        ))}
      </div>

      <h3>Control heights</h3>
      <div className="ui-ds__row">
        {controlHeights.map((c) => (
          <span key={c.var} className="ui-height-demo" style={{ height: `var(${c.var})` }}>
            {c.var} · {c.px}px
          </span>
        ))}
      </div>

      <h3>Focus</h3>
      <p className="ui-ds__lead">Every interactive element shows a visible focus ring. Tab to the button below.</p>
      <button type="button" className="ui-btn ui-btn--secondary ui-focus-demo">
        Focus me
      </button>
    </section>
  );
}
