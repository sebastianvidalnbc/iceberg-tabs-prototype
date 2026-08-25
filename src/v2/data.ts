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
  | "pricing-option" // alias: a single cadence
  // --- Widget (retention service config) domain types --------------------
  | "widget-config" // a retention widget config root
  | "journey-flows" // Journey Flows authoring area
  | "offers" // Offers collection (80+ items)
  | "offer" // a single Offer
  | "segmentation" // an Offer's Segmentation area
  | "segment-names" // Segment Names collection under Segmentation
  | "segment-name" // a single Segment Name item
  | "survey-responses" // Survey Responses collection
  | "survey-response"; // a single Survey Response item

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
// The active major authoring context. Selecting it in App Nav swaps the dataset
// loaded into Explorer / Structure / Live Preview / Properties. The four-region
// architecture itself never changes.
export type AuthoringContext = "page" | "widget";

// V2-local App Nav model. The first two items are actionable and bound to an
// AuthoringContext (Pages / Widgets); the remaining items mirror the Iceberg IA
// but stay inert for now. Labels use Iceberg's plural terminology; longer labels
// wrap to two lines in the rail. Pages and Widgets lead because they are the two
// functional V2 authoring contexts.
export interface AppNavItem {
  id: string;
  label: string; // tooltip / aria-label / visible rail label
  context?: AuthoringContext; // present ⇒ actionable
}

export const V2_APP_NAV: AppNavItem[] = [
  { id: "nav-pages", label: "Pages", context: "page" },
  { id: "nav-widgets", label: "Widgets", context: "widget" },
  { id: "nav-content-pages", label: "Content Pages" },
  { id: "nav-event-pages", label: "Event Pages" },
  { id: "nav-central-mgmt", label: "Central Mgmt" },
  { id: "nav-qa-queue", label: "QA Queue" },
  { id: "nav-optimizely", label: "Optimizely" },
  { id: "nav-scheduled-pages", label: "Scheduled Pages" },
  { id: "nav-redirects", label: "Redirects" },
  { id: "nav-services-cms", label: "Services CMS" },
  { id: "nav-help", label: "Help" },
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
  { id: "faqs", label: "/faqs", type: "page", kind: "path", children: [] },
  {
    id: "offer",
    label: "/offer",
    type: "page",
    kind: "path",
    children: [
      { id: "offer-rokt", label: "/offer/rokt", type: "page", kind: "path" },
      { id: "offer-rokt-2mo", label: "/offer/rokt-2-months", type: "page", kind: "path" },
      { id: "offer-bravo", label: "/offer/bravo-insider-offer", type: "page", kind: "path" },
      { id: "offer-dish", label: "/offer/dish", type: "page", kind: "path" },
      { id: "offer-deportes", label: "/offer/deportes", type: "page", kind: "path" },
      { id: "offer-wof", label: "/offer/wheeloffortune", type: "page", kind: "path" },
      { id: "offer-livemaslive", label: "/offer/livemaslive", type: "page", kind: "path" },
      { id: "offer-premierleague", label: "/offer/premierleague", type: "page", kind: "path" },
      { id: "offer-spotify1", label: "/offer/spotifyoffer1", type: "page", kind: "path" },
      { id: "offer-cox", label: "/offer/cox-customer-offer", type: "page", kind: "path" },
      { id: "offer-peacock-2024", label: "/offer/peacock-2024", type: "page", kind: "path" },
    ],
  },
  {
    id: "instacart",
    label: "/instacart",
    type: "page",
    kind: "path",
    children: [
      { id: "instacart-limit", label: "/instacart/limit", type: "page", kind: "path" },
    ],
  },
  {
    id: "offer-terms",
    label: "/offer-terms",
    type: "page",
    kind: "path",
    children: [
      { id: "ot-rokt", label: "/offer-terms/rokt", type: "page", kind: "path" },
      { id: "ot-medical", label: "/offer-terms/medical-first-responder", type: "page", kind: "path" },
      { id: "ot-copamundial", label: "/offer-terms/copamundialannual", type: "page", kind: "path" },
      { id: "ot-crossgrade", label: "/offer-terms/crossgradegeneral", type: "page", kind: "path" },
      { id: "ot-teacher", label: "/offer-terms/teacher", type: "page", kind: "path" },
      { id: "ot-military", label: "/offer-terms/military", type: "page", kind: "path" },
      { id: "ot-student", label: "/offer-terms/student", type: "page", kind: "path" },
      { id: "ot-special", label: "/offer-terms/specialoffer", type: "page", kind: "path" },
      { id: "ot-select-annual", label: "/offer-terms/select-annual", type: "page", kind: "path" },
      { id: "ot-premiumupgrade", label: "/offer-terms/premiumupgrade", type: "page", kind: "path" },
      { id: "ot-marea", label: "/offer-terms/marea", type: "page", kind: "path" },
      { id: "ot-care", label: "/offer-terms/care", type: "page", kind: "path" },
      { id: "ot-adsales", label: "/offer-terms/adsales", type: "page", kind: "path" },
    ],
  },
  { id: "news", label: "/news", type: "page", kind: "path", children: [] },
  { id: "test", label: "/test", type: "page", kind: "path", children: [] },
  { id: "stream-movies", label: "/stream-movies", type: "page", kind: "path", children: [] },
];

