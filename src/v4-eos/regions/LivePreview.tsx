import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { AuthoringContext, SectionRole, StructureObjectType, VariantWorkspace } from "../data";
import type { PreviewModel } from "../previewModel";
import { SelectField } from "../ui/form-controls";
import { Badge } from "../ui-lib/Badge";
import {
  CMS_SOURCE,
  PREVIEW_SOURCE,
  PREVIEW_STORAGE_KEY,
  type CmsToPreview,
  type PreviewToCms,
} from "../renderer/protocol";

// The selected Structure object, as resolved by WorkspaceShell. role is set only
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
  context: AuthoringContext;
  selectedObject?: SelectedObject | null;
  // The live, renderable projection of the selection + the instance's edits.
  previewModel: PreviewModel;
  // The selected Structure node id (for highlight + Pick Section round-trip).
  selectedId: string | null;
  // Select a node when the author clicks it in the preview (Pick Section).
  onPickSection: (nodeId: string) => void;
  // MVT / A-B variations the author can preview (the mvtOverride analog).
  variations: { id: string; label: string; section?: string }[];
  mvtOverride: string;
  onMvtChange: (id: string) => void;
}

// Audience options grounded in the real Iceberg Content Page form.
const AUDIENCE_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Sky Cinema", value: "sky-cinema" },
  { label: "Kids", value: "kids" },
  { label: "Sky Sports", value: "sky-sports" },
];

// Device presets mirror the real editor's device-selector (Default / Laptop /
// Tablet / Mobile). Each maps to a TRUE viewport width the iframe renders at;
// the frame is then scaled to fit the preview column (see DESIGN_WIDTHS) so the
// customer render keeps its real published proportions instead of being squashed
// into the narrow column at 1:1 (which made everything look ~2× too big).
const SIZE_OPTIONS = [
  { label: "Full Size", value: "full" },
  { label: "Laptop", value: "laptop" },
  { label: "Tablet", value: "tablet" },
  { label: "Mobile", value: "mobile" },
];

// The viewport width (px) each preset renders the iframe document at. "Full" is
// the VERIFIED Commerce design frame (1440) — the exact width brand.css is built
// against (--pk-content-max 1440, 56px gutters, 384px plan cards), so the plan
// picker sits 3-across as designed. It is then scaled down to fit the column.
// Narrower devices only scale down when the column is smaller than the device
// (otherwise they show 1:1, centred).
const DESIGN_WIDTHS: Record<string, number> = {
  full: 1440,
  laptop: 1024,
  tablet: 834,
  mobile: 390,
};

// Sentinel for the MVT "As authored" option (Radix Select rejects "").
const AS_AUTHORED = "__as_authored__";

// The standalone renderer document the iframe loads. BASE_URL is
// "/iceberg-v4-eos/" in both dev (via the config middleware) and prod.
const RENDERER_URL = `${import.meta.env.BASE_URL}renderer.html`;

// Live accessibility score — the real editor's "semáforo": a colour-coded
// readout of the page's a11y rate for the current locale. Tri-state by ratio
// (green pass / amber review / red fail). The prototype has no a11y engine, so
// the score is representative; the component is fully driven by props so a real
// audit result can flow straight in.
function AccessibilityScore({
  score = 100,
  max = 100,
  region = "USA",
  locale = "en-US",
}: {
  score?: number;
  max?: number;
  region?: string;
  locale?: string;
}) {
  const pct = max > 0 ? score / max : 0;
  const state = pct >= 1 ? "pass" : pct >= 0.9 ? "warn" : "fail";
  const statusLabel = state === "pass" ? "Pass" : state === "warn" ? "Review" : "Fail";
  const localeLabel = `${region}-${locale.toUpperCase()}`;
  return (
    <div
      className="ui-a11y"
      data-state={state}
      role="status"
      aria-label={`Accessibility ${statusLabel}: ${score} of ${max}. Locale ${region} ${locale}.`}
      title={`Accessibility ${statusLabel} — ${score}/${max} · ${localeLabel}`}
    >
      <span className="ui-a11y__status">{statusLabel}</span>
      <span className="ui-a11y__score">
        {score}/{max}
      </span>
      <span className="ui-a11y__locale">{localeLabel}</span>
    </div>
  );
}

// Live preview status — the tri-state the real editor shows. ENABLED = green
// LIVE (postMessage patches flowing); LOADING = iframe (re)loading; DISABLED =
// nothing selected to render.
type LiveStatus = "live" | "loading" | "disabled";

