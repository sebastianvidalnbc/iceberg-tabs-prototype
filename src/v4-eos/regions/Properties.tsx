import { useId, useMemo, useState } from "react";
import { Icon, type IconName } from "../ui-lib/Icon";
import { MSym } from "@/v4-eos/ui/msym";
import { Button } from "@/v4-eos/ui/button";
import { Badge } from "@/v4-eos/ui/badge";
import { Separator } from "@/v4-eos/ui/separator";
import { ScrollArea } from "@/v4-eos/ui/scroll-area";
import {
  TextField,
  TextAreaField,
  CheckboxField,
  SwitchField,
  SelectField,
  RadioField,
} from "@/v4-eos/ui/form-controls";
import {
  ObjectHeader,
  PropertyRow as PropRow,
  PropertyRows,
  PropertySection as PropSection,
} from "@/v4-eos/ui/property";
import {
  resolvePropertiesForVariant,
  resolveWidgetPropertiesForVariant,
  type AuthoringContext,
  type PropertyField,
  type PropertyGroup,
  type ObjectProperties,
  type CollectionProperties,
  type SectionMetadata,
  type NoticeProperties,
  type StructureNode,
  type StructureObjectType,
  type VariantWorkspace,
} from "../data";
import { allowedChildType, maxChildrenFor } from "../elements";
import { findNodeById } from "../structureOps";

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
  // The selected instance's authored VALUES (its `content`, the placeholder.content
  // analog). Field controls overlay these on the registry schema defaults, and
  // editing writes back via onEditField — which persists on the instance and
  // drives the live preview.
  content: Record<string, string>;
  // Labels of the selected object's required fields that are currently empty
  // (the invalidSections analog, scoped to this object). Marks them invalid.
  invalidFields: Set<string>;
  // The selected object's element type — drives the collection Add/Remove rules
  // (allowed child type + max children).
  selectedObjectType: StructureObjectType | null;
  onEditField: (nodeId: string, label: string, value: string) => void;
  // Container authoring: add a child of the given type, remove a child by id,
  // and reorder a child within its parent list (the add-plan/product actions).
  onAddChild: (parentId: string, childType: StructureObjectType) => void;
  onRemoveChild: (childId: string) => void;
  onReorderChild: (parentId: string, from: number, to: number) => void;
}

// A single property control. The row (PropertyRow) provides the label, so
// controls render label-less. Controls are CONTROLLED: `value` is the effective
// value (schema default with the author's edit layered on) and `onEdit` records
// a new edit, which flows to the live preview.
function PropertyControl({
  field,
  value,
  onEdit,
  id,
  describedBy,
  invalid,
}: {
  field: PropertyField;
  value: string;
  onEdit: (value: string) => void;
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}) {
  if (field.kind === "checkbox") {
    return (
      <CheckboxField
        checked={value === "true"}
        onCheckedChange={(v) => onEdit(v ? "true" : "false")}
      />
    );
  }
  if (field.kind === "switch") {
    return (
      <SwitchField
        checked={value === "true"}
        onCheckedChange={(v) => onEdit(v ? "true" : "false")}
      />
    );
  }
  if (field.kind === "asset") {
    return <AssetPicker value={value} />;
  }
  if (field.kind === "textarea") {
    return (
      <TextAreaField
        id={id}
        value={value}
        onChange={(e) => onEdit(e.target.value)}
        aria-describedby={describedBy}
        invalid={invalid}
      />
    );
  }
  if (field.kind === "select") {
    return (
      <SelectField
        id={id}
        value={value}
        onValueChange={onEdit}
        options={field.options ?? []}
        invalid={invalid}
      />
    );
  }
  if (field.kind === "radio") {
    return (
      <RadioField
        name={id}
        value={value}
        onValueChange={onEdit}
        options={field.options ?? []}
      />
    );
  }
  return (
    <TextField
      id={id}
      value={value}
      onChange={(e) => onEdit(e.target.value)}
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
    <div className="flex items-center gap-2 rounded-sm border border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-1.5">
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-sm border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] text-muted-foreground"
      >
        <Icon name="image" size={16} />
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
        {empty ? "No asset selected" : value}
      </span>
      <Button variant="ghost" size="sm" onClick={() => {}}>
        {empty ? "Choose…" : "Remove"}
      </Button>
    </div>
  );
}

