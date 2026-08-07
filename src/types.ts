// Underlying data model for the Iceberg CMS. Every repeated object is a labelled
// item in a collection; labels derive from a key field (see model.keyField).

export type CollectionKind = "variation" | "category" | "plan" | "feature" | "pricing";
export type PublishStatus = "draft" | "in-review" | "published";

export interface ProductFeature {
  id: string;
  disabled?: boolean;
  productFeatureIcon: string;
  productFeature: string;
}

export interface PricingOption {
  id: string;
  disabled?: boolean;
  offerDetail: string;
  buttonDescription: string;
  previousPrice: string;
  ariaLabel: string;
}

export interface PlanPickerData {
  id: string;
  disabled?: boolean;
  productLogo: string;
  badgeTitle: string;
  lowerCaseBadgeTitle: boolean;
  eyebrow: string;
  productTitleIcon: string;
  productTitle: string;
  productDescription: string;
  disclaimer: string;
  features: ProductFeature[];
  pricing: PricingOption[];
}

export interface VariantCategory {
  id: string;
  disabled?: boolean;
  categoryTitle: string;
  categoryQueryParameter: string;
  plans: PlanPickerData[];
  publishStatus: PublishStatus;
  lastModified: string;
}

// A content Variation is an existing Iceberg concept that sits ABOVE the Variant
// Categories tab redesign. It carries the section-level fields and owns its own
// set of Variant Categories.
export interface Variation {
  id: string;
  disabled?: boolean;
  name: string;
  includeAsRegion: boolean;
  planPickerTitle: string;
  subtitle: string;
  titleAlignment: string;
  enableHorizontalScroll: boolean;
  pickVariant: string;
  categories: VariantCategory[];
}

export interface Journey {
  id: string;
  name: string;
  variations: Variation[];
}

// Lightweight Section Options fields (the second primary top-level area). These
// mirror the real Iceberg Section Options controls; they are prototype context.
export interface SectionOptions {
  design: string;
  variantDesign: string;
  label: string;
  type: string;
  background: string;
  embedHeaders: boolean;
  mobileOverflow: boolean;
}

// A copied item held on the clipboard, tagged with its collection kind so it can
// only be pasted back into a compatible list.
export interface Clipboard {
  kind: CollectionKind;
  item: Variation | VariantCategory | PlanPickerData | ProductFeature | PricingOption;
}
