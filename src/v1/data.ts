import type {
  Journey,
  PageMeta,
  PlanPickerData,
  PricingOption,
  ProductFeature,
  PublishStatus,
  SectionOptions,
  SiblingSection,
  VariantCategory,
  Variation,
} from "./types";

let counter = 1000;
export const uid = (prefix = "id"): string => `${prefix}_${(counter++).toString(36)}`;

const feature = (icon: string, text: string): ProductFeature => ({
  id: uid("ft"),
  productFeatureIcon: icon,
  productFeature: text,
});

const price = (
  offerDetail: string,
  buttonDescription: string,
  previousPrice: string,
  ariaLabel: string
): PricingOption => ({
  id: uid("pr"),
  offerDetail,
  buttonDescription,
  previousPrice,
  ariaLabel,
});

const plan = (
  title: string,
  badge: string,
  description: string,
  features: ProductFeature[],
  pricing: PricingOption[]
): PlanPickerData => ({
  id: uid("pl"),
  productLogo: "peacock-logo",
  badgeTitle: badge,
  lowerCaseBadgeTitle: false,
  eyebrow: "",
  productTitleIcon: "",
  productTitle: title,
  productDescription: description,
  disclaimer: "",
  features,
  pricing,
});

// The three plans shown in the spec, with the realistic sample feature/pricing
// text. Fresh ids are generated on every call so each category owns its own.
const specPlans = (): PlanPickerData[] => [
  plan(
    "Premium",
    "Best Value",
    "Ad-supported access to all of Peacock.",
    [
      feature("star", "TV Favorites from NBC, Bravo & More"),
      feature("trophy", "Live Sports"),
      feature("download", "Downloads"),
    ],
    [
      price("Annual — $99.99/yr", "Billed once annually", "$119.99", "Select the annual plan"),
      price("Monthly — $11.99/mo", "Billed every month", "", "Select the monthly plan"),
    ]
  ),
  plan(
    "Premium Plus",
    "Most Popular",
    "Ad-free, with downloads and your local NBC channel.",
    [
      feature("star", "TV Favorites from NBC, Bravo & More"),
      feature("trophy", "Live Sports"),
      feature("download", "Downloads"),
    ],
    [
      price("Annual — $139.99/yr", "Billed once annually", "$169.99", "Select the annual plan"),
      price("Monthly — $16.99/mo", "Billed every month", "", "Select the monthly plan"),
    ]
  ),
  plan(
    "Sports",
    "New",
    "Everything in Premium Plus plus premium sports.",
    [
      feature("trophy", "Live Sports"),
      feature("star", "TV Favorites from NBC, Bravo & More"),
    ],
    [price("Annual — $179.99/yr", "Billed once annually", "$199.99", "Select the sports plan")]
  ),
];

const category = (
  title: string,
  query: string,
  status: PublishStatus,
  lastModified: string,
  plans: PlanPickerData[]
): VariantCategory => ({
  id: uid("ct"),
  categoryTitle: title,
  categoryQueryParameter: query,
  plans,
  publishStatus: status,
  lastModified,
});

// The Variant Categories shown in the spec: a full "Plans" category and a
// lighter "Bundles" category.
const specCategories = (): VariantCategory[] => [
  category("Plans", "plans", "published", "2026-02-18 14:03", specPlans()),
  category("Bundles", "bundles", "draft", "2026-02-16 16:55", [
    plan(
      "Sports Bundle",
      "Save 20%",
      "Peacock Premium Plus with the Sports add-on.",
      [feature("trophy", "Live Sports")],
      [price("Annual — $179.99/yr", "Billed once annually", "$199.99", "Select the sports bundle")]
    ),
  ]),
];

const variation = (name: string, categories: VariantCategory[]): Variation => ({
  id: uid("vr"),
  name,
  includeAsRegion: true,
  planPickerTitle: "Pick a Plan. Cancel Anytime.",
  subtitle: "",
  titleAlignment: "Centre",
  enableHorizontalScroll: false,
  pickVariant: "Button Variant",
  categories,
});

// This scenario deliberately ships a single "Control" variation. `variations` is
// still an ordered, sortable list and every Add/Duplicate/Paste/reorder action
// works on it, so additional variations can be seeded or authored at any time —
// only the seed data is scoped down, not the architecture.
export const seedJourney = (): Journey => ({
  id: uid("jn"),
  name: "Premium card first test",
  variations: [variation("Control", specCategories())],
});

export const seedSectionOptions = (): SectionOptions => ({
  design: "Intelligent authoring",
  variantDesign: "Plan",
  label: "Control",
  type: "Modules",
  background: "Dark",
  embedHeaders: true,
  mobileOverflow: false,
});

const sibling = (name: string, status: PublishStatus): SiblingSection => ({
  id: uid("sec"),
  name,
  sectionId: uid("sid"),
  status,
});

// The page that owns the sections. In the real CMS the target section sits among
// sibling sections under a page URL; those siblings are collapsed placeholders.
export const seedPage = (): PageMeta => ({
  url: "/plans/all-monthly",
  pageId: "0609",
  status: "published",
  siblingsBefore: [sibling("Title", "published"), sibling("See What", "draft")],
  siblingsAfter: [sibling("FAQ", "draft")],
});
