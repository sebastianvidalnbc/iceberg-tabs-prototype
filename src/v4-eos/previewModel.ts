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
// schema defaults — it never mutates data. The render itself inherits the real
// Peacock design system (renderer/brand.css), so every layout type renders as
// an on-brand section (plan-picker cards, hero, banner, FAQ, rail, grid, …).
import {
  classifyNode,
  type ResolvedProperties,
  type StructureNode,
  type VariantWorkspace,
} from "./data";
import { previewRoleFor } from "./elements";

// A single product feature (bullet): the checkmark/icon + its text. `id` is the
// feature node's Structure id, so clicking the bullet selects that node.
export interface PreviewFeature {
  id?: string;
  icon?: string;
  text: string;
}

export interface PreviewCard {
  id: string;
  title: string;
  titleIcon?: string;
  eyebrow?: string;
  badge?: string;
  description?: string;
  features: PreviewFeature[];
  price?: string;
  priceCadence?: string;
  cta?: string;
}

// A generic tile/row used by non-plan-picker layouts (FAQ Q/A, rail/grid tiles,
// steps, comparison rows, footer columns). Synthesised on-brand so every layout
// in the catalog renders a recognisable Peacock section.
export interface PreviewItem {
  title?: string;
  body?: string;
  icon?: string;
}

export type PreviewKind =
  | "plans"
  | "hero"
  | "banner"
  | "faq"
  | "rail"
  | "grid"
  | "comparison"
  | "footer"
  | "countdown"
  | "steps"
  | "message"
  | "generic";

// A plan-picker category (a `categories` tab): its title drives the Plans /
// Bundles toggle, and it owns its own product cards.
export interface PreviewCategory {
  id: string;
  title: string;
  cards: PreviewCard[];
}

// One rendered SECTION of the page (a top-level Structure node). The page is a
// vertical stack of these, mirroring how the variant's sections compose.
export interface PreviewSection {
  // The section's element instance id, so selecting/Pick-Section maps to it.
  nodeId: string;
  kind: PreviewKind;
  // Peacock background treatment (from the layout's Select Background option).
  background: "light" | "dark" | "branded";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  alignment: "left" | "centre" | "right";
  disclaimer?: string;
  message?: string;
  cards: PreviewCard[];
  // Plan-picker categories (Plans / Bundles …). Present when the section has a
  // `categories` collection; when 2+, the render shows a category toggle and
  // `cards` mirrors the first category.
  categories?: PreviewCategory[];
  items: PreviewItem[];
}

export interface PreviewModel {
  variantName: string;
  sections: PreviewSection[];
}

// Strip HTML tags from rich-text values so preview copy renders as plain text.
function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
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

const TITLE_LABELS = [
  "Heading - H1",
  "Heading",
  "Header",
  "Plan Picker Title",
  "Category Title",
  "Category Label",
  "Error Title",
  "Title",
];
const SUBTITLE_LABELS = [
  "Description",
  "Subtitle",
  "Subheader",
  "Sub-heading",
  "Error Body",
];

// A node renders as a product/plan card if its collection's item noun reads as
// a product/plan/card (schema-driven), or (sample variants) it sits under a
// Products / Plan Picker Data list. Feature/bundle/option items are excluded.
function isProductNode(node: StructureNode, parent: StructureNode | null): boolean {
  if (previewRoleFor(node) === "product") return true;
  const pl = parent?.label.toLowerCase() ?? "";
  if (pl === "products" || pl.includes("plan picker data")) return true;
  const noun = (parent?.itemNoun ?? "").toLowerCase();
  if (/\b(product|plan|card)\b/.test(noun) && !/feature|bundle|option|increment/.test(noun)) {
    return true;
  }
  return false;
}

// Whether a collection node holds a product's feature bullets.
function isFeatureCollection(node: StructureNode): boolean {
  const l = node.label.toLowerCase();
  const noun = (node.itemNoun ?? "").toLowerCase();
  return (
    node.objectType === "product-features-list" ||
    l.includes("feature") ||
    l.includes("product list") ||
    noun.includes("feature")
  );
}