// Default: no page/variant preselected route, but open on the richest variant
// so first paint shows a populated workspace.
export const DEFAULT_VARIANT_ID = "pg-0609"; // "0609 premium card test 2"

// --- Explorer: WIDGETS ------------------------------------------------------
// Widget context mirrors the Page shape at a smaller scale: a route tree whose
// leaves are configs (type: "variant" so Explorer treats them as selectable
// authored experiences), each config owning a Structure. This keeps the same
// Explorer/Structure/Preview/Properties machinery; only the dataset differs.
export const WIDGETS_TREE: TreeNode[] = [
  {
    id: "wg-what-is-peacock",
    label: "/what-is-peacock",
    type: "page",
    kind: "path",
    defaultExpanded: true,
    children: [
      { id: "wg-wip-punky", label: "stream-tv/punky-brewster -- 2.2", type: "variant" },
      { id: "wg-wip-blackboys", label: "stream-movies/black-boys -- 1.27 new url", type: "variant" },
      { id: "wg-wip-hitmen", label: "hitmen -- 7.21 updated_compressed_images", type: "variant" },
      { id: "wg-wip-brave", label: "brave-new-world -- 8.16 Evergreen Trailer Uploaded", type: "variant" },
      { id: "wg-wip-saved", label: "saved-by-the-bell -- 9.29 - AS", type: "variant" },
      { id: "wg-wip-babyboss", label: "stream-movies/boss-baby-2 -- 5.24 - launch (no index)", type: "variant" },
      { id: "wg-wip-miley", label: "stream-tv/miley-cyrus-presents-stand-by-you -- 6.16", type: "variant" },
      { id: "wg-wip-mrmercedes", label: "stream-tv/mr-mercedes -- 6.30 SEO Test", type: "variant" },
      { id: "wg-wip-manifest", label: "stream-tv/manifest -- 6.24 - remove free trial", type: "variant" },
      { id: "wg-wip-olympic", label: "stream-tv/olympic-highlights-kevin-hart-snoop-dogg -- 7.22 announcement", type: "variant" },
      { id: "wg-wip-trailerrail", label: "stream-tv/agt-americas-wildcard -- 8.10 launch", type: "variant" },
      { id: "wg-wip-labrea", label: "stream-tv/la-brea -- 9.12 - FINAL + indexed", type: "variant" },
      { id: "wg-wip-snl", label: "stream-tv/saturday-night-live -- 11.16 - Ep count updates", type: "variant" },
      { id: "wg-wip-collections", label: "collections -- 7.1 - July Refresh", type: "variant" },
      { id: "wg-wip-fivebedrooms", label: "stream-tv/five-bedrooms -- 8.5 - S2 AS", type: "variant" },
    ],
  },
  {
    id: "wg-seo-footer",
    label: "/seo-footer",
    type: "page",
    kind: "path",
    children: [
      { id: "wg-sf-pl-0715-01", label: "premierleague -- 20200715-01", type: "variant" },
      { id: "wg-sf-upgrade-0716-01", label: "upgrade -- 20200716-01", type: "variant" },
      { id: "wg-sf-pl-0716-03", label: "premierleague -- 20200716-03", type: "variant" },
      { id: "wg-sf-pl-current", label: "premierleague -- current-pl-ui-image", type: "variant" },
      { id: "wg-sf-upgrade-0716-03r", label: "upgrade -- 20200716-03-redirect", type: "variant" },
      { id: "wg-sf-pl-0715-02", label: "premierleague -- 20200715-02", type: "variant" },
      { id: "wg-sf-pl-0720-01", label: "premierleague -- 20200720-01", type: "variant" },
      { id: "wg-sf-home-prev", label: "home -- prev-published 1-1", type: "variant" },
      { id: "wg-sf-blackboys", label: "stream-movies/black-boys -- 1.27 new url", type: "variant" },
      { id: "wg-sf-lacrosse", label: "sports/premier-lacrosse-league -- publish", type: "variant" },
    ],
  },
  { id: "wg-pp-spanish-sports", label: "/plan-picker-spanish-sports", type: "page", kind: "path", children: [] },
  { id: "wg-remote-feature-flags", label: "/remote-feature-flags", type: "page", kind: "path", children: [] },
  { id: "wg-pp-partner", label: "/plan-picker-partner", type: "page", kind: "path", children: [] },
  { id: "wg-cp-pp-no-select", label: "/content-pages-plan-picker-no-select", type: "page", kind: "path", children: [] },
  { id: "wg-sports-premium-pp", label: "/sports-premium-plan-picker", type: "page", kind: "path", children: [] },
  { id: "wg-commerce-pp-premium", label: "/commerce-plan-picker-premium", type: "page", kind: "path", children: [] },
  { id: "wg-pp-copy-dr", label: "/plan-picker-copy-dr", type: "page", kind: "path", children: [] },
  { id: "wg-cp-pp-with-select", label: "/content-pages-plan-picker-with-select", type: "page", kind: "path", children: [] },
  { id: "wg-pp-select-sitewide", label: "/plan-picker-select-sitewide", type: "page", kind: "path", children: [] },
  { id: "wg-generic-student-banner", label: "/generic-student-discount-banner", type: "page", kind: "path", children: [] },
  { id: "wg-custom-robots-txt", label: "/custom-robots-txt", type: "page", kind: "path", children: [] },
  { id: "wg-qa-image-widget", label: "/qa-image-widget", type: "page", kind: "path", children: [] },
  { id: "wg-qa-bff-legal-bit", label: "/qa-sas-bff-smoke-legal-bit", type: "page", kind: "path", children: [] },
  { id: "wg-qa-bff-image", label: "/qa-sas-bff-smoke-image", type: "page", kind: "path", children: [] },
  { id: "wg-sports-offering-new", label: "/sports-offering-module-new", type: "page", kind: "path", children: [] },
  { id: "wg-qa-eng-legal-bit", label: "/qa-widget-eng-the-legal-bit", type: "page", kind: "path", children: [] },
  { id: "wg-trailer-rail", label: "/trailer-rail", type: "page", kind: "path", children: [] },
  { id: "wg-promotions-display", label: "/promotions-display-groups", type: "page", kind: "path", children: [] },
  {
    id: "wg-retention",
    label: "/retention-service-config-us",
    type: "page",
    kind: "path",
    children: [
      { id: "wg-qa-republish", label: "qa-republish-Copy of default", type: "variant" },
    ],
  },
];

