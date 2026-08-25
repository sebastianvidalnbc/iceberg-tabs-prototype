// V2 browse layer — PRESENTATION-ONLY derivation for the two list levels that
// sit above the editor, mirroring real Iceberg's flow:
//   Pages list  ─click slug▶  Variants list  ─click variant▶  Editor
// Everything here is derived from the existing PAGES_TREE / VARIANTS. No
// data-model changes: the extra columns real Iceberg shows (status, dates, QA,
// publish, last-modified-by) are SAMPLE metadata generated deterministically
// from each node id, so the tables look realistic without inventing a schema.
import { PAGES_TREE, WIDGETS_TREE, VARIANTS, type TreeNode } from "./data";

// The browse layer serves two parallel collection contexts that share identical
// table machinery: Pages (PAGES_TREE) and Widgets (WIDGETS_TREE). A single
// BrowseContext discriminator selects the source tree, the route base, and the
// list titles so PagesView/VariantsView render either without duplication.
export type BrowseContext = "page" | "widget";

function treeFor(context: BrowseContext): TreeNode[] {
  return context === "widget" ? WIDGETS_TREE : PAGES_TREE;
}

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

// Flattens a collection tree into ordered slug rows. Only page nodes become
// rows; variant nodes are summarised via variantCount on their parent page row.
// Defaults to the Pages tree so existing callers are unaffected.
export function buildSlugRows(context: BrowseContext = "page"): SlugRow[] {
  const rows: SlugRow[] = [];
  const walk = (nodes: TreeNode[], depth: number) => {
    for (const node of nodes) {
      if (node.type === "variant") continue;
      rows.push(toSlugRow(node, depth));
      if (node.children) walk(node.children, depth + 1);
    }
  };
  walk(treeFor(context), 0);
  return rows;
}

// Look up a single page/widget node (for the Variants view header + breadcrumb).
export function findPageNode(
  id: string,
  context: BrowseContext = "page"
): TreeNode | null {
  let found: TreeNode | null = null;
  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      if (node.id === id) found = node;
      if (node.children) walk(node.children);
    }
  };
  walk(treeFor(context));
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

// All variant rows owned by a given page/widget node.
export function buildVariantRows(
  pageId: string,
  context: BrowseContext = "page"
): VariantRow[] {
  const page = findPageNode(pageId, context);
  if (!page) return [];
  return (page.children ?? [])
    .filter((c) => c.type === "variant")
    .map(toVariantRow);
}

// --- Widget rows (single inline-expandable list) ---------------------------
// Real Iceberg's Widgets screen is ONE list: each widget slug expands inline to
// reveal the entries it owns (rendered under a "Pages:" label), rather than
// navigating to a separate page. We mirror that UX here by surfacing each
// widget slug together with its existing config children (reusing the current
// data — no new "pages-under-widget" relationship). Clicking a child opens the
// editor.
export interface WidgetChildRow {
  id: string;
  name: string;
  status: PageStatus;
}

export interface WidgetRow {
  id: string;
  slug: string;
  status: PageStatus;
  created: string;
  modified: string;
  children: WidgetChildRow[];
}

// Top-level widget slugs with their inline-expandable children. Only top-level
// page nodes of WIDGETS_TREE become widget rows; their `variant` children map
// to the expandable child rows.
export function buildWidgetRows(): WidgetRow[] {
  return WIDGETS_TREE.filter((n) => n.type !== "variant").map((node) => {
    const h = hash(node.id);
    const children: WidgetChildRow[] = (node.children ?? [])
      .filter((c) => c.type === "variant")
      .map((c) => ({
        id: c.id,
        name: c.label,
        status: hash(c.id) % 4 === 0 ? "Published" : "Draft",
      }));
    return {
      id: node.id,
      slug: node.label,
      status: h % 3 === 0 ? "Draft" : "Published",
      created: sampleDate(node.id, 1),
      modified: sampleModified(node.id),
      children,
    };
  });
}

// Find the page/widget node that owns a given variant id, searching the given
// context's tree (for breadcrumbs + deep links straight to the editor).
export function findPageForVariant(
  variantId: string,
  context: BrowseContext = "page"
): TreeNode | null {
  let found: TreeNode | null = null;
  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      if ((node.children ?? []).some((c) => c.id === variantId && c.type === "variant")) {
        found = node;
      }
      if (node.children) walk(node.children);
    }
  };
  walk(treeFor(context));
  return found;
}

// --- Routes ----------------------------------------------------------------
// The V2 app expresses navigation as linkable hash routes so the browser back
// button works. Pages use a two-level browse-then-edit flow; Widgets are a
// single inline-expandable list (matching real Iceberg's Widgets screen):
//   #/pages                    → Pages list (default)
//   #/pages/:pageId             → Variants list for that page
//   #/widgets                   → Widgets list (rows expand inline; no sub-route)
//   #/editor/:context/:id       → the editor workspace, opened in a specific
//                                 authoring context ("page" | "widget") so the
//                                 breadcrumb + Structure tree reflect where the
//                                 author came from. A legacy 2-segment form
//                                 (#/editor/:id) is still parsed as page context.
export type V2Route =
  | { view: "pages" }
  | { view: "variants"; pageId: string }
  | { view: "widgets" }
  | { view: "editor"; context: BrowseContext; variantId: string };

export const routes = {
  pages: () => "#/pages",
  variants: (pageId: string) => `#/pages/${pageId}`,
  widgets: () => "#/widgets",
  editor: (context: BrowseContext, variantId: string) =>
    `#/editor/${context}/${variantId}`,
};

// Parse a location.hash into a V2Route. Unknown/empty → the Pages list.
export function parseRoute(hash: string): V2Route {
  const clean = hash.replace(/^#\/?/, "");
  const [head, seg1, seg2] = clean.split("/");
  if (head === "editor" && seg1) {
    // #/editor/:context/:id when the first segment is a known context;
    // otherwise treat the legacy #/editor/:id form as page context.
    if ((seg1 === "page" || seg1 === "widget") && seg2) {
      return { view: "editor", context: seg1, variantId: seg2 };
    }
    return { view: "editor", context: "page", variantId: seg1 };
  }
  if (head === "widgets") return { view: "widgets" };
  if (head === "pages" && seg1) return { view: "variants", pageId: seg1 };
  return { view: "pages" };
}

export function navigate(hash: string) {
  window.location.hash = hash;
}