// Collect a product card's feature bullets (icon + text) from its feature-list
// child collection(s).
function collectFeatures(product: StructureNode): PreviewFeature[] {
  const out: PreviewFeature[] = [];
  for (const child of product.children ?? []) {
    if (!isFeatureCollection(child)) continue;
    for (const item of child.children ?? []) {
      const fm = fieldsForNode(item, child);
      const raw = pick(fm, ["Product Feature", "Feature Description", "Feature", "Description"]);
      if (!raw) continue;
      out.push({
        id: item.id,
        icon: pick(fm, ["Product Feature Icon", "Feature Icon", "Icon"]) ?? "check",
        text: stripHtml(raw),
      });
    }
  }
  return out;
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
  const title = pick(map, ["Product Title", "Title", "Plan Name", "Card Title"]) ?? product.label;
  const titleIcon = pick(map, ["Product Title Icon", "Title Icon"]);
  const eyebrow = pick(map, ["Eyebrow"]);
  // Badge only shows when its toggle is on (the schema's Badge checkbox).
  const badge = map["Badge"] === "true" ? pick(map, ["Badge Text"]) ?? "Best Value" : undefined;
  const descRaw = pick(map, ["Product Description", "Description"]);
  const description = descRaw ? stripHtml(descRaw) : undefined;

  // Primary CTA: the schema-switcher selects Custom / Central Management. The
  // real card renders a button only when a CTA is authored — "None"/empty means
  // no button (not a button labelled "None").
  const ctaText = pick(map, ["Primary CTA", "Primary CTA Text", "CTA", "CTA Text"]);
  const cta =
    ctaText && ctaText.toLowerCase() !== "none" ? ctaText : undefined;

  const features = collectFeatures(product);

  let price: string | undefined;
  let priceCadence: string | undefined;
  const clist = childByType(product, "price-cadence", "cadence");
  const firstCad = clist?.children?.[0];
  if (firstCad) {
    const cm = fieldsForNode(firstCad, clist ?? null);
    price = pick(cm, ["Offer Price", "Strikethrough Price"]);
    priceCadence = firstCad.label;
  }

  return {
    id: product.id,
    title,
    titleIcon,
    eyebrow,
    badge,
    description,
    features,
    price,
    priceCadence,
    cta,
  };
}

// Whether a node is the plan-picker's `categories` collection (Plans / Bundles).
function isCategoriesCollection(node: StructureNode): boolean {
  const l = node.label.toLowerCase();
  const noun = (node.itemNoun ?? "").toLowerCase();
  return (
    node.objectType === "categories" ||
    ((node.objectType === "schema-collection") &&
      (l.includes("categor") || noun.includes("categor")))
  );
}

