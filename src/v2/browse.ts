// V2 browse layer — PRESENTATION-ONLY derivation for the two list levels that
// sit above the editor, mirroring real Iceberg's flow:
//   Pages list  ─click slug▶  Variants list  ─click variant▶  Editor
// Everything here is derived from the existing PAGES_TREE / VARIANTS. No
// data-model changes: the extra columns real Iceberg shows (status, dates, QA,
// publish, last-modified-by) are SAMPLE metadata generated deterministically
// from each node id, so the tables look realistic without inventing a schema.
import { PAGES_TREE, VARIANTS, type TreeNode } from "./data";

// --- Deterministic sample-metadata helpers ---------------------------------
// A stable hash so the same id always yields the same sample values (no random
// churn across renders / reloads). Prototype-only.
function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return h;
}

const EDITORS = [
  "Constantino, Bella",
  "Bueno, Fernanda",
  "Collins, Morgan",
  "Vidal, Sebastian",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

// A fake but stable "MMM DD" date derived from the id.
function sampleDate(id: string, salt: number): string {
  const h = hash(id + salt);
  const day = (h % 27) + 1;
  const month = MONTHS[h % MONTHS.length];
  return `${month} ${day} 26`;
}

// A fake but stable relative "modified" string.
function sampleModified(id: string): string {
  const h = hash(id + "mod");
  const opts = ["3 hours ago", "3 days ago", "12 days ago", "a month ago"];
  return opts[h % opts.length];
}

export type PageStatus = "Draft" | "Published";
export type Visibility = "Visible" | "Hidden";

// --- Slug rows (Pages level) -----------------------------------------------
// One row per page node. `depth` drives indentation; `childCount` shows how many
// sub-pages a slug owns; `variantCount` (when > 0) means the row is a leaf that
// owns Variants and is therefore clickable through to the Variants view.
export interface SlugRow {
  id: string;
  slug: string;
  depth: number;
  hasChildren: boolean;
  childCount: number;
  variantCount: number;
  status: PageStatus;
  visibility: Visibility;
  unpublishDate: string | null;
  created: string;
  modified: string;
}

function variantChildCount(node: TreeNode): number {
  return (node.children ?? []).filter((c) => c.type === "variant").length;
}

function pageChildCount(node: TreeNode): number {
  return (node.children ?? []).filter((c) => c.type !== "variant").length;
}

function toSlugRow(node: TreeNode, depth: number): SlugRow {
  const variantCount = variantChildCount(node);
  const h = hash(node.id);
  return {
    id: node.id,
    slug: node.label,
    depth,
    hasChildren: pageChildCount(node) > 0,
    childCount: pageChildCount(node),
    variantCount,
    status: variantCount > 0 || h % 3 === 0 ? "Published" : "Draft",
    visibility: h % 4 === 0 ? "Hidden" : "Visible",
    unpublishDate: h % 5 === 0 ? sampleDate(node.id, 7) : null,
    created: variantCount > 0 || h % 2 === 0 ? sampleDate(node.id, 1) : "—",
    modified: variantCount > 0 || h % 2 === 0 ? sampleModified(node.id) : "—",
  };
}

// Flattens PAGES_TREE into ordered slug rows. Only page nodes become rows;
// variant nodes are summarised via variantCount on their parent page row.
export function buildSlugRows(): SlugRow[] {
  const rows: SlugRow[] = [];
  const walk = (nodes: TreeNode[], depth: number) => {
    for (const node of nodes) {
      if (node.type === "variant") continue;
      rows.push(toSlugRow(node, depth));
      if (node.children) walk(node.children, depth + 1);
    }
  };
  walk(PAGES_TREE, 0);
  return rows;
}

// Look up a single page node (for the Variants view header + breadcrumb).
export function findPageNode(id: string): TreeNode | null {
  let found: TreeNode | null = null;
  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      if (node.id === id) found = node;
      if (node.children) walk(node.children);
    }
  };
  walk(PAGES_TREE);
  return found;
}

// --- Variant rows (Variants level) -----------------------------------------
export interface VariantRow {
  id: string;
  name: string;
  qaStatus: "Approved" | "In review" | "—";
  optimizely: boolean;
  published: boolean;
  scheduled: string;
  unpublished: string;
  created: string;
  lastModified: string;
  lastModifiedBy: string;
}

function toVariantRow(node: TreeNode): VariantRow {
  const h = hash(node.id);
  const known = !!VARIANTS[node.id];
  return {
    id: node.id,
    name: node.label,
    qaStatus: h % 3 === 0 ? "Approved" : h % 3 === 1 ? "In review" : "—",
    optimizely: h % 2 === 0,
    published: h % 4 === 0,
    scheduled: "not scheduled",
    unpublished: "not scheduled",
    created: sampleDate(node.id, 2),
    lastModified: known ? sampleModified(node.id) : sampleDate(node.id, 3),
    lastModifiedBy: EDITORS[h % EDITORS.length],
  };
}

// All variant rows owned by a given page node.
export function buildVariantRows(pageId: string): VariantRow[] {
  const page = findPageNode(pageId);
  if (!page) return [];
  return (page.children ?? [])
    .filter((c) => c.type === "variant")
    .map(toVariantRow);
}

// Find the page node that owns a given variant id (for breadcrumbs + deep links
// straight to the editor).
export function findPageForVariant(variantId: string): TreeNode | null {
  let found: TreeNode | null = null;
  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      if ((node.children ?? []).some((c) => c.id === variantId && c.type === "variant")) {
        found = node;
      }
      if (node.children) walk(node.children);
    }
  };
  walk(PAGES_TREE);
  return found;
}

// --- Routes ----------------------------------------------------------------
// The V2 app has three views expressed as hash routes so navigation is
// linkable and the browser back button works:
//   #/pages              → Pages list (default)
//   #/pages/:pageId      → Variants list for that page
//   #/editor/:variantId  → the editor workspace
export type V2Route =
  | { view: "pages" }
  | { view: "variants"; pageId: string }
  | { view: "editor"; variantId: string };

export const routes = {
  pages: () => "#/pages",
  variants: (pageId: string) => `#/pages/${pageId}`,
  editor: (variantId: string) => `#/editor/${variantId}`,
};

// Parse a location.hash into a V2Route. Unknown/empty → the Pages list.
export function parseRoute(hash: string): V2Route {
  const clean = hash.replace(/^#\/?/, "");
  const [head, tail] = clean.split("/");
  if (head === "editor" && tail) return { view: "editor", variantId: tail };
  if (head === "pages" && tail) return { view: "variants", pageId: tail };
  return { view: "pages" };
}

export function navigate(hash: string) {
  window.location.hash = hash;
}
