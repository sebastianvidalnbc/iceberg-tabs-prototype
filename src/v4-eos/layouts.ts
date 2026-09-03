// Layout catalog — the premade section templates the author stacks to build a
// page. This is the V4 analog of real Iceberg's layout registry (the `section`
// block of `core-next/schemas.ts`, served to the CMS "Layout Picker"). Every
// entry here is a REAL Iceberg section layout: the id/name/experiment flag come
// straight from the production schemas, and each `preview` points at the real
// Mobile/Desktop preview art shipped in the elements package (copied into
// public/layout-previews/**, proposition = nbcu/Peacock).
//
// A layout is a Section template; its editable fields come from the element
// registry (by objectType) and the seeded values live on each instance's
// `content`. The Layout Picker never mutates data — it asks this catalog for a
// fresh subtree, which the shell inserts at the chosen slot.
import type { IconName } from "./ui-lib/Icon";
import type { StructureNode, StructureObjectType } from "./data";
import { buildSectionFromSchema } from "./schemaModel";

// Fresh, collision-proof ids for every node in a newly built subtree.
let seq = 0;
const uid = (p: string): string =>
  `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

// Picker groups (a redesign nicety — the real picker is a flat A–Z list, but
// grouping the 40 layouts makes the catalog scannable). Search flattens these.
export type LayoutGroup =
  | "Plan Pickers"
  | "Content"
  | "Media & Grids"
  | "Commerce"
  | "Structure"
  | "Logic & Targeting";

// Real preview art shipped in the zip (filenames under public/layout-previews/).
// The real CMS shows Mobile + Desktop (or a single UI) image per layout.
export interface LayoutPreview {
  desktop?: string;
  mobile?: string;
  ui?: string;
}

export interface LayoutDef {
  id: string;
  name: string;
  description: string;
  group: LayoutGroup;
  icon: IconName;
  // Lifecycle badge shown in the picker (real Iceberg's `moduleStatus`). In prod
  // this is a per-artifact CMS override; here it follows the app's live config.
  experiment?: boolean;
  preview?: LayoutPreview;
  // Builds a fresh, pre-filled page-section subtree with unique ids.
  build: () => StructureNode;
}

// --- Subtree builders -------------------------------------------------------

// A section wrapping a single content-block module (Hero / Banner / FAQ …).
function contentSection(
  label: string,
  role: string,
  blockLabel: string,
  seed: Record<string, string>,
): StructureNode {
  const sectionId = uid("section");
  return {
    id: uid("sec"),
    label,
    objectType: "page-section",
    sectionId,
    role,
    design: "Custom",
    defaultExpanded: true,
    children: [
      { id: uid("cb"), label: blockLabel, objectType: "content-block", content: seed },
      {
        id: uid("so"),
        label: "Section Options",
        objectType: "section-options",
        design: "Custom",
      },
      { id: uid("bh"), label: "Behaviours", objectType: "behaviours" },
    ],
  };
}

// Generic section for a real layout we surface in the catalog but don't model
// field-by-field — drops a ready-to-edit, titled content section so insertion
// works and the tree stays consistent.
function simple(name: string): StructureNode {
  return contentSection(name, name, `${name} Content`, {
    Title: name,
    Subtitle: "Edit this section's content in the panel on the right.",
  });
}

// A product card with seeded content so it renders immediately in the preview.
function product(
  label: string,
  content: Record<string, string> = {},
): StructureNode {
  return {
    id: uid("prod"),
    label,
    objectType: "product",
    content: { "Product Title": label, ...content },
  };
}

// A full Plan Picker section: Section Content → Control → Categories → Plans →
// Products → three seeded plans, plus Section Options. Renders as a card grid.
// `maxPlans` mirrors the real layout's `tabsConfig.maxSize` for the plans tab
// (single-diff = 4, multi-diff = 5, …) so the cap is schema-accurate per layout.
function planPickerSection(name = "Plan Picker", maxPlans = 4): StructureNode {
  const sectionId = uid("section");
  return {
    id: uid("sec"),
    label: name,
    objectType: "page-section",
    sectionId,
    role: name,
    design: "Intelligent authoring",
    defaultExpanded: true,
    children: [
      {
        id: uid("sc"),
        label: "Section Content",
        objectType: "section-content",
        defaultExpanded: true,
        children: [
          {
            id: uid("ctrl"),
            label: "Control",
            objectType: "variation",
            defaultExpanded: true,
            content: { "Plan Picker Title": "Pick a Plan. Cancel Anytime." },
            children: [
              {
                id: uid("cats"),
                label: "Categories",
                objectType: "categories",
                defaultExpanded: true,
                children: [
                  {
                    id: uid("cat"),
                    label: "Plans",
                    objectType: "category",
                    defaultExpanded: true,
                    children: [
                      {
                        id: uid("prods"),
                        label: "Products",
                        objectType: "products",
                        maxChildren: maxPlans,
                        defaultExpanded: true,
                        children: [
                          product("Select"),
                          product("Premium", {
                            Badge: "true",
                            "Badge Text": "Best Value",
                            "Product Description":
                              "Everything in Select, plus live sports and next-day shows.",
                          }),
                          product("Premium Plus"),
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: uid("so"),
        label: "Section Options",
        objectType: "section-options",
        design: "Intelligent authoring",
      },
    ],
  };
}

// Schema-backed section: build the full field/collection tree from the REAL
// layout schema (so the panel exposes every field — product bullets, CTAs, etc.).
// Falls back to the hand-built plan picker if the schema id isn't present.
function schemaSection(
  schemaId: string,
  name: string,
  fallbackMaxPlans = 4,
): StructureNode {
  return (
    buildSectionFromSchema(schemaId, name, "Plan Picker") ??
    planPickerSection(name, fallbackMaxPlans)
  );
}

// A Footer section (content areas + options + behaviours), matching 0609.
function footerSection(name = "SEO Footer"): StructureNode {
  const sectionId = uid("section");
  return {
    id: uid("sec"),
    label: name,
    objectType: "page-section",
    sectionId,
    role: "Footer",
    design: "Custom",
    defaultExpanded: true,
    children: [
      { id: uid("cd"), label: "Desktop Content", objectType: "content-area" },
      { id: uid("cm"), label: "Mobile Content", objectType: "content-area" },
      {
        id: uid("so"),
        label: "Section Options",
        objectType: "section-options",
        design: "Custom",
      },
      { id: uid("bh"), label: "Behaviours", objectType: "behaviours" },
    ],
  };
}

// Preview helpers keyed to the copied art (public/layout-previews/<id>-*.png).
const dm = (id: string): LayoutPreview => ({
  desktop: `${id}-desktop.png`,
  mobile: `${id}-mobile.png`,
});
const uiOnly = (id: string): LayoutPreview => ({ ui: `${id}-ui.png` });

// --- The catalog ------------------------------------------------------------
// The full set of production Iceberg layouts (proposition = Peacock / NBCU).

export const LAYOUT_CATALOG: LayoutDef[] = [
  // ---- Plan Pickers --------------------------------------------------------
  {
    id: "plan-picker-single-diff",
    name: "Plan Picker - Single Difference",
    description:
      "Compare plans that differ on a single dimension. Plans tab caps at 4 (real tabsConfig.maxSize).",
    group: "Plan Pickers",
    icon: "grid",
    preview: dm("plan-picker-single-diff"),
    build: () =>
      schemaSection("section-ia-plan-picker-single-diff", "Plan Picker - Single Difference", 4),
  },
  {
    id: "plan-picker-multi-diff",
    name: "Plan Picker - Multi Difference",
    description: "Compare plans across several features. Plans tab caps at 5.",
    group: "Plan Pickers",
    icon: "grid",
    preview: dm("plan-picker-multi-diff"),
    build: () =>
      schemaSection("section-ia-plan-picker-multi-diff", "Plan Picker - Multi Difference", 5),
  },
  {
    id: "plan-picker-mini",
    name: "Plan Picker - Mini Picker",
    description: "A compact plan selector for tight spaces.",
    group: "Plan Pickers",
    icon: "grid",
    preview: dm("plan-picker-mini"),
    build: () =>
      schemaSection("section-ia-plan-picker-mini-picker", "Plan Picker - Mini Picker", 4),
  },
  {
    id: "plan-picker-dual-mini",
    name: "Plan Picker - Dual Mini Picker",
    description: "Two mini pickers side by side for toggled offers.",
    group: "Plan Pickers",
    icon: "grid",
    preview: dm("plan-picker-dual-mini"),
    build: () =>
      schemaSection("section-ia-plan-picker-dual-mini-picker", "Plan Picker - Dual Mini Picker", 4),
  },
  {
    id: "plan-picker-graphic-radio",
    name: "Plan Picker - Graphic Radio",
    description: "Graphic radio cards for selecting a plan.",
    group: "Plan Pickers",
    icon: "grid",
    preview: dm("plan-picker-graphic-radio"),
    build: () =>
      schemaSection("section-ia-plan-picker-graphic-radio", "Plan Picker - Graphic Radio", 4),
  },
  {
    id: "plan-picker-plan-builder",
    name: "Plan Picker - Plan Builder",
    description: "Let customers assemble a plan from add-on tiles.",
    group: "Plan Pickers",
    icon: "grid",
    preview: {
      desktop: "plan-picker-plan-builder-desktop.png",
      mobile: "plan-picker-plan-builder-mobile.png",
      ui: "plan-picker-plan-builder-ui.png",
    },
    build: () =>
      schemaSection("section-ia-plan-builder", "Plan Picker - Plan Builder", 6),
  },
  {
    id: "plan-picker-cta",
    name: "Plan Picker with CTAs",
    description: "Plan cards with prominent per-plan call-to-action buttons.",
    group: "Plan Pickers",
    icon: "grid",
    preview: dm("plan-picker-cta"),
    build: () =>
      schemaSection("section-ia-plan-picker-cta", "Plan Picker with CTAs", 4),
  },

  // ---- Content -------------------------------------------------------------
  {
    id: "hero",
    name: "Hero",
    description: "A full-bleed headline band with supporting copy and a CTA.",
    group: "Content",
    icon: "image",
    preview: dm("hero"),
    build: () =>
      contentSection("Hero", "Hero", "Hero Content", {
        Title: "Your headline goes here",
        Subtitle: "Add supporting copy that sets up the offer.",
        "Primary CTA": "Primary",
        "Primary CTA Text": "Get started",
      }),
  },
  {
    id: "content-banner",
    name: "Content Banner",
    description: "A promotional message band for offers and announcements.",
    group: "Content",
    icon: "doc-text",
    preview: dm("content-banner"),
    build: () =>
      contentSection("Content Banner", "Content Banner", "Banner Content", {
        Title: "Limited-time offer",
        Subtitle: "Describe the promotion in a sentence.",
        "Primary CTA": "Primary",
        "Primary CTA Text": "Learn more",
      }),
  },
  {
    id: "banner",
    name: "Banner",
    description: "A lightweight banner for messaging or upsell.",
    group: "Content",
    icon: "doc-text",
    experiment: true,
    preview: dm("banner"),
    build: () => simple("Banner"),
  },
  {
    id: "countdown",
    name: "Countdown",
    description: "A ticking countdown to a launch, price rise, or event.",
    group: "Content",
    icon: "clock",
    preview: dm("countdown"),
    build: () => simple("Countdown"),
  },
  {
    id: "key-art-synopsis",
    name: "Key Art & Synopsis",
    description: "Title key art paired with a synopsis and metadata.",
    group: "Content",
    icon: "image",
    preview: dm("key-art-synopsis"),
    build: () => simple("Key Art & Synopsis"),
  },
  {
    id: "text-tcs",
    name: "Text & TCs",
    description: "Rich text block for terms, conditions, and legal copy.",
    group: "Content",
    icon: "doc-text",
    preview: dm("text-tcs"),
    build: () => simple("Text & TCs"),
  },
  {
    id: "faqs",
    name: "FAQ's",
    description: "An expandable list of questions and answers.",
    group: "Content",
    icon: "help",
    preview: dm("faqs"),
    build: () =>
      contentSection("FAQ's", "FAQ", "FAQ Content", {
        Title: "Frequently asked questions",
        Subtitle: "Answer the questions that block sign-up.",
      }),
  },
  {
    id: "highlights",
    name: "Highlights",
    description: "A carousel of highlight cards showcasing key benefits.",
    group: "Content",
    icon: "star",
    preview: dm("highlights"),
    build: () => simple("Highlights"),
  },

  // ---- Media & Grids -------------------------------------------------------
  {
    id: "carousel",
    name: "Carousel",
    description: "A scrollable row of recommended titles or collections.",
    group: "Media & Grids",
    icon: "blocks",
    experiment: true,
    preview: dm("carousel"),
    build: () => simple("Carousel"),
  },
  {
    id: "cast-layout",
    name: "Cast Layout",
    description: "A grid of cast members with headshots and names.",
    group: "Media & Grids",
    icon: "grid",
    preview: dm("cast-layout"),
    build: () => simple("Cast Layout"),
  },
  {
    id: "content-grid",
    name: "Content Grid",
    description: "A responsive grid of content thumbnails.",
    group: "Media & Grids",
    icon: "grid",
    preview: dm("content-grid"),
    build: () => simple("Content Grid"),
  },
  {
    id: "content-promotional-rail",
    name: "Content Promotional Rail",
    description: "A promotional rail of featured content tiles.",
    group: "Media & Grids",
    icon: "blocks",
    preview: dm("content-promotional-rail"),
    build: () => simple("Content Promotional Rail"),
  },
  {
    id: "filtered-grid",
    name: "Filtered Grid",
    description: "A content grid with genre / category filters.",
    group: "Media & Grids",
    icon: "grid",
    preview: dm("filtered-grid"),
    build: () => simple("Filtered Grid"),
  },
  {
    id: "logo-grid",
    name: "Logo Grid",
    description: "A grid of partner or channel logos.",
    group: "Media & Grids",
    icon: "grid",
    preview: dm("logo-grid"),
    build: () => simple("Logo Grid"),
  },
  {
    id: "sle-carousel",
    name: "SLE Carousel",
    description: "A single-live-event carousel with schedule tiles.",
    group: "Media & Grids",
    icon: "blocks",
    preview: dm("sle-carousel"),
    build: () => simple("SLE Carousel"),
  },
  {
    id: "seasons-episodes",
    name: "Seasons/Episodes List",
    description: "A seasons and episodes browser for a series.",
    group: "Media & Grids",
    icon: "blocks",
    preview: dm("seasons-episodes"),
    build: () => simple("Seasons/Episodes List"),
  },
  {
    id: "catalogue",
    name: "Catalogue",
    description: "An IA catalogue browse layout with SEO metadata.",
    group: "Media & Grids",
    icon: "grid",
    preview: dm("catalogue"),
    build: () => simple("Catalogue"),
  },
  {
    id: "channels-guide",
    name: "Channels Guide",
    description: "A live channels guide with schedule.",
    group: "Media & Grids",
    icon: "blocks",
    preview: dm("channels-guide"),
    build: () => simple("Channels Guide"),
  },
  {
    id: "comparison-table",
    name: "Comparison Table",
    description: "A feature-by-feature comparison table.",
    group: "Media & Grids",
    icon: "grid",
    preview: dm("comparison-table"),
    build: () => simple("Comparison Table"),
  },
  {
    id: "comparison-table-modal",
    name: "Comparison table - Modal",
    description: "A comparison table presented inside a modal.",
    group: "Media & Grids",
    icon: "grid",
    preview: dm("comparison-table-modal"),
    build: () => simple("Comparison table - Modal"),
  },

  // ---- Commerce ------------------------------------------------------------
  {
    id: "incremental-add-ons",
    name: "Incremental Add-Ons",
    description: "Upsell add-on tiles layered onto a base plan.",
    group: "Commerce",
    icon: "cube",
    preview: dm("incremental-add-ons"),
    build: () => simple("Incremental Add-Ons"),
  },
  {
    id: "payment-options",
    name: "Payment Options Template",
    description: "Selectable payment methods and cadences.",
    group: "Commerce",
    icon: "sliders",
    preview: dm("payment-options"),
    build: () => simple("Payment Options Template"),
  },
  {
    id: "paid-sharing",
    name: "Paid Sharing",
    description: "Paid account-sharing add-on flow.",
    group: "Commerce",
    icon: "cube",
    preview: dm("paid-sharing"),
    build: () => simple("Paid Sharing"),
  },
  {
    id: "sticky-basket",
    name: "Sticky Basket",
    description: "A persistent basket summary that sticks on scroll.",
    group: "Commerce",
    icon: "clipboard-check",
    preview: dm("sticky-basket"),
    build: () => simple("Sticky Basket"),
  },
  {
    id: "mlb-lookup",
    name: "MLB Lookup",
    description: "MLB team lookup for regional sports entitlement.",
    group: "Commerce",
    icon: "trophy",
    preview: dm("mlb-lookup"),
    build: () => simple("MLB Lookup"),
  },
  {
    id: "regional-sports-network",
    name: "Regional Sports Network",
    description: "RSN entitlement and team-network cards.",
    group: "Commerce",
    icon: "trophy",
    preview: dm("regional-sports-network"),
    build: () => simple("Regional Sports Network"),
  },

  // ---- Structure -----------------------------------------------------------
  {
    id: "seo-footer",
    name: "SEO Footer",
    description: "Footer navigation and legal content areas.",
    group: "Structure",
    icon: "file",
    preview: dm("seo-footer"),
    build: () => footerSection("SEO Footer"),
  },
  {
    id: "sub-navigation",
    name: "Sub-Navigation",
    description: "An in-page sub-navigation / anchor bar.",
    group: "Structure",
    icon: "redirect",
    preview: dm("sub-navigation"),
    build: () => simple("Sub-Navigation"),
  },
  {
    id: "steps",
    name: "Steps",
    description: "A numbered how-it-works / supported-devices sequence.",
    group: "Structure",
    icon: "blocks",
    preview: dm("steps"),
    build: () => simple("Steps"),
  },

  // ---- Logic & Targeting ---------------------------------------------------
  {
    id: "audience-selection",
    name: "Audience Selection",
    description: "Route audiences by query parameters to different content.",
    group: "Logic & Targeting",
    icon: "flask",
    preview: uiOnly("audience-selection"),
    build: () => simple("Audience Selection"),
  },
  {
    id: "experiment",
    name: "Experiment",
    description: "An A/B decider that splits traffic between variations.",
    group: "Logic & Targeting",
    icon: "flask",
    preview: uiOnly("experiment"),
    build: () => simple("Experiment"),
  },
  {
    id: "segment-targeting",
    name: "Segment Targeting",
    description: "A roadblock that targets specific customer segments.",
    group: "Logic & Targeting",
    icon: "flask",
    preview: uiOnly("segment-targeting"),
    build: () => simple("Segment Targeting"),
  },
  {
    id: "personalisation",
    name: "Personalisation",
    description: "Personalised content driven by customer signals.",
    group: "Logic & Targeting",
    icon: "sparkles",
    // No preview art ships for this layout (matches production's "No preview").
    build: () => simple("Personalisation"),
  },
];

export function getLayoutDef(id: string): LayoutDef | undefined {
  return LAYOUT_CATALOG.find((l) => l.id === id);
}

// --- Container child factory ------------------------------------------------
// Instantiates a fresh child instance for a container's "Add {itemNoun}" action
// (the tabs "push empty tab" analog). The element's SCHEMA supplies the fields;
// a friendly default label seeds a recognisable card/row immediately.
const CHILD_LABELS: Partial<Record<StructureObjectType, string>> = {
  product: "New plan",
  plan: "New plan",
  feature: "New feature",
  cadence: "New cadence",
  "pricing-option": "New cadence",
  category: "New category",
  variation: "New variation",
};

export function createChildNode(type: StructureObjectType): StructureNode {
  const label = CHILD_LABELS[type] ?? "New item";
  const node: StructureNode = { id: uid("new"), label, objectType: type };
  // Seed a product's title so its preview card is legible on creation.
  if (type === "product" || type === "plan") {
    node.content = { "Product Title": label };
  }
  return node;
}
