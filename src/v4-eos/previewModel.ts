// Derives a live, renderable preview of the WHOLE variant/page — the way a
// Figma frame shows every element inside it. The canvas composes ALL top-level
// sections of the active variant and never re-scopes to the selected layer:
//   • it changes when you switch VARIANTS (a different page composition),
//   • it updates live as you EDIT a field's value,
//   • selecting a Structure layer does NOT change what's rendered — it only
//     drives the edit panel and highlights that element in the canvas.
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

// One rendered SECTION of the page (a top-level Structure node). The page is a
// vertical stack of these, mirroring how the variant's sections compose.
export interface PreviewSection {
  // The section's element instance id, so selecting/Pick-Section maps to it.
  nodeId: string;
  // plans → product-card grid; message → a copy block; hero → title band.
  kind: "plans" | "message" | "hero";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  alignment: "left" | "centre" | "right";
  disclaimer?: string;
  message?: string;
  cards: PreviewCard[];
}

export interface PreviewModel {
  variantName: string;
  sections: PreviewSection[];
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
    return; // a product's own subtree feeds its card, not nested cards
  }
  for (const c of node.children ?? []) collectCards(c, node, out);
}

// Aggregate the non-product "header" fields within a subtree (Plan Picker Title,
// Subtitle, Disclaimer, Error copy…). Product subtrees are skipped because their
// fields belong to cards, not the section band.
function aggregateHeaderFields(
  node: StructureNode,
  parent: StructureNode | null,
  acc: Record<string, string>,
): void {
  if (isProductNode(node, parent)) return;
  Object.assign(acc, fieldsForNode(node, parent));
  for (const c of node.children ?? []) aggregateHeaderFields(c, node, acc);
}

// All variation nodes (Control / Predecision / Variant A…) within a section.
function variationsIn(section: StructureNode): StructureNode[] {
  const out: StructureNode[] = [];
  const walk = (n: StructureNode) => {
    if (n.objectType === "variation") out.push(n);
    for (const c of n.children ?? []) walk(c);
  };
  for (const c of section.children ?? []) walk(c);
  return out;
}

// The content root that feeds a section's render: the active variation
// (mvtOverride if it belongs to this section, else the first non-empty one) when
// the section has variations, otherwise the section itself.
function contentRootFor(
  section: StructureNode,
  mvtOverride: string | null,
): StructureNode {
  const variations = variationsIn(section);
  if (variations.length === 0) return section;
  if (mvtOverride) {
    const hit = variations.find((v) => v.id === mvtOverride);
    if (hit) return hit;
  }
  return variations.find((v) => (v.children?.length ?? 0) > 0) ?? variations[0];
}

// Build one PreviewSection from a top-level Structure node.
function buildSection(
  section: StructureNode,
  mvtOverride: string | null,
): PreviewSection {
  const root = contentRootFor(section, mvtOverride);

  const cards: PreviewCard[] = [];
  collectCards(root, section, cards);

  const map: Record<string, string> = {};
  aggregateHeaderFields(root, section, map);

  const title =
    pick(map, [
      "Plan Picker Title",
      "Header",
      "Category Title",
      "Category Label",
      "Error Title",
      "Title",
    ]) ?? section.label;
  const subtitle = pick(map, ["Subtitle", "Subheader", "Error Body"]);
  const alignmentRaw =
    pick(map, ["Title & Subtitle Alignment", "Title Alignment", "Alignment"]) ??
    "Centre";
  const alignment = alignmentRaw.toLowerCase() as PreviewSection["alignment"];

  const discText = pick(map, ["Disclaimer Text", "Legal Description"]);
  const disclaimer =
    discText && map["Show Disclaimer"] !== "false" ? discText : undefined;

  const message = pick(map, ["Error Body", "Voucher Error Text"]);
  const eyebrow = section.role ?? undefined;

  const kind: PreviewSection["kind"] =
    cards.length > 0 ? "plans" : message ? "message" : "hero";

  return {
    nodeId: section.id,
    kind,
    eyebrow,
    title,
    subtitle,
    alignment,
    disclaimer,
    message: kind === "message" ? message : undefined,
    cards,
  };
}

// Build the whole-page preview for the active variant. Independent of the tree
// SELECTION (selection only drives the edit panel + highlight); depends only on
// the variant, the instances' authored content, and the MVT override.
export function derivePreviewModel(
  variant: VariantWorkspace | null,
  mvtOverride: string | null = null,
): PreviewModel {
  if (!variant) return { variantName: "", sections: [] };
  const sections = variant.structure
    .filter((n) => !n.disabled)
    .map((section) => buildSection(section, mvtOverride));
  return { variantName: variant.name, sections };
}

// Collect the experience's content VARIATIONS (Control / Predecision / Variant
// A…) — the MVT/A-B units the real editor exposes via the preview's variant
// dropdown (mvtOverride). Used to let the author preview a specific variation.
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
