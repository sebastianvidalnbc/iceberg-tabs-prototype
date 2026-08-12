import { useStore } from "../store";
import { Checkbox, Field, RadioGroup, Select } from "./Field";
import { Button } from "../ui/Button";

// The second primary top-level area. Lightweight Iceberg Section Options fields;
// the Populate buttons are representational (non-functional) for the prototype.
const DESIGNS = ["Custom", "Legacy layout", "Intelligent authoring"];
const VARIANT_DESIGNS = ["Plan", "Promo", "Bundle"];
const BACKGROUNDS = ["Dark", "Light", "Transparent"];

export function SectionOptionsForm() {
  const { state, dispatch } = useStore();
  const o = state.sectionOptions;
  const patch = (p: Record<string, unknown>) =>
    dispatch({ type: "updateSectionOptions", patch: p });

  return (
    <div className="options-form">
      <RadioGroup
        label="Design"
        value={o.design}
        options={DESIGNS}
        onChange={(v) => patch({ design: v })}
      />
      <Select
        label="Variant / design dropdown"
        value={o.variantDesign}
        options={VARIANT_DESIGNS}
        onChange={(v) => patch({ variantDesign: v })}
      />
      <Field label="Label" value={o.label} onChange={(v) => patch({ label: v })} />
      <Field label="Type" value={o.type} onChange={(v) => patch({ type: v })} />

      <div className="subhead">Populate Section with Data</div>
      <div className="options-actions">
        <Button variant="secondary" size="sm">
          Populate and Retain Existing
        </Button>
        <Button variant="secondary" size="sm">
          Populate and Replace
        </Button>
      </div>

      <Select
        label="Select Background"
        value={o.background}
        options={BACKGROUNDS}
        onChange={(v) => patch({ background: v })}
      />
      <Checkbox
        label="Embed Headers"
        checked={o.embedHeaders}
        onChange={(v) => patch({ embedHeaders: v })}
      />
      <Checkbox
        label="Toggle to allow for mobile overflow on right-hand side (for tabs with long text)"
        checked={o.mobileOverflow}
        onChange={(v) => patch({ mobileOverflow: v })}
      />
    </div>
  );
}