// Default Widget config opened on first switch into Widget context.
export const DEFAULT_WIDGET_CONFIG_ID = "wg-qa-republish";

// --- Real Widget domain model (source of truth: src/v1 retention config) ----
// Rebuilt here as V2-native data (no import from src/v1). Structure nodes carry
// their objectType + an authored `props` payload so resolveWidgetPropertiesFor
// returns them verbatim — the same pattern canonical Page nodes use.

// Options reused across Offer / Survey Response forms (mirrors the V1 lists).
const OFFER_TYPES = ["Retention", "Winback", "Acquisition"];
const SURVEY_TYPES = ["Checkbox", "Radio", "Text"];
const SAVE_MOMENTS = ["Offer Save", "Confirm Save", "Immediate Save"];

// Real Offer segment names taken from the retention config. These seed the first
// rows so reviewers immediately recognise meaningful labels.
const REAL_SEGMENTS: string[] = [
  "US.CANCEL.40SAVED1YQ125",
  "US.CANCEL.50SAVED1YQ424",
  "US.CANCEL.60SAVED1YQ424",
  "US.CANCEL.70SAVED1YQ125",
  "US.CANCEL.299SAVED6MQ425WWE",
  "US.CANCEL.299SAVED6MQ425SOLO",
  "US.CANCEL.599SAVED6MQ425SOLO",
  "US.CANCEL.799SAVED6MQ425SOLO",
  "US.CANCEL.299SAVED6MQ425DUAL",
  "US.CANCEL.599SAVED6MQ425DUAL",
  "US.CANCEL.799SAVED6MQ425DUAL",
  "US.CANCEL.SAVECCG30D1YQ126SOLO",
  "US.CANCEL.SAVECCG50D1YQ126SOLO",
  "US.CANCEL.SAVECCG80D1YQ126SOLO",
  "US.CANCEL.SAVECCG30D1YQ126DUAL",
  "US.CANCEL.SAVECCG50D1YQ126DUAL",
  "US.CANCEL.SAVECCG80D1YQ126DUAL",
  "US.CANCEL.NOOFFER",
];