// --- Inline template gallery (Build 4) --------------------------------------
// Grounded in real Iceberg: a Section's content is either built from Modules or
// filled by a published Widget (Section Options → Type: Modules | Widget). The
// gallery lets an author pick a template visually instead of deciphering a
// dropdown — the workshop's "see what a component looks like before adding it"
// ask. Prototype: selecting a card is a no-op that closes the gallery.
interface TemplateCard {
  id: string;
  name: string;
  description: string;
  icon: IconName;
}
interface TemplateGroup {
  label: string;
  cards: TemplateCard[];
}

const MODULE_TEMPLATES: TemplateGroup = {
  label: "Modules",
  cards: [
    { id: "hero", name: "Hero", description: "Title, description, image and CTA.", icon: "star" },
    { id: "carousel", name: "Carousel", description: "Recommendations row from a collection.", icon: "blocks" },
    { id: "faq", name: "FAQ", description: "Dynamic questions and answers.", icon: "help" },
    { id: "text", name: "Text block", description: "Rich copy with headings.", icon: "doc-text" },
  ],
};

// One selectable template card: thumbnail glyph + name + description. A real
// <button> so it is keyboard-focusable and gets the shared focus ring.
function TemplateCardButton({ card, onSelect }: { card: TemplateCard; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group grid grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-x-2 gap-y-0.5 rounded-sm border border-border bg-[var(--color-bg-surface)] p-2 text-left transition-colors hover:border-[var(--color-border-strong)] hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span
        aria-hidden
        className="row-span-2 grid size-9 place-items-center rounded-sm bg-[var(--color-bg-subtle)] text-muted-foreground"
      >
        <Icon name={card.icon} size={20} />
      </span>
      <span className="text-[13px] font-semibold text-foreground">{card.name}</span>
      <span className="text-[11px] leading-snug text-muted-foreground">
        {card.description}
      </span>
    </button>
  );
}

