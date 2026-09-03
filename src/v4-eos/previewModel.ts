// Derives a live, renderable preview model from the currently-selected Structure
// node. This is what makes the center canvas DYNAMIC: selecting a Plan Picker
// (or a product, section, disclaimer…) and editing its fields projects a branded
// placeholder that reflects the instance's authored VALUES.
//
// Faithful to real Iceberg: the schema comes from the element registry (via
// classifyNode) and the VALUES come from each instance's `node.content`
// (the `placeholder.content` analog). The renderer overlays content on the
// schema defaults — it never mutates data.
import {
  classifyNode,
  type ResolvedProperties,
  type StructureNode,
  type VariantWorkspace,
} from "./data";
import { previewRoleFor } from "./elements";

export interface PreviewCard {
  id: string;
  title: string;
  eyebrow?: string;
  badge?: string;
  description?: string;
  features: string[];
  price?: string;
  priceCadence?: string;
  cta?: string;
}

export interface PreviewModel {
  // plans → product-card grid (the plan picker); message → a single copy block
  // (error / disclaimer); hero → title + subtitle only; empty → nothing selected.
  kind: "plans" | "message" | "hero" | "empty";
  // The selected element instance id this section band maps to, so Pick Section
  // clicks in the iframe can post it back to select the node.
  nodeId?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  alignment: "left" | "centre" | "right";
  disclaimer?: string;
  message?: string;
  cards: PreviewCard[];
}

// Flatten a resolved "fields" object (flat or grouped) into label→value.
function flattenFields(props: ResolvedProperties): Record<string, string> {
  const out: Record<string, string> = {};
  if (props.kind !== "fields") return out;
  const groups = props.data.groups ?? [{ fields: props.data.fields ?? [] }];
  for (const g of groups) for (const f of g.fields) out[f.label] = f.value;
  return out;
}

// The effective field values for a node: schema defaults (from the registry via
// classifyNode) with the instance's authored `content` values layered on top.
function fieldsForNode(
  node: StructureNode,
  parent: StructureNode | null,
): Record<string, string> {
  const base = flattenFields(classifyNode(node, parent));
  return { ...base, ...(node.content ?? {}) };
}

function pick(map: Record<string, string>, labels: string[]): string | undefined {
  for (const l of labels) {
    const v = map[l];
    if (v != null && v.trim() !== "") return v;
  }
  return undefined;
}

function findWithParent(
  nodes: StructureNode[],
  id: string,
  parent: StructureNode | null = null,
): { node: StructureNode; parent: StructureNode | null } | null {
  for (const n of nodes) {
    if (n.id === id) return { node: n, parent };
    if (n.children) {
      const hit = findWithParent(n.children, id, n);
      if (hit) return hit;
    }
  }
  return null;
}

// A node is a product/plan if its element type renders as a product card, or
// (for the non-canonical sample variants) it sits directly under a Products /
// Plan Picker Data list.
function isProductNode(node: StructureNode, parent: StructureNode | null): boolean {
  if (previewRoleFor(node) === "product") return true;
  const pl = parent?.label.toLowerCase() ?? "";
  return pl === "products" || pl === "plan picker data";
}

function childByType(
  node: StructureNode,
  type: string,
  labelHint: string,
): StructureNode | undefined {
  return (node.children ?? []).find(
    (c) => c.objectType === type || c.label.toLowerCase().includes(labelHint),
  );
}

function buildCard(
  product: StructureNode,
  parent: StructureNode | null,
): PreviewCard {
  const map = fieldsForNode(product, parent);
  const title = pick(map, ["Product Title", "Title", "Plan Name"]) ?? product.label;
  const eyebrow = pick(map, ["Eyebrow"]);
  const badge =
    map["Badge"] === "true" ? pick(map, ["Badge Text"]) ?? "Best Value" : undefined;
  const description = pick(map, ["Product Description", "Description"]);
  const cta =
    map["Primary CTA"] && map["Primary CTA"] !== "None"
      ? pick(map, ["Primary CTA Text"]) ?? "Get started"
      : undefined;

  const features: string[] = [];
  const flist = childByType(product, "product-features-list", "feature");
  for (const f of flist?.children ?? []) {
    const fm = fieldsForNode(f, flist ?? null);
    features.push(pick(fm, ["Feature Description"]) ?? f.label);
  }

  let price: string | undefined;
  let priceCadence: string | undefined;
  const clist = childByType(product, "price-cadence", "cadence");
  const firstCad = clist?.children?.[0];
  if (firstCad) {
    const cm = fieldsForNode(firstCad, clist ?? null);
    price = pick(cm, ["Offer Price", "Strikethrough Price"]);
    priceCadence = firstCad.label;
  }

  return { id: product.id, title, eyebrow, badge, description, features, price, priceCadence, cta };
}

