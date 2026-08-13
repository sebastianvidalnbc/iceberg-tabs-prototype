// Non-interactive placeholder that mimics the real Iceberg live-preview pane.
// A gray canvas stands in for the rendered Peacock page, making clear that the
// prototype only reworks the middle editor column.

export function PreviewPane() {
  return (
    <aside className="preview-pane" aria-hidden="true">
      <div className="preview-toolbar">
        <span className="pv-gear" />
        <span className="pv-btn">Preview In Tab</span>
        <span className="pv-btn">Pick Section</span>
        <span className="pv-select">Default</span>
        <span className="pv-select">Full Size</span>
        <span className="pv-badge">PASS 100/100</span>
      </div>
      <div className="preview-canvas">
        <span className="preview-label">Live Preview</span>
      </div>
    </aside>
  );
}