// Plain-data shape for an Offer. Kept separate from TreeNode so labels/filter
// keys can be derived without re-parsing the props payload.
interface OfferData {
  id: string;
  type: string;
  cancellationProductStaticId: string;
  segmentName: string;
  surveyResponseLabelKey: string;
  suppressDefaultOffer: boolean;
  productVoucher: string;
  voucherCode: string;
  segmentation: {
    offerType: string;
    categoryTitle: string;
    segmentNames: string[];
  };
}

const makeOffer = (
  segmentName: string,
  extras: Partial<OfferData> = {}
): OfferData => ({
  id: `of-${segmentName}`,
  type: "Retention",
  cancellationProductStaticId:
    extras.cancellationProductStaticId ?? "peacock_premium_monthly",
  segmentName,
  surveyResponseLabelKey: extras.surveyResponseLabelKey ?? "",
  suppressDefaultOffer: extras.suppressDefaultOffer ?? false,
  productVoucher: extras.productVoucher ?? "Peacock Premium",
  voucherCode: extras.voucherCode ?? segmentName.replace(/^US\.CANCEL\./, ""),
  segmentation: extras.segmentation ?? {
    offerType: "Retention",
    categoryTitle: "D2C",
    segmentNames: [],
  },
});

// Programmatically extend the real seeds up to 81 offers to demonstrate scale.
const OFFER_PATTERNS = ["SAVED1YQ", "SAVED6MQ", "SAVECCG", "WINBACK", "LOYALTY"];
const OFFER_PLANS = ["SOLO", "DUAL", "WWE", "PREMIUM", "PLUS"];

