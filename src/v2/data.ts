// V2 workspace data model. SAMPLE DATA — representative, not a byte-for-byte
// copy of production Iceberg. Relationships modelled here:
//   Page ──contains──▶ Variant ──has──▶ Structure ─┬▶ Preview
//                                                    └▶ Properties (per object)
// The Explorer PAGES tree mixes Page rows (routes) and Variant rows (a page's
// authored experiences). Selecting a Page vs a Variant behaves differently
// (see WorkspaceShell). Structure/Preview/Properties always belong to the
// active Variant.
import { VARIANT_STRUCTURES } from "./variants";
import {
  VARIANT_PREVIEWS,
  VARIANT_DEFAULT_SELECTION,
  OBJECT_PROPERTIES,
  controlSchema,
  sectionOptionsSchema,
  categorySchema,
  productSchema,
  featureSchema,
  cadenceSchema,
  contentAreaSchema,
  behavioursState,
} from "./previews";

// Classifies a Structure object so Properties resolution and (later) drag/paste
// rules are type-aware rather than relying only on label string matching.
// Domain (architect) terminology is preferred; the older *-alias members are
// retained so the non-canonical sample Variants keep resolving unchanged.
export type StructureObjectType =
  | "page-section" // a Section (Page Title / Plan Picker / Footer / …)
  | "content-area" // Desktop Content / Mobile Content
  | "behaviours" // Behaviours authoring area
  | "section-options" // Section Options (Custom or Intelligent)
  | "section-content" // Section Content collection
  | "variation" // Predecision / Control / Default
  | "categories" // Categories collection (architect)
  | "variant-categories" // alias: Variant Categories collection
  | "category" // Plans / Bundles
  | "products" // Products collection (architect)
  | "plan-picker-data" // alias: Plan Picker Data collection
  | "product" // a Product (Select / Premium / Premium Plus)
  | "plan" // alias: a Product
  | "product-features-list" // Product Features collection
  | "feature" // a single feature item
  | "price-cadence" // Price Cadence collection (architect)
  | "pricing" // alias: Pricing collection
  | "cadence" // a single cadence (Annual / Monthly)
  | "pricing-option"; // alias: a single cadence

// The section-level authoring mode shown on Sections.
export type SectionDesign = "Custom" | "Legacy layout" | "Intelligent authoring";

// The system/domain ROLE of a Section, distinct from its authored label.
export type SectionRole = "Page Title" | "Plan Picker" | "Footer" | (string & {});

// Generic tree node reused by both the PAGES tree and Variant Structure trees.
export interface TreeNode {
  id: string;
  label: string;
  // 'page'   → a route row (rendered in mono)
  // 'variant'→ a selectable authored experience under a page
  // undefined→ a Structure object row
  type?: "page" | "variant";
  kind?: "path" | "object"; // 'path' renders in mono (page routes)
  children?: TreeNode[];
  defaultExpanded?: boolean;
  // --- Structure-object metadata (optional; drives Properties + type rules) --
  objectType?: StructureObjectType;
  sectionId?: string; // Sections only (e.g. "section-1")
  design?: SectionDesign; // Sections only
  role?: SectionRole; // Sections only — system/domain role vs authored label
  // Authored Properties payload for canonical nodes. When present it is used
  // verbatim instead of a label-derived template.
  props?: ResolvedProperties;
}

// A Structure node is just a TreeNode (no page/variant type).
export type StructureNode = TreeNode;

export interface PreviewData {
  title: string;
  subtitle: string;
  tone: "plans" | "error" | "neutral";
  body: string;
}

export interface VariantWorkspace {
  id: string;
  name: string;
  structure: StructureNode[];
  previewData: PreviewData;
  defaultSelectionId: string; // default selected Structure object
}

// --- App Navigation (existing Iceberg IA; do not redesign) ------------------
export const APP_NAV: string[] = [
  "Pages",
  "Content Pages",
  "Event Pages",
  "Widgets",
  "Central Mgmt",
  "QA Queue",
  "Optimizely",
  "Scheduled Pages",
  "Redirects",
  "Services CMS",
  "Help",
];

