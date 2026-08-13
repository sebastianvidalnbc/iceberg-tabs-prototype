import type {
  CollectionKind,
  PlanPickerData,
  PricingOption,
  ProductFeature,
  VariantCategory,
  Variation,
} from "./types";

export const featureInvalid = (f: ProductFeature): boolean => !f.productFeature.trim();

export const pricingInvalid = (p: PricingOption): boolean => !p.ariaLabel.trim();

export const planInvalid = (p: PlanPickerData): boolean =>
  !p.productTitle.trim() ||
  p.features.some(featureInvalid) ||
  p.pricing.some(pricingInvalid);

export const categoryInvalid = (c: VariantCategory): boolean =>
  !c.categoryTitle.trim() || c.plans.length === 0 || c.plans.some(planInvalid);

export const variationInvalid = (v: Variation): boolean =>
  !v.name.trim() || v.categories.some(categoryInvalid);

// Dispatcher used where only the kind + item are known.
export const itemInvalid = (
  kind: CollectionKind,
  item: Variation | VariantCategory | PlanPickerData | ProductFeature | PricingOption
): boolean => {
  switch (kind) {
    case "variation":
      return variationInvalid(item as Variation);
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
