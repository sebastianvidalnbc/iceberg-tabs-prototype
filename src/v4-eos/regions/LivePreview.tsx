import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthoringContext, SectionRole, StructureObjectType, VariantWorkspace } from "../data";
import type { PreviewModel } from "../previewModel";
import { Button } from "../ui-lib/Button";
import { Select } from "../ui-lib/Select";
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
// Tablet / Mobile). The value maps to a max-width class on the iframe frame.
const SIZE_OPTIONS = [
  { label: "Full Size", value: "full" },
  { label: "Laptop", value: "laptop" },
  { label: "Tablet", value: "tablet" },
  { label: "Mobile", value: "mobile" },
];

// The standalone renderer document the iframe loads. BASE_URL is
// "/iceberg-v4-eos/" in both dev (via the config middleware) and prod.
const RENDERER_URL = `${import.meta.env.BASE_URL}renderer.html`;

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
  const [pickMode, setPickMode] = useState(false);
  const [ready, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const audienceLabel =
    AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label ?? "Default";
  const hasContent = variant != null && previewModel.kind !== "empty";

  // MVT/A-B dropdown options: "As authored" + one per variation in the experience.
  const mvtOptions = [
    { label: "As authored", value: "" },
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
      pickMode,
    };
    win.postMessage(msg, "*");
    // Mirror the model so a standalone "Preview In Tab" window can render it.
    try {
      localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(previewModel));
    } catch {
      /* ignore */
    }
  }, [previewModel, audience, selectedId, pickMode]);

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
        onPickSection(data.nodeId);
        setPickMode(false);
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
            <span className="ui-preview__gear" aria-hidden="true" />
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => window.open(RENDERER_URL, "_blank", "noopener")}
            >
              Preview In Tab
            </Button>
            <Button
              variant={pickMode ? "primary" : "tertiary"}
              size="sm"
              onClick={() => setPickMode((v) => !v)}
              aria-pressed={pickMode}
            >
              {pickMode ? "Picking…" : "Pick Section"}
            </Button>
            {variations.length > 0 && (
              <label className="ui-preview__field">
                <span className="ui-visually-hidden">Variation (MVT)</span>
                <Select
                  size="sm"
                  value={mvtOverride}
                  onChange={onMvtChange}
                  options={mvtOptions}
                />
              </label>
            )}
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
              {status === "live" && <Badge variant="success">LIVE</Badge>}
              {status === "loading" && <Badge variant="warning">LOADING</Badge>}
              {status === "disabled" && <Badge variant="default">DISABLED</Badge>}
            </span>
          </div>
          <div className="ui-preview__canvas" data-mode={hasContent ? "frame" : undefined}>
            {hasContent ? (
              <div className={`ui-preview__frame ui-preview__frame--${size}`}>
                <iframe
                  ref={iframeRef}
                  className="ui-preview__iframe"
                  title="Live preview"
                  src={RENDERER_URL}
                  onLoad={() => setReady(false)}
                />
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
