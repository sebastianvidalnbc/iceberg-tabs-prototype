// Derives a live, renderable preview model from the currently-selected Structure
// node and the author's in-session property edits. This is what makes the center
// canvas DYNAMIC: selecting a Plan Picker (or a product, section, disclaimer…)
// and editing its fields projects a branded placeholder that updates as you type
// — the same idea as the nbcu-internal-tools reference, adapted to V4's richer
// resolver-driven data model (structure + classifyNode schemas).
//
// It never mutates data: property edits live as per-node overrides layered over
// the resolved schema values.
import {
  classifyNode,
  type ResolvedProperties,
  type StructureNode,
  type VariantWorkspace,
} from "./data";

// nodeId -> (field label -> edited value). One map per experience.
export type NodeOverrides = Record<string, Record<string, string>>;

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

// The effective field values for a node: schema defaults with the author's edits
// layered on top.
function fieldsForNode(
  node: StructureNode,
  parent: StructureNode | null,
  overrides: NodeOverrides,
): Record<string, string> {
  const base = flattenFields(classifyNode(node, parent));
  return { ...base, ...(overrides[node.id] ?? {}) };
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

// A node is a product/plan if it is typed as one, or (for the non-canonical
// sample variants) sits directly under a Products / Plan Picker Data list.
function isProductNode(node: StructureNode, parent: StructureNode | null): boolean {
  if (node.objectType === "product" || node.objectType === "plan") return true;
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
  overrides: NodeOverrides,
): PreviewCard {
  const map = fieldsForNode(product, parent, overrides);
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
    const fm = fieldsForNode(f, flist ?? null, overrides);
    features.push(pick(fm, ["Feature Description"]) ?? f.label);
  }

  let price: string | undefined;
  let priceCadence: string | undefined;
  const clist = childByType(product, "price-cadence", "cadence");
  const firstCad = clist?.children?.[0];
  if (firstCad) {
    const cm = fieldsForNode(firstCad, clist ?? null, overrides);
    price = pick(cm, ["Offer Price", "Strikethrough Price"]);
    priceCadence = firstCad.label;
  }

  return { id: product.id, title, eyebrow, badge, description, features, price, priceCadence, cta };
}

// Collect every product/plan card within a subtree (including the root itself).
function collectCards(
  node: StructureNode,
  parent: StructureNode | null,
  overrides: NodeOverrides,
  out: PreviewCard[],
): void {
  if (isProductNode(node, parent)) {
    out.push(buildCard(node, parent, overrides));
  }
  for (const c of node.children ?? []) collectCards(c, node, overrides, out);
}

// Build the preview model for the active experience + current selection + edits.
export function derivePreviewModel(
  variant: VariantWorkspace | null,
  selectedId: string | null,
  overrides: NodeOverrides,
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
  if (node) collectCards(node, parent, overrides, cards);

  const map = node ? fieldsForNode(node, parent, overrides) : {};
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

  if (cards.length > 0) {
    return { kind: "plans", eyebrow, title, subtitle, alignment, disclaimer, cards };
  }

  const message = pick(map, ["Error Body", "Disclaimer Text", "Voucher Error Text"]);
  if (message) {
    return { kind: "message", eyebrow, title, subtitle, alignment, message, cards: [] };
  }

  return {
    kind: "hero",
    eyebrow,
    title,
    subtitle: subtitle ?? variant.previewData.subtitle,
    alignment,
    disclaimer,
    cards: [],
  };
}
