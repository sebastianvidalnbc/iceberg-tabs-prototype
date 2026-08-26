import { useId, useMemo, useState } from "react";
import { Plus, Star, Blocks, HelpCircle, FileText, Box } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/v2/ui/button";
import { Badge } from "@/v2/ui/badge";
import { Separator } from "@/v2/ui/separator";
import { ScrollArea } from "@/v2/ui/scroll-area";
import {
  TextField,
  TextAreaField,
  CheckboxField,
  SwitchField,
  SelectField,
  RadioField,
} from "@/v2/ui/form-controls";
import {
  ObjectHeader,
  PropertyRow as PropRow,
  PropertyRows,
  PropertySection as PropSection,
} from "@/v2/ui/property";
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
    return <CheckboxField checked={field.value === "true"} />;
  }
  if (field.kind === "switch") {
    return <SwitchField checked={field.value === "true"} />;
  }
  if (field.kind === "asset") {
    return <AssetPicker value={field.value} />;
  }
  if (field.kind === "textarea") {
    return (
      <TextAreaField
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
      <SelectField
        id={id}
        value={field.value}
        options={field.options ?? []}
        invalid={invalid}
      />
    );
  }
  if (field.kind === "radio") {
    return (
      <RadioField
        name={id}
        value={field.value}
        options={field.options ?? []}
      />
    );
  }
  return (
    <TextField
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
    <div className="flex items-center gap-2 rounded-sm border border-border bg-[var(--color-bg-control)] p-1.5">
      <span
        aria-hidden
        className="size-8 shrink-0 rounded-sm bg-[var(--color-bg-subtle)]"
      />
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
  icon: LucideIcon;
}
interface TemplateGroup {
  label: string;
  cards: TemplateCard[];
}

const MODULE_TEMPLATES: TemplateGroup = {
  label: "Modules",
  cards: [
    { id: "hero", name: "Hero", description: "Title, description, image and CTA.", icon: Star },
    { id: "carousel", name: "Carousel", description: "Recommendations row from a collection.", icon: Blocks },
    { id: "faq", name: "FAQ", description: "Dynamic questions and answers.", icon: HelpCircle },
    { id: "text", name: "Text block", description: "Rich copy with headings.", icon: FileText },
  ],
};

const WIDGET_TEMPLATES: TemplateGroup = {
  label: "Widget",
  cards: [
    { id: "what-is", name: "what-is-peacock", description: "Published “What is” widget.", icon: Box },
    { id: "seo-footer", name: "seo-footer", description: "Footer navigation widget.", icon: Box },
    { id: "sticky-banner", name: "sticky-banner-widget-data", description: "Sticky banner widget.", icon: Box },
  ],
};

// One selectable template card: thumbnail glyph + name + description. A real
// <button> so it is keyboard-focusable and gets the shared focus ring.
function TemplateCardButton({ card, onSelect }: { card: TemplateCard; onSelect: () => void }) {
  const Glyph = card.icon;
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
        <Glyph className="size-5" />
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
function PropertyFieldRow({ field }: { field: PropertyField }) {
  const id = useId();
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
      help={field.helper ? <span id={helpId}>{field.helper}</span> : undefined}
    >
      <PropertyControl field={field} id={id} describedBy={helpId} invalid={false} />
    </PropRow>
  );
}

// The rows of a group.
function GroupRows({ group }: { group: PropertyGroup }) {
  return (
    <PropertyRows>
      {group.fields.map((field) => (
        <PropertyFieldRow key={field.label} field={field} />
      ))}
    </PropertyRows>
  );
}

// A titled group of rows (PRODUCT / CTA / LEGAL …). Headed groups collapse.
function GroupSection({
  group,
  expanded,
  onToggle,
}: {
  group: PropertyGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <PropSection header={group.header} expanded={expanded} onToggle={onToggle}>
      <GroupRows group={group} />
    </PropSection>
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
              variantId={variant.id}
              nodeId={selectedStructureNodeId}
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
  // key={nodeId} remounts FieldsBody per selected object so its per-group
  // expand/collapse memory resets to the default (all open) on each new object.
  return <FieldsBody key={nodeId} data={resolved.data} />;
}

// Editable object: eyebrow + name + grouped property rows. Accepts either a
// flat `fields` list or `groups` (which take precedence). Headed groups are
// collapsible and start expanded; an Expand all / Collapse all control appears
// only when there is more than one headed group.
function FieldsBody({ data }: { data: ObjectProperties }) {
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
      <ObjectHeader eyebrow={eyebrow} name={name} />
      {headers.length > 1 && (
        <div className="-mt-1 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={allCollapsed ? expandAll : collapseAll}
          >
            {allCollapsed ? "Expand all" : "Collapse all"}
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-1">
        {groups.map((group, i) => (
          <GroupSection
            key={group.header ?? i}
            group={group}
            expanded={group.header ? !collapsed.has(group.header) : true}
            onToggle={group.header ? () => toggle(group.header!) : () => {}}
          />
        ))}
      </div>
    </>
  );
}

// Structural/collection object: TYPE eyebrow, "N items" count, derived
// read-only item list, no-op paste. "Add {itemNoun}" opens the inline template
// gallery (Modules + Widget) rather than adding blindly. Items come from actual
// children.
function CollectionBody({ data }: { data: CollectionProperties }) {
  const { eyebrow, name, itemNoun, items } = data;
  const count = items.length;
  const [galleryOpen, setGalleryOpen] = useState(false);
  return (
    <>
      <ObjectHeader eyebrow={eyebrow} name={name ?? eyebrow} />
      <p className="text-[12px] text-muted-foreground">
        {count} {count === 1 ? "item" : "items"}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setGalleryOpen((v) => !v)}>
          <Plus className="size-4" />
          Add {itemNoun}
        </Button>
      </div>
      {galleryOpen && (
        <TemplateGallery
          groups={[MODULE_TEMPLATES, WIDGET_TEMPLATES]}
          onSelect={() => setGalleryOpen(false)}
          onCancel={() => setGalleryOpen(false)}
        />
      )}
      {count > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-sm border border-border bg-[var(--color-bg-subtle)] px-3 py-2 text-[13px]"
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => {}}>
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
          <Plus className="size-4" />
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
