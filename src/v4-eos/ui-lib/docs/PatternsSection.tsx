import { useState } from "react";
import { Field, FieldGroup } from "../Field";
import { TextInput } from "../TextInput";
import { Select } from "../Select";
import { Button, IconButton } from "../Button";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { CollectionHeader } from "../Collection";
import { TreeRow } from "../TreeRow";

// Composed examples assembled purely from ui components (no bespoke CSS).
export function PatternsSection() {
  const [name, setName] = useState("");
  const [type, setType] = useState("plan");
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const noop = () => {};

  return (
    <section id="patterns">
      <h2>Patterns</h2>
      <p className="ui-ds__lead">Common compositions built from the primitives above.</p>

      <h3>Field group form</h3>
      <div className="ui-ds__card" style={{ maxWidth: 480 }}>
        <FieldGroup legend="New tab">
          <Field label="Tab name" required>
            {({ id, invalid }) => <TextInput id={id} value={name} onChange={setName} invalid={invalid} placeholder="e.g. Enterprise" />}
          </Field>
          <Field label="Type">
            {({ id }) => (
              <Select id={id} value={type} onChange={setType} options={[
                { label: "Plan", value: "plan" },
                { label: "Promo", value: "promo" },
              ]} />
            )}
          </Field>
        </FieldGroup>
        <div className="ui-ds__row" style={{ marginTop: 0 }}>
          <Button variant="primary" size="sm" onClick={() => setSaved(true)}>Save</Button>
          <Button variant="tertiary" size="sm" onClick={() => setName("")}>Reset</Button>
          {saved && <span className="ui-swatch__value">Saved “{name || "Untitled"}”.</span>}
        </div>
      </div>

      <h3>Nested collection</h3>
      <div className="ui-ds__card">
        <CollectionHeader title="Pricing tabs" count={2} onAdd={noop} />
        <div role="tree" aria-label="Pricing tabs">
          <TreeRow level={0} label="Monthly" hasChildren expanded dragHandleProps={{}} onOverflow={noop} />
          <TreeRow level={1} label="Starter" status={{ status: "success", label: "Published" }} dragHandleProps={{}} onOverflow={noop} />
          <TreeRow level={1} label="Pro" status={{ status: "warning", label: "In review" }} dragHandleProps={{}} onOverflow={noop} />
          <TreeRow level={0} label="Annual" hasChildren expanded dragHandleProps={{}} onOverflow={noop} />
          <TreeRow level={1} label="Starter" dragHandleProps={{}} onOverflow={noop} />
        </div>
      </div>

      <h3>Toolbar</h3>
      <div className="ui-ds__row ui-ds__card" style={{ display: "flex" }}>
        <Button variant="tertiary" size="sm" leadingIcon="plus">Add</Button>
        <Button variant="tertiary" size="sm" leadingIcon="sparkles">Duplicate</Button>
        <Button variant="tertiary" size="sm" leadingIcon="download">Export</Button>
        <IconButton icon="dots" size="sm" aria-label="More" />
      </div>

      <h3>Confirmation flow</h3>
      <Button variant="destructive" size="sm" onClick={() => setConfirm(true)}>Delete page</Button>
      {confirm && (
        <ConfirmationDialog
          title="Delete this page?"
          description="All sections and tabs on this page will be removed."
          confirmLabel="Delete page"
          destructive
          onConfirm={() => setConfirm(false)}
          onCancel={() => setConfirm(false)}
        />
      )}
    </section>
  );
}