// --- Explorer: PAGES --------------------------------------------------------
// Leaf pages own Variants (type: "variant"); intermediate routes are Pages.
export const PAGES_TREE: TreeNode[] = [
  {
    id: "plans",
    label: "/plans",
    type: "page",
    kind: "path",
    defaultExpanded: true,
    children: [
      {
        id: "plans-all-monthly",
        label: "/plans/all-monthly",
        type: "page",
        kind: "path",
        defaultExpanded: true,
        children: [
          { id: "pg-spanish", label: "Spanish voucher error message", type: "variant" },
          { id: "pg-disclaimer2", label: "Testing disclaimer 2", type: "variant" },
          { id: "pg-annual", label: "Annual Select Update", type: "variant" },
          { id: "pg-0609", label: "0609 premium card test 2", type: "variant" },
          { id: "pg-premium-test-2", label: "Premium_Test__2", type: "variant" },
        ],
      },
      { id: "plans-appletv", label: "/plans/apple-tv-and-peacock", type: "page", kind: "path" },
      { id: "plans-subscribe", label: "/plans/subscribe", type: "page", kind: "path" },
      { id: "plans-testing", label: "/plans/testing-variant", type: "page", kind: "path" },
    ],
  },
  { id: "offer", label: "/offer", type: "page", kind: "path", children: [] },
  { id: "offer-terms", label: "/offer-terms", type: "page", kind: "path", children: [] },
  { id: "news", label: "/news", type: "page", kind: "path", children: [] },
];

// Default: no page/variant preselected route, but open on the richest variant
// so first paint shows a populated workspace.
export const DEFAULT_VARIANT_ID = "pg-0609"; // "0609 premium card test 2"

// --- Properties field shape (rendered by the Properties region) -------------
export interface PropertyField {
  label: string;
  value: string;
  kind?:
    | "text"
    | "textarea"
    | "checkbox"
    | "switch"
    | "select"
    | "radio"
    | "asset"; // asset/icon picker: preview + name + Remove
  required?: boolean;
  options?: string[]; // choices for "select" / "radio" kinds
  helper?: string; // helper text shown under the control
}

// A titled group of fields (e.g. PRODUCT / CTA / LEGAL). Groups render with a
// subtle heading/divider so the panel stays dense.
export interface PropertyGroup {
  header?: string;
  fields: PropertyField[];
}

export interface ObjectProperties {
  eyebrow: string;
  name: string;
  // Either a flat field list OR grouped fields. `fields` stays for back-compat;
  // when `groups` is present it takes precedence.
  fields?: PropertyField[];
  groups?: PropertyGroup[];
}

// Structural/collection objects: a TYPE eyebrow, a derived "N items" list, and
// no-op action buttons (see Properties region). Items are derived from the
// node's actual Structure children — never hardcoded.
export interface CollectionProperties {
  eyebrow: string;
  name?: string;
  itemNoun: string;
  items: { id: string; label: string }[];
}

// Page sections resolve to a deliberate metadata state: Section ID + Design
// mode radio (Custom / Legacy layout / Intelligent authoring). Intelligent
// authoring surfaces an extra affordance (matching real Iceberg).
export interface SectionMetadata {
  eyebrow: string; // "SECTION"
  name: string; // authored label
  role?: SectionRole; // system/domain role (Page Title / Plan Picker / Footer)
  sectionId?: string;
  design?: SectionDesign;
  designOptions?: SectionDesign[];
  intelligentAffordance?: boolean; // show the Intelligent-authoring selector/docs
  status?: string;
  note?: string;
}

// A deliberate "this object has no configured content" state (e.g. an empty
// Predecision variation). Distinct from a missing panel.
export interface NoticeProperties {
  eyebrow: string;
  name: string;
  message: string;
  detail?: string;
}

// Discriminated union returned by resolvePropertiesFor — every selectable node
// resolves to exactly one meaningful kind.
export type ResolvedProperties =
  | { kind: "fields"; data: ObjectProperties }
  | { kind: "collection"; data: CollectionProperties }
  | { kind: "metadata"; data: SectionMetadata }
  | { kind: "notice"; data: NoticeProperties };

// --- Assemble Variant workspaces from the split sample modules --------------
export { OBJECT_PROPERTIES };

// Human-readable Variant names, derived from the PAGES tree variant rows.
const VARIANT_NAMES: Record<string, string> = collectVariantNames(PAGES_TREE);

function collectVariantNames(
  nodes: TreeNode[],
  acc: Record<string, string> = {}
): Record<string, string> {
  for (const node of nodes) {
    if (node.type === "variant") acc[node.id] = node.label;
    if (node.children) collectVariantNames(node.children, acc);
  }
  return acc;
}