// The inline gallery panel. Expands in place under the Add affordance; groups
// cards by Modules vs Widget to mirror the real Section Options type choice.
function TemplateGallery({
  groups,
  onSelect,
  onCancel,
}: {
  groups: TemplateGroup[];
  onSelect: (card: TemplateCard) => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="group"
      aria-label="Choose a template"
      className="mt-2 flex flex-col gap-4 rounded-md border border-border bg-[var(--color-bg-subtle)] p-3"
    >
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {group.label}
          </span>
          <div className="grid grid-cols-2 gap-2 max-[520px]:grid-cols-1">
            {group.cards.map((card) => (
              <TemplateCardButton key={card.id} card={card} onSelect={() => onSelect(card)} />
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// One label/control row, delegating to the V2-local PropertyRow composition.
// Full-width controls (textarea/radio/asset) stack.
function PropertyFieldRow({
  field,
  value,
  invalid,
  onEdit,
}: {
  field: PropertyField;
  value: string;
  invalid: boolean;
  onEdit: (value: string) => void;
}) {
  const id = useId();
  const errId = invalid ? `${id}-err` : undefined;
  const helpId = field.helper ? `${id}-help` : undefined;
  const stacked =
    field.kind === "textarea" ||
    field.kind === "radio" ||
    field.kind === "asset";
  return (
    <PropRow
      label={field.label}
      htmlFor={id}
      required={field.required}
      stacked={stacked}
      help={
        invalid ? (
          <span id={errId} className="text-[var(--color-status-danger)]">
            {field.label} is required.
          </span>
        ) : field.helper ? (
          <span id={helpId}>{field.helper}</span>
        ) : undefined
      }
    >
      <PropertyControl
        field={field}
        value={value}
        onEdit={onEdit}
        id={id}
        describedBy={errId ?? helpId}
        invalid={invalid}
      />
    </PropRow>
  );
}

// The rows of a group. Each field's value is the schema default with the
// author's edit (if any) layered on; editing calls onEdit(label, value).
function GroupRows({
  group,
  overridesForNode,
  invalidFields,
  onEdit,
}: {
  group: PropertyGroup;
  overridesForNode: Record<string, string>;
  invalidFields: Set<string>;
  onEdit: (label: string, value: string) => void;
}) {
  return (
    <PropertyRows>
      {group.fields.map((field) => (
        <PropertyFieldRow
          key={field.label}
          field={field}
          value={overridesForNode[field.label] ?? field.value}
          invalid={invalidFields.has(field.label)}
          onEdit={(v) => onEdit(field.label, v)}
        />
      ))}
    </PropertyRows>
  );
}

// A titled group of rows (PRODUCT / CTA / LEGAL …). Headed groups collapse.
function GroupSection({
  group,
  expanded,
  onToggle,
  overridesForNode,
  invalidFields,
  onEdit,
}: {
  group: PropertyGroup;
  expanded: boolean;
  onToggle: () => void;
  overridesForNode: Record<string, string>;
  invalidFields: Set<string>;
  onEdit: (label: string, value: string) => void;
}) {
  return (
    <PropSection header={group.header} expanded={expanded} onToggle={onToggle}>
      <GroupRows
        group={group}
        overridesForNode={overridesForNode}
        invalidFields={invalidFields}
        onEdit={onEdit}
      />
    </PropSection>
  );
}

// --- Inline child collections (feature bullets) -----------------------------
// Real Iceberg renders a product's `productFeaturesList` (a `tabs` field) INLINE
// within the card's form, not as a separate destination. We keep the feature
// bullets as Structure nodes for tree navigation, but ALSO surface them here so
// a card's bullets (icon + text) are editable — with add/remove — right where
// the card is selected. Each row writes to its own feature node's content.

// Whether a product's child collection holds its feature bullets.
function isFeatureListNode(node: StructureNode): boolean {
  const l = node.label.toLowerCase();
  const noun = (node.itemNoun ?? "").toLowerCase();
  return (
    node.objectType === "product-features-list" ||
    noun.includes("feature") ||
    l.includes("feature") ||
    l.includes("product list")
  );
}

// Flatten a resolved fields object to its editable field list (groups or flat).
function flattenFields(data: ObjectProperties): PropertyField[] {
  if (data.groups) return data.groups.flatMap((g) => g.fields);
  return data.fields ?? [];
}

// One feature bullet: its own fields (icon + text) rendered inline, writing to
// this feature node, plus a Remove control.
function InlineFeatureItem({
  fields,
  overrides,
  onEdit,
  onRemove,
  removable,
}: {
  fields: PropertyField[];
  overrides: Record<string, string>;
  onEdit: (label: string, value: string) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  return (
    <div className="rounded-sm border border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-2.5">
      <PropertyRows>
        {fields.map((field) => (
          <PropertyFieldRow
            key={field.label}
            field={field}
            value={overrides[field.label] ?? field.value}
            invalid={false}
            onEdit={(v) => onEdit(field.label, v)}
          />
        ))}
      </PropertyRows>
      <div className="mt-2 flex justify-end">
        <Button
          variant="ghost"
          size="xs"
          disabled={!removable}
          title={removable ? "Remove feature" : "At least one feature required"}
          onClick={onRemove}
          className="text-muted-foreground hover:text-[var(--color-status-danger)]"
        >
          <MSym name="delete" size={15} />
          Remove
        </Button>
      </div>
    </div>
  );
}

// All feature-bullet collections under the selected product, as inline editors.
function InlineFeatureCollections({
  variant,
  resolve,
  overridesFor,
  productId,
  onEditField,
  onAddChild,
  onRemoveChild,
}: {
  variant: VariantWorkspace;
  resolve: (id: string) => ObjectProperties | null;
  overridesFor: (id: string) => Record<string, string>;
  productId: string;
  onEditField: (nodeId: string, label: string, value: string) => void;
  onAddChild: (parentId: string, childType: StructureObjectType) => void;
  onRemoveChild: (childId: string) => void;
}) {
  const product = findNodeById(variant.structure, productId);
  const lists = (product?.children ?? []).filter(isFeatureListNode);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  if (!lists.length) return null;

  return (
    <>
      {lists.map((list) => {
        const items = list.children ?? [];
        const noun = list.itemNoun ?? "Feature";
        const childType = allowedChildType(list.objectType);
        const max = list.maxChildren ?? maxChildrenFor(list.objectType);
        const atMax = max != null && items.length >= max;
        const open = !collapsed.has(list.id);
        return (
          <PropSection
            key={list.id}
            header={`${list.label} · ${items.length}${max != null ? ` / ${max}` : ""}`}
            expanded={open}
            onToggle={() =>
              setCollapsed((prev) => {
                const next = new Set(prev);
                next.has(list.id) ? next.delete(list.id) : next.add(list.id);
                return next;
              })
            }
          >
            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const resolved = resolve(item.id);
                return (
                  <InlineFeatureItem
                    key={item.id}
                    fields={resolved ? flattenFields(resolved) : []}
                    overrides={overridesFor(item.id)}
                    onEdit={(label, value) => onEditField(item.id, label, value)}
                    onRemove={() => onRemoveChild(item.id)}
                    removable={items.length > 1}
                  />
                );
              })}
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!childType || atMax}
                  onClick={() => childType && onAddChild(list.id, childType)}
                >
                  <Icon name="plus" size={16} />
                  Add {noun}
                </Button>
                {atMax && (
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    Maximum of {max} reached.
                  </span>
                )}
              </div>
            </div>
          </PropSection>
        );
      })}
    </>
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
  selectedObjectType,
  content,
  invalidFields,
  onEditField,
  onAddChild,
  onRemoveChild,
  onReorderChild,
}: PropertiesProps) {
  const experienceNoun = context === "widget" ? "widget config" : "variant";
  return (
    // Keep the shell grid contract (.ui-ws__region) + fixed width; internals are
    // shadcn/Tailwind. Dark panel surface.
    <aside
      aria-label="Properties"
      className="ui-ws__region w-[460px] max-w-full bg-[var(--color-bg-panel)] text-foreground max-[900px]:w-full"
    >
      <div className="flex shrink-0 items-center border-b border-border px-4 py-2">
        <span className="text-[13px] font-semibold text-foreground">
          Properties
        </span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-4">
          {variant && selectedStructureNodeId ? (
            <PropertiesBody
              context={context}
              variant={variant}
              nodeId={selectedStructureNodeId}
              objectType={selectedObjectType}
              overridesForNode={content}
              invalidFields={invalidFields}
              onEdit={(label, value) =>
                onEditField(selectedStructureNodeId, label, value)
              }
              onEditField={onEditField}
              onAddChild={onAddChild}
              onRemoveChild={onRemoveChild}
              onReorderChild={onReorderChild}
            />
          ) : (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {selectedRouteId
                ? `Select a ${experienceNoun}, then an object in its structure to edit its properties.`
                : "Select an object in the structure to edit its properties."}
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

// Renders the resolved Properties for the active experience's selected object.
// Switches on the resolved kind so every selectable node is meaningful. The
// resolver is chosen by context: Page uses the full Variant resolver, Widget
// uses the placeholder Widget-area resolver.
function PropertiesBody({
  context,
  variant,
  nodeId,
  objectType,
  overridesForNode,
  invalidFields,
  onEdit,
  onEditField,
  onAddChild,
  onRemoveChild,
  onReorderChild,
}: {
  context: AuthoringContext;
  variant: VariantWorkspace;
  nodeId: string;
  objectType: StructureObjectType | null;
  overridesForNode: Record<string, string>;
  invalidFields: Set<string>;
  onEdit: (label: string, value: string) => void;
  onEditField: (nodeId: string, label: string, value: string) => void;
  onAddChild: (parentId: string, childType: StructureObjectType) => void;
  onRemoveChild: (childId: string) => void;
  onReorderChild: (parentId: string, from: number, to: number) => void;
}) {
  const resolveNode = (id: string) =>
    context === "widget"
      ? resolveWidgetPropertiesForVariant(variant, id)
      : resolvePropertiesForVariant(variant, id);
  const resolved = resolveNode(nodeId);
  if (resolved.kind === "collection")
    return (
      <CollectionBody
        data={resolved.data}
        nodeId={nodeId}
        objectType={objectType}
        onAddChild={onAddChild}
        onRemoveChild={onRemoveChild}
        onReorderChild={onReorderChild}
      />
    );
  if (resolved.kind === "metadata") return <MetadataBody data={resolved.data} />;
  if (resolved.kind === "notice") return <NoticeBody data={resolved.data} />;
  // key={nodeId} remounts FieldsBody per selected object so its per-group
  // expand/collapse memory resets to the default (all open) on each new object.
  // A product card also gets its feature bullets inline (the real `tabs` field
  // renders inside the card's form), editable + add/remove.
  return (
    <>
      <FieldsBody
        key={nodeId}
        data={resolved.data}
        overridesForNode={overridesForNode}
        invalidFields={invalidFields}
        onEdit={onEdit}
      />
      <InlineFeatureCollections
        variant={variant}
        productId={nodeId}
        resolve={(id) => {
          const r = resolveNode(id);
          return r.kind === "fields" ? r.data : null;
        }}
        overridesFor={(id) => findNodeById(variant.structure, id)?.content ?? {}}
        onEditField={onEditField}
        onAddChild={onAddChild}
        onRemoveChild={onRemoveChild}
      />
    </>
  );
}

// Editable object: eyebrow + name + grouped property rows. Accepts either a
// flat `fields` list or `groups` (which take precedence). Headed groups are
// collapsible and start expanded; an Expand all / Collapse all control appears
// only when there is more than one headed group.
function FieldsBody({
  data,
  overridesForNode,
  invalidFields,
  onEdit,
}: {
  data: ObjectProperties;
  overridesForNode: Record<string, string>;
  invalidFields: Set<string>;
  onEdit: (label: string, value: string) => void;
}) {
  const { eyebrow, name } = data;
  const groups: PropertyGroup[] = useMemo(
    () => data.groups ?? [{ fields: data.fields ?? [] }],
    [data.groups, data.fields]
  );
  const headers = useMemo(
    () => groups.map((g) => g.header).filter((h): h is string => !!h),
    [groups]
  );
  // Collapsed set (empty ⇒ all expanded). Only headed groups are collapsible.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const toggle = (header: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(header) ? next.delete(header) : next.add(header);
      return next;
    });
  const allCollapsed = headers.length > 0 && collapsed.size === headers.length;
  const collapseAll = () => setCollapsed(new Set(headers));
  const expandAll = () => setCollapsed(new Set());

  return (
    <>
      <ObjectHeader eyebrow={eyebrow} name={name}>
        {headers.length > 1 && (
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto self-center text-[12px] text-muted-foreground hover:text-foreground"
            onClick={allCollapsed ? expandAll : collapseAll}
          >
            {allCollapsed ? "Expand all" : "Collapse all"}
          </Button>
        )}
      </ObjectHeader>
      <div className="flex flex-col gap-1">
        {groups.map((group, i) => (
          <GroupSection
            key={group.header ?? i}
            group={group}
            expanded={group.header ? !collapsed.has(group.header) : true}
            onToggle={group.header ? () => toggle(group.header!) : () => {}}
            overridesForNode={overridesForNode}
            invalidFields={invalidFields}
            onEdit={onEdit}
          />
        ))}
      </div>
    </>
  );
}

// Structural/collection object: TYPE eyebrow, "N items · max M" count, and an
// EDITABLE item list. Items come from actual Structure children; "Add {itemNoun}"
// instantiates a real child (up to the container's max), each row can be removed
// (down to the min of 1 for capped containers) and reordered. This is the
// add/remove/reorder-plan capability — the tabs minSize/maxSize analog.
function CollectionBody({
  data,
  nodeId,
  objectType,
  onAddChild,
  onRemoveChild,
  onReorderChild,
}: {
  data: CollectionProperties;
  nodeId: string;
  objectType: StructureObjectType | null;
  onAddChild: (parentId: string, childType: StructureObjectType) => void;
  onRemoveChild: (childId: string) => void;
  onReorderChild: (parentId: string, from: number, to: number) => void;
}) {
  const { eyebrow, name, itemNoun, items } = data;
  const count = items.length;
  const childType = allowedChildType(objectType ?? undefined);
  const max = data.max ?? maxChildrenFor(objectType ?? undefined);
  const atMax = max != null && count >= max;
  // Capped containers (a defined max) imply a minSize of 1 — keep at least one.
  const atMin = max != null && count <= 1;
  const canAdd = !!childType && !atMax;
  const nounLower = itemNoun.toLowerCase();

  return (
    <>
      <ObjectHeader eyebrow={eyebrow} name={name ?? eyebrow}>
        <span className="ml-auto self-center text-[12px] text-muted-foreground">
          {count}
          {max != null ? ` / ${max}` : ""} {count === 1 ? nounLower : `${nounLower}s`}
        </span>
      </ObjectHeader>

      {count > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="group/item flex items-center gap-1 rounded-sm border border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] py-1 pl-2.5 pr-1"
            >
              <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                {item.label}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/item:opacity-100 focus-within:opacity-100">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title={`Move ${nounLower} up`}
                  disabled={i === 0}
                  onClick={() => onReorderChild(nodeId, i, i - 1)}
                >
                  <MSym name="keyboard_arrow_up" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title={`Move ${nounLower} down`}
                  disabled={i === count - 1}
                  onClick={() => onReorderChild(nodeId, i, i + 1)}
                >
                  <MSym name="keyboard_arrow_down" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title={atMin ? `At least one ${nounLower} required` : `Remove ${nounLower}`}
                  disabled={atMin}
                  onClick={() => onRemoveChild(item.id)}
                  className="text-muted-foreground hover:text-[var(--color-status-danger)]"
                >
                  <MSym name="delete" size={15} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!canAdd}
          onClick={() => childType && onAddChild(nodeId, childType)}
        >
          <Icon name="plus" size={16} />
          Add {itemNoun}
        </Button>
        {atMax && (
          <span className="text-[11px] text-muted-foreground">
            Maximum of {max} reached.
          </span>
        )}
      </div>
    </>
  );
}

// Page section: PAGE SECTION eyebrow + name, status badge, Section ID, a Design
// mode radio, an Intelligent-authoring affordance, and no-op Duplicate / Delete.
function MetadataBody({ data }: { data: SectionMetadata }) {
  const { eyebrow, name, role, status, sectionId, note, design, designOptions } = data;
  const badgeVariant =
    status === "published" ? "success" : status === "in-review" ? "warning" : "secondary";
  return (
    <>
      <ObjectHeader eyebrow={eyebrow} name={name}>
        {status && <Badge variant={badgeVariant}>{status}</Badge>}
      </ObjectHeader>
      <div className="flex flex-col gap-4">
        <PropertyRows>
          {role && (
            <PropRow label="Type / Role">
              <Badge variant="info">{role}</Badge>
            </PropRow>
          )}
          <PropRow label="Section ID">
            <code className="rounded-sm bg-[var(--color-bg-subtle)] px-1.5 py-0.5 font-mono text-[12px] text-muted-foreground">
              {sectionId}
            </code>
          </PropRow>
          {designOptions && (
            <PropRow label="Design" stacked>
              <RadioField
                name={`design-${sectionId}`}
                value={design ?? designOptions[0]}
                options={designOptions}
              />
            </PropRow>
          )}
        </PropertyRows>
        {data.intelligentAffordance && (
          <section className="rounded-sm border border-border bg-[var(--color-bg-subtle)] p-3">
            <p className="text-[13px] font-semibold text-foreground">
              Intelligent authoring
            </p>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
              Variations are generated per audience. Manage variant names in
              Section Options.
            </p>
          </section>
        )}
      </div>
      {note && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{note}</p>
      )}
      <Separator />
      <div className="flex flex-wrap gap-2">
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
// "Add module" opens the inline template gallery so the author picks a module
// visually instead of adding a blank one.
function NoticeBody({ data }: { data: NoticeProperties }) {
  const { eyebrow, name, message, detail } = data;
  const [galleryOpen, setGalleryOpen] = useState(false);
  return (
    <>
      <ObjectHeader eyebrow={eyebrow} name={name} />
      <section className="rounded-sm border border-border bg-[var(--color-bg-subtle)] p-3">
        <p className="text-[13px] font-semibold text-foreground">{message}</p>
        {detail && (
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            {detail}
          </p>
        )}
      </section>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setGalleryOpen((v) => !v)}>
          <Icon name="plus" size={16} />
          Add module
        </Button>
      </div>
      {galleryOpen && (
        <TemplateGallery
          groups={[MODULE_TEMPLATES]}
          onSelect={() => setGalleryOpen(false)}
          onCancel={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
}
