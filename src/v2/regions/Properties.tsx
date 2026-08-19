import { useId } from "react";
import type { ReactNode } from "react";
import { TextInput } from "../../ui/TextInput";
import { Textarea } from "../../ui/Textarea";
import { Checkbox } from "../../ui/Checkbox";
import { Switch } from "../../ui/Switch";
import { Select } from "../../ui/Select";
import { RadioGroup } from "../../ui/Radio";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import {
  resolvePropertiesFor,
  resolveWidgetPropertiesFor,
  type AuthoringContext,
  type PropertyField,
  type PropertyGroup,
  type ObjectProperties,
  type CollectionProperties,
  type SectionMetadata,
  type NoticeProperties,
  type VariantWorkspace,
} from "../data";

interface PropertiesProps {
  // The active authoring context; selects which Properties resolver is used.
  context: AuthoringContext;
  // The active experience: Variant (Page) or Widget config (Widget). Null when
  // a route \u2014 not an experience \u2014 is selected.
  variant: VariantWorkspace | null;
  // The selected route id (used only for the empty-state message).
  selectedRouteId: string | null;
  // The selected STRUCTURE object id within the active experience.
  selectedStructureNodeId: string | null;
}

// A single property control. The row (PropertyRow) provides the label, so
// controls render label-less. Static first pass — values are display-only, so
// onChange is a no-op.
function PropertyControl({
  field,
  id,
  describedBy,
  invalid,
}: {
  field: PropertyField;
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}) {
  if (field.kind === "checkbox") {
    return <Checkbox checked={field.value === "true"} onChange={() => {}} />;
  }
  if (field.kind === "switch") {
    return <Switch checked={field.value === "true"} onChange={() => {}} />;
  }
  if (field.kind === "asset") {
    return <AssetPicker value={field.value} />;
  }
  if (field.kind === "textarea") {
    return (
      <Textarea
        id={id}
        value={field.value}
        onChange={() => {}}
        aria-describedby={describedBy}
        invalid={invalid}
      />
    );
  }
  if (field.kind === "select") {
    return (
      <Select
        id={id}
        value={field.value}
        onChange={() => {}}
        options={field.options ?? []}
        aria-describedby={describedBy}
        invalid={invalid}
      />
    );
  }
  if (field.kind === "radio") {
    return (
      <RadioGroup
        name={id}
        value={field.value}
        onChange={() => {}}
        options={field.options ?? []}
      />
    );
  }
  return (
    <TextInput
      id={id}
      value={field.value}
      onChange={() => {}}
      aria-describedby={describedBy}
      invalid={invalid}
    />
  );
}

// --- V2-local Properties compositions ---------------------------------------
// Dense two-column layout: a fixed label column and a control column. Kept
// local to V2 for the prototype (promote to src/ui later if reused).

// Icon/asset picker: a small preview swatch, the asset name, and a no-op
// Remove. When empty, shows a "Choose…" affordance.
function AssetPicker({ value }: { value: string }) {
  const empty = value.trim() === "";
  return (
    <div className="ui-ws-props__asset">
      <span className="ui-ws-props__asset-preview" aria-hidden="true" />
      <span className="ui-ws-props__asset-name">
        {empty ? "No asset selected" : value}
      </span>
      <Button variant="tertiary" size="sm" onClick={() => {}}>
        {empty ? "Choose…" : "Remove"}
      </Button>
    </div>
  );
}