// The full Variant workspace record, keyed by Variant id.
export const VARIANTS: Record<string, VariantWorkspace> = Object.fromEntries(
  Object.keys(VARIANT_STRUCTURES).map((id) => [
    id,
    {
      id,
      name: VARIANT_NAMES[id] ?? id,
      structure: VARIANT_STRUCTURES[id],
      previewData: VARIANT_PREVIEWS[id],
      defaultSelectionId: VARIANT_DEFAULT_SELECTION[id],
    } satisfies VariantWorkspace,
  ])
);

export function getVariant(id: string | null): VariantWorkspace | null {
  return id ? VARIANTS[id] ?? null : null;
}

export function isVariantId(id: string): boolean {
  return id in VARIANTS;
}

// Page-section labels that resolve to the metadata state (fallback when a node
// has no explicit objectType — e.g. the non-canonical sample Variants).
const PAGE_SECTION_LABELS = [
  "title",
  "see what",
  "faq",
  "legal",
  "premium card first test",
];

// Publish status shown in the metadata state, keyed by (lower-cased) section
// label. Anything unlisted defaults to "draft".
const SECTION_STATUS: Record<string, string> = {
  title: "published",
  "see what": "draft",
  faq: "published",
  legal: "published",
  "premium card first test": "in-review",
};

// Item noun per collection object type (for "+ Add {noun}" / "Paste {noun}").
const COLLECTION_NOUNS: Partial<Record<StructureObjectType, string>> = {
  "section-content": "Variation",
  categories: "Category",
  "variant-categories": "Category",
  products: "Product",
  "plan-picker-data": "Plan",
  "product-features-list": "Feature",
  "price-cadence": "Cadence",
  pricing: "Pricing Option",
};

// Maps a node's actual Structure children to derived collection items.
function childrenToItems(node: TreeNode): { id: string; label: string }[] {
  return (node.children ?? []).map((c) => ({ id: c.id, label: c.label }));
}

function metadataFor(node: TreeNode): ResolvedProperties {
  const design = node.design ?? "Custom";
  return {
    kind: "metadata",
    data: {
      eyebrow: "SECTION",
      name: node.label,
      role: node.role,
      sectionId: node.sectionId ?? node.id,
      design,
      designOptions: ["Custom", "Legacy layout", "Intelligent authoring"],
      intelligentAffordance: design === "Intelligent authoring",
      status: SECTION_STATUS[node.label.toLowerCase()],
    },
  };
}

function collectionFor(
  node: TreeNode,
  type: StructureObjectType
): ResolvedProperties {
  return {
    kind: "collection",
    data: {
      eyebrow: node.label.toUpperCase(),
      name: node.label,
      itemNoun: COLLECTION_NOUNS[type] ?? "Item",
      items: childrenToItems(node),
    },
  };
}