// Central workspace hosting the Peacock preview in a SEPARATE iframe document
// (renderer.html), synchronised over postMessage — the V4 analog of the real
// editor↔renderer bridge. Field edits patch the frame live; selecting a node
// highlights it in the frame; Pick Section lets a click in the frame select the
// matching Structure node. Device + audience controls reframe the canvas.
export function LivePreview({
  variant,
  context,
  previewModel,
  selectedId,
  onPickSection,
  variations,
  mvtOverride,
  onMvtChange,
}: LivePreviewProps) {
  const isWidget = context === "widget";
  const [audience, setAudience] = useState("default");
  const [size, setSize] = useState("full");
  const [ready, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Measure the available canvas so we can scale a real desktop-width iframe to
  // fit it (device-preview zoom). ResizeObserver keeps it correct as the author
  // drags the Explorer/Properties dividers.
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const measure = () =>
      setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fit the desktop-width iframe into the column. scale ≤ 1 (never upscale). The
  // sizer takes the SCALED (visual) box so flex centring works; the frame keeps
  // its true design dimensions and is transform-scaled inside it.
  const designW = DESIGN_WIDTHS[size] ?? 1280;
  const fitScale =
    canvasSize.w > 0 ? Math.min(1, canvasSize.w / designW) : 1;
  const sizerW = Math.round(designW * fitScale);
  const frameH = fitScale > 0 ? Math.round(canvasSize.h / fitScale) : canvasSize.h;

  const audienceLabel =
    AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label ?? "Default";
  const hasContent = variant != null && previewModel.sections.length > 0;

  // MVT/A-B dropdown options: "As authored" + one per variation in the experience.
  // Radix Select forbids an empty-string item value, so "As authored" carries a
  // sentinel that maps back to "" (the mvtOverride default) at the boundary.
  const mvtOptions = [
    { label: "As authored", value: AS_AUTHORED },
    ...variations.map((v) => ({
      label: v.section ? `${v.section} · ${v.label}` : v.label,
      value: v.id,
    })),
  ];

  const status: LiveStatus = !hasContent ? "disabled" : ready ? "live" : "loading";

  // Push the current model + framing state into the iframe (the live patch).
  const postRender = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const msg: CmsToPreview = {
      source: CMS_SOURCE,
      type: "render",
      model: previewModel,
      audience,
      selectedId,
      // Click-to-select is always on; the removed "Highlight elements" toggle
      // used to drive an outline-all mode — no longer surfaced.
      pickMode: false,
    };
    win.postMessage(msg, "*");
    // Mirror the model so a standalone "Preview In Tab" window can render it.
    try {
      localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(previewModel));
    } catch {
      /* ignore */
    }
  }, [previewModel, audience, selectedId]);

  // Listen for messages from the iframe: ready (push the model), and Pick
  // Section clicks (select the node, then exit pick mode).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data as PreviewToCms;
      if (!data || data.source !== PREVIEW_SOURCE) return;
      if (data.type === "ready") {
        setReady(true);
        postRender();
      } else if (data.type === "section-selected") {
        // Click-to-select is always on; picking no longer exits the (optional)
        // highlight mode, so the author can keep clicking element to element.
        onPickSection(data.nodeId);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [postRender, onPickSection]);

  // Re-push whenever the model / selection / framing / pick-mode changes.
  useEffect(() => {
    if (ready) postRender();
  }, [ready, postRender]);

  return (
    <section className="ui-ws__region ui-ws-preview" aria-label="Live preview">
      <div className="ui-ws-preview__inner">
        <div className="ui-preview">
          <div className="ui-preview__toolbar">
            <div className="ui-preview__toolbar-row">
              <div className="ui-preview__controls">
                {variations.length > 0 && (
                  <div className="ui-preview__field">
                    <SelectField
                      aria-label="Variation (MVT)"
                      value={mvtOverride || AS_AUTHORED}
                      onValueChange={(val) =>
                        onMvtChange(val === AS_AUTHORED ? "" : val)
                      }
                      options={mvtOptions}
                    />
                  </div>
                )}
                <div className="ui-preview__field">
                  <SelectField
                    aria-label="Audience"
                    value={audience}
                    onValueChange={setAudience}
                    options={AUDIENCE_OPTIONS}
                  />
                </div>
                <div className="ui-preview__field">
                  <SelectField
                    aria-label="Preview size"
                    value={size}
                    onValueChange={setSize}
                    options={SIZE_OPTIONS}
                  />
                </div>
              </div>
              <div className="ui-preview__meta">
                {hasContent && (
                  <AccessibilityScore score={100} max={100} region="USA" locale="en-US" />
                )}
                <span className="ui-preview__status">
                  {status === "live" && <Badge variant="success">LIVE</Badge>}
                  {status === "loading" && <Badge variant="warning">LOADING</Badge>}
                  {status === "disabled" && <Badge variant="default">DISABLED</Badge>}
                </span>
              </div>
            </div>
          </div>
          <div
            ref={canvasRef}
            className="ui-preview__canvas"
            data-mode={hasContent ? "frame" : undefined}
          >
            {hasContent ? (
              <div
                className="ui-preview__sizer"
                style={{ width: sizerW || undefined, height: canvasSize.h || undefined }}
              >
                <div
                  className="ui-preview__frame"
                  style={{
                    width: designW,
                    height: frameH || undefined,
                    transform: `scale(${fitScale})`,
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    className="ui-preview__iframe"
                    title="Live preview"
                    src={RENDERER_URL}
                    onLoad={() => setReady(false)}
                  />
                </div>
                {audience !== "default" && (
                  <p className="ui-preview__audience-overlay">
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