// Find the categories collection anywhere in a section's content subtree.
function findCategoriesNode(node: StructureNode): StructureNode | null {
  if (isCategoriesCollection(node)) return node;
  for (const c of node.children ?? []) {
    const hit = findCategoriesNode(c);
    if (hit) return hit;
  }
  return null;
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

// Classify a section into a Peacock render kind from its role/label (and whether
// it resolved to product cards). Every layout maps to a kind — nothing is blank.
function classifyKind(
  section: StructureNode,
  cardsCount: number,
  message: string | undefined,
): PreviewKind {
  if (cardsCount > 0) return "plans";
  const key = `${section.role ?? ""} ${section.label}`.toLowerCase();
  const has = (...w: string[]) => w.some((x) => key.includes(x));
  if (has("faq")) return "faq";
  if (has("comparison")) return "comparison";
  if (has("footer")) return "footer";
  if (has("countdown")) return "countdown";
  if (has("step", "sub-navigation", "sub navigation")) return "steps";
  if (has("carousel", "rail", "highlight", "promotional", "sle", "season", "episode", "channels", "cast"))
    return "rail";
  if (has("grid", "logo", "catalogue", "filtered", "content grid"))
    return "grid";
  if (has("hero", "key art", "synopsis")) return "hero";
  if (has("banner", "text & tcs", " tcs", "countdown")) return "banner";
  if (message) return "message";
  return "generic";
}

// Synthesise on-brand placeholder items for non-data-bound layout kinds so the
// section renders a recognisable Peacock shape (real copy comes from the fields;
// the tiles/rows are schematic until those layouts are modelled field-by-field).
function synthItems(kind: PreviewKind): PreviewItem[] {
  switch (kind) {
    case "faq":
      return [
        { title: "How much does it cost?", body: "Choose the plan that suits you. Cancel anytime." },
        { title: "Can I change my plan later?", body: "Yes — upgrade or downgrade whenever you like." },
        { title: "What devices are supported?", body: "Stream on web, mobile, tablet, and connected TV." },
      ];
    case "rail":
      return Array.from({ length: 5 }, (_, i) => ({ title: `Title ${i + 1}` }));
    case "grid":
      return Array.from({ length: 6 }, (_, i) => ({ title: `Item ${i + 1}` }));
    case "comparison":
      return [
        { title: "4K UHD & HDR" },
        { title: "Ad-free experience" },
        { title: "Live sports & events" },
        { title: "Download & go" },
      ];
    case "footer":
      return [
        { title: "Company", body: "About · Careers · Press" },
        { title: "Support", body: "Help · Contact · Accessibility" },
        { title: "Legal", body: "Terms · Privacy · Cookies" },
      ];
    case "steps":
      return [
        { title: "Choose your plan", body: "Pick the plan that's right for you." },
        { title: "Create an account", body: "Sign up in seconds." },
        { title: "Start streaming", body: "Watch on any device." },
      ];
    default:
      return [];
  }
}

// Build one PreviewSection from a top-level Structure node.
function buildSection(
  section: StructureNode,
  mvtOverride: string | null,
): PreviewSection {
  const root = contentRootFor(section, mvtOverride);

  // Categories (Plans / Bundles): when the section has a `categories` collection,
  // each category owns its own cards and drives the category toggle. Otherwise
  // the section's cards are collected flat from the content root.
  const catNode = findCategoriesNode(root);
  let categories: PreviewCategory[] | undefined;
  const cards: PreviewCard[] = [];
  if (catNode && (catNode.children?.length ?? 0) > 0) {
    categories = (catNode.children ?? []).map((cat) => {
      const cc: PreviewCard[] = [];
      collectCards(cat, catNode, cc);
      const cm = fieldsForNode(cat, catNode);
      const title = pick(cm, ["Category Title", "Category Label"]) ?? cat.label;
      return { id: cat.id, title, cards: cc };
    });
    cards.push(...(categories[0]?.cards ?? []));
  } else {
    collectCards(root, section, cards);
  }

  const map: Record<string, string> = {};
  aggregateHeaderFields(root, section, map);

  const title = pick(map, TITLE_LABELS) ?? section.label;
  const subtitle = pick(map, SUBTITLE_LABELS);
  const alignmentRaw =
    pick(map, ["Title & Subtitle Alignment", "Title Alignment", "Alignment"]) ?? "Centre";
  const alignment = alignmentRaw.toLowerCase() as PreviewSection["alignment"];

  const discRaw = pick(map, ["Disclaimer Text", "Legal Description"]);
  const disclaimer =
    discRaw && map["Show Disclaimer"] !== "false" ? stripHtml(discRaw) : undefined;

  const message = pick(map, ["Error Body", "Voucher Error Text"]);
  const eyebrow = section.role ?? undefined;

  // Count cards across categories so a plan picker still classifies as "plans"
  // even when the first category happens to be empty.
  const totalCards = categories
    ? categories.reduce((n, c) => n + c.cards.length, 0)
    : cards.length;
  const kind = classifyKind(section, totalCards, message);

  // Background: the Select Background option (light / dark / branded). Peacock is
  // dark-first, so default to dark when unset.
  const bgRaw = (pick(map, ["Select Background", "Background"]) ?? "dark").toLowerCase();
  const background: PreviewSection["background"] =
    bgRaw.includes("light") ? "light" : bgRaw.includes("brand") ? "branded" : "dark";

  return {
    nodeId: section.id,
    kind,
    background,
    eyebrow,
    title,
    subtitle,
    alignment,
    disclaimer,
    message: kind === "message" ? message : undefined,
    cards,
    categories,
    items: totalCards ? [] : synthItems(kind),
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