// Type-aware classification. Prefers node.objectType (canonical 0609); falls
// back to label/parent-label matching for the other sample Variants. Every
// branch returns a meaningful, non-empty state.
export function classifyNode(
  node: TreeNode,
  parent: TreeNode | null
): ResolvedProperties {
  // Canonical nodes may carry an authored payload — use it verbatim.
  if (node.props) return node.props;

  const label = node.label.toLowerCase();
  const parentLabel = parent?.label.toLowerCase() ?? "";
  const t = node.objectType;

  // --- objectType-driven (canonical 0609) ----------------------------------
  if (t) {
    switch (t) {
      case "page-section":
        return metadataFor(node);
      case "section-content":
      case "categories":
      case "variant-categories":
      case "products":
      case "plan-picker-data":
      case "product-features-list":
      case "price-cadence":
      case "pricing":
        return collectionFor(node, t);
      case "section-options":
        return {
          kind: "fields",
          data: sectionOptionsSchema(node.design ?? parent?.design),
        };
      case "variation":
        // Predecision is a deliberate empty variation (no configured content).
        if (node.label.toLowerCase() === "predecision") {
          return {
            kind: "notice",
            data: {
              eyebrow: "CONTENT VARIATION",
              name: node.label,
              message: "This variation has no configured content.",
              detail:
                "Add a module or duplicate the Control variation to populate it.",
            },
          };
        }
        return { kind: "fields", data: controlSchema(node.label) };
      case "category":
        return { kind: "fields", data: categorySchema(node.label) };
      case "product":
      case "plan":
        return { kind: "fields", data: productSchema(node.label) };
      case "feature":
        return { kind: "fields", data: featureSchema(node.label) };
      case "cadence":
      case "pricing-option":
        return { kind: "fields", data: cadenceSchema(node.label) };
      case "content-area":
        return contentAreaSchema(node.label);
      case "behaviours":
        return behavioursState(parent?.label ?? node.label);
    }
  }

  // --- label fallback (non-canonical sample Variants) ----------------------
  const collections: Partial<Record<string, StructureObjectType>> = {
    "section content": "section-content",
    categories: "categories",
    "variant categories": "variant-categories",
    products: "products",
    "plan picker data": "plan-picker-data",
    "product features": "product-features-list",
    "product features list": "product-features-list",
    "price cadence": "price-cadence",
    "pricing options": "pricing",
    pricing: "pricing",
  };
  if (collections[label]) return collectionFor(node, collections[label]!);

  if (label === "section options") {
    return { kind: "fields", data: sectionOptionsSchema(parent?.design) };
  }
  if (label === "control" || label === "predecision" || label === "default") {
    return { kind: "fields", data: controlSchema(node.label) };
  }
  if (label === "plans" || label === "bundles") {
    return { kind: "fields", data: categorySchema(node.label) };
  }
  if (parentLabel === "products" || parentLabel === "plan picker data") {
    return { kind: "fields", data: productSchema(node.label) };
  }
  if (parentLabel === "product features" || parentLabel === "product features list") {
    return { kind: "fields", data: featureSchema(node.label) };
  }
  if (
    parentLabel === "price cadence" ||
    parentLabel === "pricing options" ||
    parentLabel === "pricing"
  ) {
    return { kind: "fields", data: cadenceSchema(node.label) };
  }
  if (parentLabel === "categories" || parentLabel === "variant categories") {
    return { kind: "fields", data: categorySchema(node.label) };
  }

  if (parent === null || PAGE_SECTION_LABELS.includes(label)) {
    return metadataFor(node);
  }

  // Default fallback — never empty.
  return { kind: "fields", data: controlSchema(node.label) };
}

// Resolves the Properties for a Structure object within a given Variant.
// Order: (1) authored OBJECT_PROPERTIES[nodeId] → fields; (2) classifyNode
// (which itself prefers an authored node.props payload, then objectType).
export function resolvePropertiesFor(
  variantId: string,
  nodeId: string
): ResolvedProperties {
  const variant = VARIANTS[variantId];
  if (variant) {
    const found = findNodeWithParent(variant.structure, nodeId, null);
    if (found?.node.props) return found.node.props;
    if (OBJECT_PROPERTIES[nodeId]) {
      return { kind: "fields", data: OBJECT_PROPERTIES[nodeId] };
    }
    if (found) return classifyNode(found.node, found.parent);
  }
  if (OBJECT_PROPERTIES[nodeId]) {
    return { kind: "fields", data: OBJECT_PROPERTIES[nodeId] };
  }
  return {
    kind: "metadata",
    data: {
      eyebrow: "SECTION",
      name: nodeId,
      status: "draft",
      sectionId: nodeId,
      designOptions: ["Custom", "Legacy layout", "Intelligent authoring"],
      design: "Custom",
    },
  };
}

// Seeds the set of expanded node ids for a Variant's structure from its
// defaultExpanded flags (used to initialise per-Variant expansion memory).
export function seedExpandedFor(variantId: string): Set<string> {
  const variant = VARIANTS[variantId];
  const acc = new Set<string>();
  if (variant) collect(variant.structure);
  return acc;
  function collect(nodes: StructureNode[]) {
    for (const node of nodes) {
      if (node.defaultExpanded) acc.add(node.id);
      if (node.children) collect(node.children);
    }
  }
}

export function findNodeWithParent(
  nodes: TreeNode[],
  id: string,
  parent: TreeNode | null
): { node: TreeNode; parent: TreeNode | null } | null {
  for (const node of nodes) {
    if (node.id === id) return { node, parent };
    if (node.children) {
      const hit = findNodeWithParent(node.children, id, node);
      if (hit) return hit;
    }
  }
  return null;
}

// Convenience: locate a node by id without needing its parent.
export function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  return findNodeWithParent(nodes, id, null)?.node ?? null;
}