const buildOffers = (): OfferData[] => {
  const offers = REAL_SEGMENTS.map((s) => makeOffer(s));
  // Deep nested example on the first offer.
  offers[0].segmentation.segmentNames = [
    "US.CANCEL.40SAVED1YQ125",
    "US.CANCEL.50SAVED1YQ424",
    "US.CANCEL.60SAVED1YQ424",
    "US.CANCEL.70SAVED1YQ125",
  ];
  offers[0].surveyResponseLabelKey = "retention.survey.response.id.1";
  // A second, smaller nested example.
  offers[4].segmentation.segmentNames = [
    "US.CANCEL.299SAVED6MQ425WWE",
    "US.CANCEL.299SAVED6MQ425SOLO",
  ];
  // The NOOFFER row suppresses the default offer.
  const noOffer = offers.find((o) => o.segmentName.endsWith("NOOFFER"));
  if (noOffer) noOffer.suppressDefaultOffer = true;

  for (let i = offers.length; i < 81; i++) {
    const price = 199 + (i % 8) * 100;
    const pattern = OFFER_PATTERNS[i % OFFER_PATTERNS.length];
    const plan = OFFER_PLANS[i % OFFER_PLANS.length];
    offers.push(makeOffer(`US.CANCEL.${price}${pattern}${(i % 12) + 1}${plan}`));
  }
  return offers;
};

// Plain-data shape for a Survey Response.
interface SurveyResponseData {
  id: string;
  responseId: string;
  displayLabel: string;
  displayOrder: string;
  type: string;
  saveMoment: string;
  savePriority: string;
}

const SURVEY_LABELS = [
  "Too expensive",
  "Not watching enough",
  "Technical issues",
  "Found a better service",
  "Only wanted one show",
  "Content not available",
  "Temporary break",
  "Other",
];

const buildSurveyResponses = (): SurveyResponseData[] =>
  SURVEY_LABELS.map((displayLabel, i) => {
    const n = i + 1;
    return {
      id: `sr-${n}`,
      responseId: `retention.survey.response.id.${n}`,
      displayLabel,
      displayOrder: String(n),
      type: "Checkbox",
      saveMoment: "Offer Save",
      savePriority: String(n),
    };
  });

// --- Structure-node builders: attach objectType + authored props payload -----

const segmentNameNode = (offerId: string, name: string, i: number): StructureNode => ({
  id: `${offerId}-seg-${i}`,
  label: name || `Segment ${i + 1}`,
  objectType: "segment-name",
  props: {
    kind: "fields",
    data: {
      eyebrow: "SEGMENT NAME",
      name: name || `Segment ${i + 1}`,
      fields: [{ label: "Name", value: name }],
    },
  },
});

const segmentationNodes = (offer: OfferData): StructureNode[] => {
  const names = offer.segmentation.segmentNames;
  if (names.length === 0) return [];
  const segNameChildren = names.map((n, i) => segmentNameNode(offer.id, n, i));
  return [
    {
      id: `${offer.id}-segmentation`,
      label: "Segmentation",
      objectType: "segmentation",
      props: {
        kind: "fields",
        data: {
          eyebrow: "SEGMENTATION",
          name: "Segmentation",
          fields: [
            { label: "Offer Type", value: offer.segmentation.offerType },
            { label: "Category Title", value: offer.segmentation.categoryTitle },
            { label: "Segment Names", value: String(names.length) },
          ],
        },
      },
      children: [
        {
          id: `${offer.id}-segment-names`,
          label: "Segment Names",
          objectType: "segment-names",
          props: {
            kind: "collection",
            data: {
              eyebrow: "SEGMENT NAMES",
              name: "Segment Names",
              itemNoun: "Segment Name",
              items: segNameChildren.map((c) => ({ id: c.id, label: c.label })),
            },
          },
          children: segNameChildren,
        },
      ],
    },
  ];
};

