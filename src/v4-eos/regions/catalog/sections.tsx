import { useState } from "react";
import { MSym } from "@/v4-eos/ui/msym";
import { Button } from "@/v4-eos/ui/button";
import { Badge } from "@/v4-eos/ui/badge";
import { Separator } from "@/v4-eos/ui/separator";
import {
  TextField,
  TextAreaField,
  CheckboxField,
  SwitchField,
  SelectField,
  RadioField,
} from "@/v4-eos/ui/form-controls";
import { ObjectHeader, PropertyRow, PropertyRows } from "@/v4-eos/ui/property";
import { Panel, PanelHeader } from "@/v4-eos/ui/panel";
import { Section, Specimen, Swatch } from "./layout";

// --- Foundations: color roles pulled straight from the Iceberg tokens the
// shadcn layer aliases (§ theme.css). Renders live so it always reflects dark. ---
export function FoundationsSection() {
  return (
    <Section
      id="foundations"
      title="Foundations"
      lead="Color roles are aliased from the Iceberg semantic tokens (tokens.css). The shadcn layer never introduces a second palette — dark comes from [data-theme=\u201cdark\u201d]."
    >
      <Specimen label="Surfaces">
        <Swatch name="Canvas" brand="Onyx" varName="--color-bg-canvas" />
        <Swatch name="Panel" varName="--color-bg-panel" />
        <Swatch name="Surface" varName="--color-bg-surface" />
        <Swatch name="Subtle" brand="Deep Onyx" varName="--color-bg-subtle" />
        <Swatch name="Control" varName="--color-bg-control" />
      </Specimen>
      <Specimen label="Text">
        <Swatch name="Primary" brand="Alabaster Grey" varName="--color-text-primary" />
        <Swatch name="Secondary" brand="Silver" varName="--color-text-secondary" />
        <Swatch name="Muted" brand="Grey Olive" varName="--color-text-muted" />
      </Specimen>
      <Specimen label="Accents & status">
        <Swatch name="Primary" varName="--color-action-primary" />
        <Swatch name="Success" varName="--color-status-success" />
        <Swatch name="Warning" varName="--color-status-warning" />
        <Swatch name="Info" varName="--color-status-info" />
        <Swatch name="Danger" varName="--color-status-danger" />
      </Specimen>
    </Section>
  );
}

// --- Actions: every Button variant + size, plus icon buttons. ---
export function ActionsSection() {
  return (
    <Section
      id="actions"
      title="Actions"
      lead="shadcn Button, themed for Iceberg density. Restrained radii; consistent height, focus ring, and icon sizing."
    >
      <Specimen label="Variants">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </Specimen>
      <Specimen label="Sizes">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </Specimen>
      <Specimen label="With icons & icon-only">
        <Button size="sm">
          <MSym name="add" size={16} />
          Add item
        </Button>
        <Button variant="destructive" size="sm">
          <MSym name="delete" size={16} />
          Delete
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="More">
          <MSym name="more_horiz" size={16} />
        </Button>
        <Button size="sm" disabled>
          Disabled
        </Button>
      </Specimen>
    </Section>
  );
}

// --- Status: Badge defaults + Iceberg status variants. ---
export function StatusSection() {
  return (
    <Section
      id="status"
      title="Status & badges"
      lead="Badge with shadcn defaults plus Iceberg status variants (success / warning / info) mapped to the status tokens. Status is never color-only \u2014 always paired with a label."
    >
      <Specimen label="Default variants">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </Specimen>
      <Specimen label="Iceberg status">
        <Badge variant="success">Published</Badge>
        <Badge variant="warning">In review</Badge>
        <Badge variant="info">Page section</Badge>
      </Specimen>
    </Section>
  );
}

// --- Form controls: the adapters the Properties panel actually uses. Live,
// stateful demos so focus/checked/switch states are inspectable. ---
export function FormSection() {
  const [text, setText] = useState("Premium card test");
  const [area, setArea] = useState("Rich copy with headings.");
  const [checked, setChecked] = useState(true);
  const [on, setOn] = useState(true);
  const [sel, setSel] = useState("Grid");
  const [design, setDesign] = useState("Comfortable");
  return (
    <Section
      id="form-controls"
      title="Form controls"
      lead="The V2 form-control adapters (TextField, TextAreaField, Select, Checkbox, Switch, Radio) as consumed by the Properties panel \u2014 28px density, dark control fills."
    >
      <Specimen label="Inputs" className="flex-col items-stretch gap-4">
        <div className="max-w-sm">
          <TextField value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="max-w-sm">
          <TextAreaField value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        <div className="max-w-xs">
          <SelectField
            value={sel}
            onValueChange={setSel}
            options={["Grid", "Carousel", "List", "Hero"]}
          />
        </div>
      </Specimen>
      <Specimen label="Toggles & choice">
        <label className="flex items-center gap-2 text-[13px] text-foreground">
          <CheckboxField checked={checked} onCheckedChange={setChecked} />
          Enabled
        </label>
        <label className="flex items-center gap-2 text-[13px] text-foreground">
          <SwitchField checked={on} onCheckedChange={setOn} />
          Live
        </label>
        <RadioField
          name="ds-density"
          value={design}
          onValueChange={setDesign}
          options={["Compact", "Comfortable"]}
        />
      </Specimen>
    </Section>
  );
}

// --- Patterns: the composed pieces that give V2 its authoring feel \u2014 panel
// chrome and the Properties label/control rows. Shows the primitives working
// together, not just in isolation. ---
export function PatternsSection() {
  return (
    <Section
      id="patterns"
      title="Patterns"
      lead="Composed pieces used across the editor: panel chrome (eyebrow + title + actions) and the Properties label/control rows."
    >
      <Specimen label="Panel header" className="flex-col items-stretch">
        <Panel className="w-full max-w-md overflow-hidden rounded-md border border-border">
          <PanelHeader
            eyebrow="Properties"
            title="Hero"
            sub="Page section"
            actions={<Badge variant="success">Published</Badge>}
          />
          <div className="p-4">
            <ObjectHeader eyebrow="Module" name="Hero" />
          </div>
        </Panel>
      </Specimen>
      <Specimen label="Property rows" className="flex-col items-stretch">
        <div className="w-full max-w-md rounded-md border border-border bg-[var(--color-bg-panel)] p-4">
          <PropertyRows>
            <PropertyRow label="Title">
              <TextField defaultValue="What is Peacock" />
            </PropertyRow>
            <PropertyRow label="Layout">
              <SelectField value="Grid" options={["Grid", "Carousel", "List"]} />
            </PropertyRow>
            <PropertyRow label="Enabled">
              <SwitchField checked onCheckedChange={() => {}} />
            </PropertyRow>
            <PropertyRow label="Section ID">
              <code className="rounded-sm bg-[var(--color-bg-subtle)] px-1.5 py-0.5 font-mono text-[12px] text-muted-foreground">
                sec-hero-01
              </code>
            </PropertyRow>
          </PropertyRows>
          <Separator className="my-4" />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              Duplicate
            </Button>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </div>
      </Specimen>
    </Section>
  );
}
