import type {
  CollectionKind,
  PlanPickerData,
  PricingOption,
  ProductFeature,
  VariantCategory,
} from "./types";

export const featureInvalid = (f: ProductFeature): boolean => !f.productFeature.trim();

export const pricingInvalid = (p: PricingOption): boolean => !p.ariaLabel.trim();

export const planInvalid = (p: PlanPickerData): boolean =>
  !p.productTitle.trim() ||
  p.features.some(featureInvalid) ||
  p.pricing.some(pricingInvalid);

export const categoryInvalid = (c: VariantCategory): boolean =>
  !c.categoryTitle.trim() || c.plans.length === 0 || c.plans.some(planInvalid);

// Dispatcher used where only the kind + item are known.
export const itemInvalid = (
  kind: CollectionKind,
  item: VariantCategory | PlanPickerData | ProductFeature | PricingOption
): boolean => {
  switch (kind) {
    case "category":
      return categoryInvalid(item as VariantCategory);
    case "plan":
      return planInvalid(item as PlanPickerData);
    case "feature":
      return featureInvalid(item as ProductFeature);
    case "pricing":
      return pricingInvalid(item as PricingOption);
  }
};