const offerNode = (offer: OfferData): StructureNode => ({
  id: offer.id,
  label: offer.segmentName || offer.voucherCode || offer.id,
  objectType: "offer",
  props: {
    kind: "fields",
    data: {
      eyebrow: "OFFER",
      name: offer.segmentName || offer.voucherCode,
      groups: [
        { fields: [{ label: "Type", value: offer.type, kind: "select", options: OFFER_TYPES }] },
        {
          header: "IF CUSTOMER IS CANCELLING",
          fields: [
            {
              label: "Cancellation Product Static ID",
              value: offer.cancellationProductStaticId,
              required: true,
            },
            { label: "Segment Name", value: offer.segmentName },
            { label: "Survey Response Label Key", value: offer.surveyResponseLabelKey },
          ],
        },
        {
          header: "THEN SHOW",
          fields: [
            {
              label: "Suppress default offer",
              value: offer.suppressDefaultOffer ? "true" : "false",
              kind: "checkbox",
            },
            { label: "Product / Voucher", value: offer.productVoucher },
            { label: "Voucher Code", value: offer.voucherCode },
          ],
        },
      ],
    },
  },
  children: segmentationNodes(offer),
});

const surveyResponseNode = (sr: SurveyResponseData): StructureNode => ({
  id: sr.id,
  label: sr.responseId,
  objectType: "survey-response",
  props: {
    kind: "fields",
    data: {
      eyebrow: "SURVEY RESPONSE",
      name: sr.responseId,
      fields: [
        { label: "ID", value: sr.displayOrder },
        { label: "Display Label", value: sr.displayLabel },
        { label: "Display Order", value: sr.displayOrder },
        { label: "Type", value: sr.type, kind: "select", options: SURVEY_TYPES },
        { label: "Save Moment", value: sr.saveMoment, kind: "select", options: SAVE_MOMENTS },
        { label: "Save Priority", value: sr.savePriority },
      ],
    },
  },
});

// Journey Flow representative values (Widget-level scalar context).
const RETENTION_JOURNEY_FLOW = "Reminder > Content or Dual Plan > Content";
const QUICK_CANCEL_JOURNEY = "Confirm Cancel";
const IMMEDIATE_CANCEL_JOURNEY = "Plan Options";

// Assemble the canonical retention config Structure once at module load.
const RETENTION_OFFERS = buildOffers();
const RETENTION_SURVEY_RESPONSES = buildSurveyResponses();

const buildRetentionStructure = (): StructureNode[] => {
  const offerNodes = RETENTION_OFFERS.map(offerNode);
  const surveyNodes = RETENTION_SURVEY_RESPONSES.map(surveyResponseNode);
  return [
    {
      id: "wg-journey-flows",
      label: "Journey Flows",
      objectType: "journey-flows",
      defaultExpanded: true,
      props: {
        kind: "fields",
        data: {
          eyebrow: "JOURNEY FLOWS",
          name: "Journey Flows",
          fields: [
            { label: "Select Retention Journey Flow", value: RETENTION_JOURNEY_FLOW },
            { label: "Select Quick Cancel Journey", value: QUICK_CANCEL_JOURNEY },
            { label: "Select Immediate Cancel Journey", value: IMMEDIATE_CANCEL_JOURNEY },
          ],
        },
      },
    },
    {
      id: "wg-offers",
      label: "Offers",
      objectType: "offers",
      props: {
        kind: "collection",
        data: {
          eyebrow: "OFFERS",
          name: "Offers",
          itemNoun: "Offer",
          items: offerNodes.map((o) => ({ id: o.id, label: o.label })),
        },
      },
      children: offerNodes,
    },
    {
      id: "wg-survey-responses",
      label: "Survey Responses",
      objectType: "survey-responses",
      props: {
        kind: "collection",
        data: {
          eyebrow: "SURVEY RESPONSES",
          name: "Survey Responses",
          itemNoun: "Response",
          items: surveyNodes.map((s) => ({ id: s.id, label: s.label })),
        },
      },
      children: surveyNodes,
    },
  ];
};

