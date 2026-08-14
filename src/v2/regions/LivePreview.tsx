import type { VariantWorkspace } from "../data";

interface LivePreviewProps {
  // The active Variant. When null (a Page \u2014 not a Variant \u2014 is selected) the
  // canvas shows a "select a variant" empty state.
  variant: VariantWorkspace | null;
}

// Neutral central workspace hosting the Peacock preview. Reuses the shared
// ui-preview-* visuals (recreated from V1) so both prototypes stay consistent.
// The canvas contents follow the active Variant's preview state.
export function LivePreview({ variant }: LivePreviewProps) {
  const preview = variant?.previewData ?? null;
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
                <span className="ui-preview__title">{preview.title}</span>
                <p className="ui-preview__body">{preview.body}</p>
              </div>
            ) : (
              <span className="ui-preview__label">Select a variant to preview</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