// Collect every product/plan card within a subtree (including the root itself).
function collectCards(
  node: StructureNode,
  parent: StructureNode | null,
  out: PreviewCard[],
): void {
  if (isProductNode(node, parent)) {
    out.push(buildCard(node, parent));
  }
  for (const c of node.children ?? []) collectCards(c, node, out);
}

// Collect the experience's content VARIATIONS (Control / Predecision / Variant
// A…) — the MVT/A-B units the real editor exposes via the preview's variant
// dropdown (mvtOverride). Used to let the author preview a specific variation
// without changing the tree selection.
export function collectVariationNodes(
  variant: VariantWorkspace | null,
): { id: string; label: string; section?: string }[] {
  if (!variant) return [];
  const out: { id: string; label: string; section?: string }[] = [];
  const walk = (nodes: StructureNode[], section: string | undefined) => {
    for (const n of nodes) {
      const nextSection = n.objectType === "page-section" ? n.label : section;
      if (n.objectType === "variation") {
        out.push({ id: n.id, label: n.label, section: nextSection });
      }
      if (n.children) walk(n.children, nextSection);
    }
  };
  walk(variant.structure, undefined);
  return out;
}

// Build the preview model for the active experience + current selection. Reads
// each instance's authored `content` (plus schema defaults) so the canvas
// reflects the edited values live.
export function derivePreviewModel(
  variant: VariantWorkspace | null,
  selectedId: string | null,
): PreviewModel {
  if (!variant) {
    return { kind: "empty", title: "", alignment: "centre", cards: [] };
  }

  const found = selectedId ? findWithParent(variant.structure, selectedId) : null;
  const node = found?.node ?? null;
  const parent = found?.parent ?? null;

  // Cards come from the selected subtree, so selecting a Plan Picker section
  // shows every plan, while selecting one product shows just that card.
  const cards: PreviewCard[] = [];
  if (node) collectCards(node, parent, cards);

  const map = node ? fieldsForNode(node, parent) : {};
  const title =
    pick(map, [
      "Plan Picker Title",
      "Header",
      "Product Title",
      "Category Title",
      "Category Label",
      "Error Title",
      "Title",
    ]) ??
    node?.label ??
    variant.previewData.title;
  const subtitle = pick(map, [
    "Subtitle",
    "Subheader",
    "Product Description",
    "Error Body",
  ]);
  const alignmentRaw =
    pick(map, ["Title & Subtitle Alignment", "Title Alignment", "Alignment"]) ??
    "Centre";
  const alignment = alignmentRaw.toLowerCase() as PreviewModel["alignment"];

  // Disclaimer copy, honoured only when not explicitly hidden.
  const discText = pick(map, ["Disclaimer Text", "Legal Description"]);
  const disclaimer =
    discText && map["Show Disclaimer"] !== "false" ? discText : undefined;

  const eyebrow = node?.role ?? undefined;
  const nodeId = node?.id;

  if (cards.length > 0) {
    return { kind: "plans", nodeId, eyebrow, title, subtitle, alignment, disclaimer, cards };
  }

  const message = pick(map, ["Error Body", "Disclaimer Text", "Voucher Error Text"]);
  if (message) {
    return { kind: "message", nodeId, eyebrow, title, subtitle, alignment, message, cards: [] };
  }

  return {
    kind: "hero",
    nodeId,
    eyebrow,
    title,
    subtitle: subtitle ?? variant.previewData.subtitle,
    alignment,
    disclaimer,
    cards: [],
  };
}
