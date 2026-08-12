import { useState } from "react";
import { TextInput, SearchInput } from "../TextInput";
import { Textarea } from "../Textarea";
import { Select } from "../Select";
import { Checkbox } from "../Checkbox";
import { RadioGroup } from "../Radio";
import { Switch } from "../Switch";
import { DateInput } from "../DateInput";
import { Field } from "../Field";

export function FormSection() {
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [sel, setSel] = useState("plan");
  const [check, setCheck] = useState(true);
  const [radio, setRadio] = useState("Custom");
  const [on, setOn] = useState(false);
  const [date, setDate] = useState("");
  const [email, setEmail] = useState("");

  return (
    <section id="form-controls">
      <h2>Form Controls</h2>
      <p className="ui-ds__lead">
        All inputs share the .ui-control base (same height, border, radius, focus). Field wires
        label, helper, error, htmlFor, aria-describedby and aria-invalid.
      </p>

      <div className="ui-ds__stack">
        <Field label="Full name" helper="As it appears on the account.">
          {({ id, describedBy }) => (
            <TextInput id={id} value={text} onChange={setText} aria-describedby={describedBy} placeholder="Jane Doe" />
          )}
        </Field>

        <Field label="Email" error={email && !email.includes("@") ? "Enter a valid email." : undefined}>
          {({ id, describedBy, invalid }) => (
            <TextInput id={id} value={email} onChange={setEmail} invalid={invalid} aria-describedby={describedBy} placeholder="you@example.com" />
          )}
        </Field>

        <label className="ui-field">
          <span className="ui-field__label">Search</span>
          <SearchInput value={search} onChange={setSearch} onClear={() => setSearch("")} placeholder="Search sections" />
        </label>

        <Field label="Description">
          {({ id }) => <Textarea id={id} value={area} onChange={setArea} placeholder="Add a description" />}
        </Field>

        <Field label="Variant">
          {({ id }) => (
            <Select
              id={id}
              value={sel}
              onChange={setSel}
              options={[
                { label: "Plan", value: "plan" },
                { label: "Promo", value: "promo" },
                { label: "Bundle", value: "bundle" },
              ]}
            />
          )}
        </Field>

        <Field label="Publish date">
          {({ id }) => <DateInput id={id} value={date} onChange={setDate} />}
        </Field>

        <RadioGroup name="ds-design" legend="Design" value={radio} onChange={setRadio} options={["Custom", "Legacy layout", "Intelligent authoring"]} />

        <Checkbox label="Embed headers" checked={check} onChange={setCheck} />
        <Switch label="Enable mobile overflow" checked={on} onChange={setOn} />
      </div>
    </section>
  );
}
