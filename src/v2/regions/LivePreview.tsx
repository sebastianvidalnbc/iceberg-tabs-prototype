import { useState } from "react";
import type { AuthoringContext, SectionRole, StructureObjectType, VariantWorkspace } from "../data";
import { Button } from "../../ui/Button";
import { Select } from "../../ui/Select";
import { Badge } from "../../ui/Badge";

// The selected Structure object, as resolved by WorkspaceShell. Drives the
// canvas so the preview reflects what the author is editing. role is set only
// for Sections (its page role, e.g. "Plan Picker").
export interface SelectedObject {
  label: string;
  role: SectionRole | null;
  objectType: StructureObjectType | null;
}

interface LivePreviewProps {
  // The active experience. When null (a route \u2014 not an experience \u2014 is
  // selected) the canvas shows an empty state.
  variant: VariantWorkspace | null;
  // Active authoring context; selects the empty-state wording and the preview
  // framing (page vs retention widget).
  context: AuthoringContext;
  // The selected Structure object \u2014 surfaced in the canvas so the preview
  // reflects the current selection (the workshop's "which section does this
  // field control?" ask). Null when nothing is selected.
  selectedObject?: SelectedObject | null;
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

// Neutral central workspace hosting the Peacock preview. Reuses the shared
// ui-preview-* visuals (recreated from V1) so both prototypes stay consistent.
// The canvas reflects the active experience AND the selected Structure object,
// reframed by the toolbar's audience + size controls.
export function LivePreview({ variant, context, selectedObject }: LivePreviewProps) {
  const preview = variant?.previewData ?? null;
  const isWidget = context === "widget";
  // Real, local preview controls. Static prototype: they reframe the canvas but
  // do not fetch real rendered content.
  const [audience, setAudience] = useState("default");
  const [size, setSize] = useState("full");
  const audienceLabel =
    AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label ?? "Default";

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
          {/* The canvas shows real Peacock output, so it is a LIGHT island even
              though the surrounding V2 workspace is dark: data-theme="light"
              re-asserts the light color roles here, overriding the shell's dark
              scope. The toolbar above stays dark (it is CMS authoring chrome,
              not preview output). */}
          <div className="ui-preview__canvas" data-theme="light">
            {preview ? (
              <div
                className={`ui-preview__frame ui-preview__frame--${size}`}
                data-audience={audience}
              >
                <div className={`ui-preview__state ui-preview__state--${preview.tone}`}>
                  <span className="ui-preview__eyebrow">
                    {selectedObject
                      ? selectedObject.role ?? "Editing"
                      : preview.subtitle}
                  </span>
                  <span className="ui-preview__title">
                    {selectedObject
                      ? selectedObject.label
                      : isWidget
                        ? "Retention widget"
                        : preview.title}
                  </span>
                  <p className="ui-preview__body">
                    {selectedObject
                      ? `This is where the "${selectedObject.label}" ${isWidget ? "area" : "section"} renders on the ${audienceLabel} experience.`
                      : preview.body}
                  </p>
                  {audience !== "default" && (
                    <p className="ui-preview__audience">
                      <Badge variant="info">{audienceLabel} audience</Badge>
                    </p>
                  )}
                </div>
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
