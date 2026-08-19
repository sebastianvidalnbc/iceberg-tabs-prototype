import type { AuthoringContext, VariantWorkspace } from "../data";

interface LivePreviewProps {
  // The active experience. When null (a route \u2014 not an experience \u2014 is
  // selected) the canvas shows an empty state.
  variant: VariantWorkspace | null;
  // Active authoring context; selects the empty-state wording and whether the
  // Widget selected-object summary is shown.
  context: AuthoringContext;
  // Label of the selected Structure object (Widget context only) \u2014 surfaced as
  // a small "Selected:" summary so the preview reflects the current selection.
  selectedObjectLabel?: string | null;
}

// Neutral central workspace hosting the Peacock preview. Reuses the shared
// ui-preview-* visuals (recreated from V1) so both prototypes stay consistent.
// The canvas contents follow the active experience's preview state.
export function LivePreview({ variant, context, selectedObjectLabel }: LivePreviewProps) {
  const preview = variant?.previewData ?? null;
  const isWidget = context === "widget";
  return (
    <section className="ui-ws__region ui-ws-preview" aria-label="Live preview">
      <div className="ui-ws-preview__inner">
        <div className="ui-preview">
          <div className="ui-preview__toolbar">
            <span className="ui-preview__gear" aria-hidden="true" />
            <span className="ui-preview__btn">Preview In Tab</span>
            <span className="ui-preview__btn">Pick Section</span>
            <span className="ui-preview__select">Default</span>
            <span className="ui-preview__select">Full Size</span>
            <span className="ui-preview__badge">LIVE</span>
          </div>
          <div className="ui-preview__canvas">
            {preview ? (
              <div className={`ui-preview__state ui-preview__state--${preview.tone}`}>
                <span className="ui-preview__eyebrow">{preview.subtitle}</span>
                <span className="ui-preview__title">
                  {isWidget ? "Retention widget" : preview.title}
                </span>
                <p className="ui-preview__body">{preview.body}</p>
                {isWidget && selectedObjectLabel && (
                  <p className="ui-preview__body">
                    <strong>Selected:</strong> {selectedObjectLabel}
                  </p>
                )}
              </div>
            ) : (
              <span className="ui-preview__label">
                Select a {isWidget ? "widget config" : "variant"} to preview
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