// One label/control row. Full-width controls (textarea/radio/asset) drop the
// label column and stack, matching real Iceberg's denser property forms.
function PropertyRow({ field }: { field: PropertyField }) {
  const id = useId();
  const helpId = field.helper ? `${id}-help` : undefined;
  const stacked =
    field.kind === "textarea" ||
    field.kind === "radio" ||
    field.kind === "asset";
  return (
    <div
      className={
        stacked ? "ui-ws-props__row ui-ws-props__row--stacked" : "ui-ws-props__row"
      }
    >
      <label className="ui-ws-props__row-label" htmlFor={id}>
        {field.label}
        {field.required && (
          <span className="ui-field__req" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <div className="ui-ws-props__row-control">
        <PropertyControl
          field={field}
          id={id}
          describedBy={helpId}
          invalid={false}
        />
        {field.helper && (
          <p id={helpId} className="ui-ws-props__row-help">
            {field.helper}
          </p>
        )}
      </div>
    </div>
  );
}

// A titled group of rows (PRODUCT / CTA / LEGAL, LAYOUT, …). The header is
// omitted for anonymous groups so a single ungrouped list stays flush.
function PropertySection({ group }: { group: PropertyGroup }) {
  return (
    <section className="ui-ws-props__group">
      {group.header && (
        <h3 className="ui-ws-props__group-header">{group.header}</h3>
      )}
      <div className="ui-ws-props__rows">
        {group.fields.map((field) => (
          <PropertyRow key={field.label} field={field} />
        ))}
      </div>
    </section>
  );
}

// Object header (eyebrow + name), shared by every body renderer.
function ObjectHeader({
  eyebrow,
  name,
  children,
}: {
  eyebrow: string;
  name: string;
  children?: ReactNode;
}) {
  return (
    <div className="ui-ws-props__object">
      <span className="ui-ws-props__eyebrow">{eyebrow}</span>
      <span className="ui-ws-props__name">{name}</span>
      {children}
    </div>
  );
}

// Fixed-width right panel for the SELECTED object's properties. This is where
// the forms that V1 showed inline now live. Scrolls internally. Always belongs
// to the active experience; shows a contextual empty state when a route (not an
// experience) is selected or when no Structure object is active.
export function Properties({
  context,
  variant,
  selectedRouteId,
  selectedStructureNodeId,
}: PropertiesProps) {
  const experienceNoun = context === "widget" ? "widget config" : "variant";
  return (
    <aside className="ui-ws__region ui-ws-props" aria-label="Properties">
      <div className="ui-ws-head">
        <span className="ui-ws-head__title">Properties</span>
      </div>
      <div className="ui-ws-props__scroll">
        {variant && selectedStructureNodeId ? (
          <PropertiesBody
            context={context}
            variantId={variant.id}
            nodeId={selectedStructureNodeId}
          />
        ) : (
          <p className="ui-ws-props__empty">
            {selectedRouteId
              ? `Select a ${experienceNoun}, then an object in its structure to edit its properties.`
              : "Select an object in the structure to edit its properties."}
          </p>
        )}
      </div>
    </aside>
  );
}

// Renders the resolved Properties for the active experience's selected object.
// Switches on the resolved kind so every selectable node is meaningful. The
// resolver is chosen by context: Page uses the full Variant resolver, Widget
// uses the placeholder Widget-area resolver.
function PropertiesBody({
  context,
  variantId,
  nodeId,
}: {
  context: AuthoringContext;
  variantId: string;
  nodeId: string;
}) {
  const resolved =
    context === "widget"
      ? resolveWidgetPropertiesFor(variantId, nodeId)
      : resolvePropertiesFor(variantId, nodeId);
  if (resolved.kind === "collection") return <CollectionBody data={resolved.data} />;
  if (resolved.kind === "metadata") return <MetadataBody data={resolved.data} />;
  if (resolved.kind === "notice") return <NoticeBody data={resolved.data} />;
  return <FieldsBody data={resolved.data} />;
}

// Editable object: eyebrow + name + grouped property rows. Accepts either a
// flat `fields` list or `groups` (which take precedence).
function FieldsBody({ data }: { data: ObjectProperties }) {
  const { eyebrow, name } = data;
  const groups: PropertyGroup[] = data.groups ?? [
    { fields: data.fields ?? [] },
  ];
  return (
    <>
      <ObjectHeader eyebrow={eyebrow} name={name} />
      <div className="ui-ws-props__groups">
        {groups.map((group, i) => (
          <PropertySection key={group.header ?? i} group={group} />
        ))}
      </div>
    </>
  );
}

// Structural/collection object: TYPE eyebrow, "N items" count, no-op add,
// derived read-only item list, no-op paste. Items come from actual children.
function CollectionBody({ data }: { data: CollectionProperties }) {
  const { eyebrow, name, itemNoun, items } = data;
  const count = items.length;
  return (
    <>
      <ObjectHeader eyebrow={eyebrow} name={name ?? eyebrow} />
      <p className="ui-ws-props__count">
        {count} {count === 1 ? "item" : "items"}
      </p>
      <div className="ui-ws-props__actions">
        <Button variant="secondary" size="sm" leadingIcon="plus" onClick={() => {}}>
          Add {itemNoun}
        </Button>
      </div>
      {count > 0 && (
        <ul className="ui-ws-props__items">
          {items.map((item) => (
            <li key={item.id} className="ui-ws-props__item">
              {item.label}
            </li>
          ))}
        </ul>
      )}
      <div className="ui-ws-props__actions">
        <Button variant="tertiary" size="sm" onClick={() => {}}>
          Paste {itemNoun}
        </Button>
      </div>
    </>
  );
}

// Page section: PAGE SECTION eyebrow + name, status badge, Section ID, a Design
// mode radio, an Intelligent-authoring affordance, and no-op Duplicate / Delete.
function MetadataBody({ data }: { data: SectionMetadata }) {
  const { eyebrow, name, role, status, sectionId, note, design, designOptions } = data;
  const badgeVariant =
    status === "published" ? "success" : status === "in-review" ? "warning" : "default";
  return (
    <>
      <ObjectHeader eyebrow={eyebrow} name={name}>
        {status && <Badge variant={badgeVariant}>{status}</Badge>}
      </ObjectHeader>
      <div className="ui-ws-props__groups">
        <section className="ui-ws-props__group">
          <div className="ui-ws-props__rows">
            {role && (
              <div className="ui-ws-props__row">
                <span className="ui-ws-props__row-label">Type / Role</span>
                <div className="ui-ws-props__row-control">
                  <Badge variant="info">{role}</Badge>
                </div>
              </div>
            )}
            <div className="ui-ws-props__row">
              <span className="ui-ws-props__row-label">Section ID</span>
              <div className="ui-ws-props__row-control">
                <code className="ui-ws-props__code">{sectionId}</code>
              </div>
            </div>
            {designOptions && (
              <div className="ui-ws-props__row ui-ws-props__row--stacked">
                <span className="ui-ws-props__row-label">Design</span>
                <div className="ui-ws-props__row-control">
                  <RadioGroup
                    name={`design-${sectionId}`}
                    value={design ?? designOptions[0]}
                    onChange={() => {}}
                    options={designOptions}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
        {data.intelligentAffordance && (
          <section className="ui-ws-props__notice">
            <p className="ui-ws-props__notice-title">Intelligent authoring</p>
            <p className="ui-ws-props__notice-detail">
              Variations are generated per audience. Manage variant names in
              Section Options.
            </p>
          </section>
        )}
      </div>
      {note && <p className="ui-ws-props__note">{note}</p>}
      <div className="ui-ws-props__actions">
        <Button variant="secondary" size="sm" onClick={() => {}}>
          Duplicate
        </Button>
        <Button variant="destructive" size="sm" onClick={() => {}}>
          Delete
        </Button>
      </div>
    </>
  );
}

// Deliberate "no configured content" state (e.g. an empty Predecision).
function NoticeBody({ data }: { data: NoticeProperties }) {
  const { eyebrow, name, message, detail } = data;
  return (
    <>
      <ObjectHeader eyebrow={eyebrow} name={name} />
      <section className="ui-ws-props__notice">
        <p className="ui-ws-props__notice-title">{message}</p>
        {detail && <p className="ui-ws-props__notice-detail">{detail}</p>}
      </section>
      <div className="ui-ws-props__actions">
        <Button variant="secondary" size="sm" leadingIcon="plus" onClick={() => {}}>
          Add module
        </Button>
      </div>
    </>
  );
}