// Lightweight lookup for the Offers structure filter (label + filter keys),
// keyed by offer node id. Keeps filtering out of the render path.
export const WIDGET_OFFER_FILTER_INDEX: Record<
  string,
  { label: string; keys: string }
> = Object.fromEntries(
  RETENTION_OFFERS.map((o) => [
    o.id,
    {
      label: o.segmentName || o.voucherCode || o.id,
      keys: [o.segmentName, o.voucherCode, o.cancellationProductStaticId]
        .join(" ")
        .toLowerCase(),
    },
  ])
);

export const WIDGET_STRUCTURES: Record<string, StructureNode[]> = {
  "wg-qa-republish": buildRetentionStructure(),
};

// Default selected Structure node per Widget config (mirrors Variant defaults).
export const WIDGET_DEFAULT_SELECTION: Record<string, string> = {
  "wg-qa-republish": "wg-journey-flows",
};

// The Offers collection node id (used by the shell to gate the Offers filter).
export const WIDGET_OFFERS_NODE_ID = "wg-offers";

// Widget preview payload, keyed by config id. Reuses PreviewData so LivePreview
// renders it with the existing neutral-tone template.
export const WIDGET_PREVIEWS: Record<string, PreviewData> = {
  "wg-qa-republish": {
    title: "Retention widget",
    subtitle: "/retention-service-config-us",
    tone: "neutral",
    body: "Preview of the retention service configuration. Select a Structure area to author its Journey Flows, Offers, Segmentation, or Survey Responses.",
  },
};

// The full Widget workspace record, keyed by config id (parallel to VARIANTS).
export const WIDGET_CONFIGS: Record<string, VariantWorkspace> = Object.fromEntries(
  Object.keys(WIDGET_STRUCTURES).map((id) => [
    id,
    {
      id,
      name: collectVariantNames(WIDGETS_TREE)[id] ?? id,
      structure: WIDGET_STRUCTURES[id],
      previewData: WIDGET_PREVIEWS[id],
      defaultSelectionId: WIDGET_DEFAULT_SELECTION[id],
    } satisfies VariantWorkspace,
  ])
);

export function getWidgetConfig(id: string | null): VariantWorkspace | null {
  return id ? WIDGET_CONFIGS[id] ?? null : null;
}

export function isWidgetConfigId(id: string): boolean {
  return id in WIDGET_CONFIGS;
}

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

// Resolves the Properties for a Structure node within a Widget config. Every
// Widget Structure node carries an authored `props` payload (attached by the
// builders above), so this returns it verbatim — object-type driven, never
// label-string matched. Falls back to a notice only for unmodelled nodes.
export function resolveWidgetPropertiesFor(
  configId: string,
  nodeId: string
): ResolvedProperties {
  const config = WIDGET_CONFIGS[configId];
  const node = config ? findNode(config.structure, nodeId) : null;
  if (node?.props) return node.props;
  return {
    kind: "notice",
    data: {
      eyebrow: "WIDGET AREA",
      name: node?.label ?? nodeId,
      message: "No configured content yet.",
      detail: "This retention widget area is not modelled in the V2 prototype yet.",
    },
  };
}

// Seeds the set of expanded node ids for a Variant's structure from its
// defaultExpanded flags (used to initialise per-Variant expansion memory).
export function seedExpandedFor(variantId: string): Set<string> {
  return seedExpandedFrom(VARIANTS[variantId]?.structure);
}

// Widget counterpart to seedExpandedFor, keyed by config id.
export function seedWidgetExpandedFor(configId: string): Set<string> {
  return seedExpandedFrom(WIDGET_CONFIGS[configId]?.structure);
}

// Shared expansion seeder for any Structure tree.
function seedExpandedFrom(structure: StructureNode[] | undefined): Set<string> {
  const acc = new Set<string>();
  if (structure) collect(structure);
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
