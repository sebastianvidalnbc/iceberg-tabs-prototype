// Underlying data model for the Iceberg CMS. Every repeated object is a labelled
// item in a collection; labels derive from a key field (see model.keyField).

export type CollectionKind = "category" | "plan" | "feature" | "pricing";
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

export interface Journey {
  id: string;
  name: string;
  categories: VariantCategory[];
}

// A copied item held on the clipboard, tagged with its collection kind so it can
// only be pasted back into a compatible list.
export interface Clipboard {
  kind: CollectionKind;
  item: VariantCategory | PlanPickerData | ProductFeature | PricingOption;
}
