import { uid } from "./data";
import type {
  CollectionKind,
  Journey,
  PlanPickerData,
  PricingOption,
  ProductFeature,
  VariantCategory,
  Variation,
} from "./types";

// A ListPath locates a specific collection array inside the journey tree. Every
// level below the top-level Variation carries the ids needed to resolve it.
export type ListPath =
  | { kind: "variation" }
  | { kind: "category"; variationId: string }
  | { kind: "plan"; variationId: string; categoryId: string }
  | { kind: "feature"; variationId: string; categoryId: string; planId: string }
  | { kind: "pricing"; variationId: string; categoryId: string; planId: string };

type AnyItem = Variation | VariantCategory | PlanPickerData | ProductFeature | PricingOption;

// Clipboard-compatibility kind for a path (identity here — every level is its
// own kind, unlike the old offer/card pricing sharing).
export const pathKind = (path: ListPath): CollectionKind => path.kind;

// The field whose value is used as a row's label for each collection kind.
export const keyField: Record<CollectionKind, string> = {
  variation: "name",
  category: "categoryTitle",
  plan: "productTitle",
  feature: "productFeature",
  pricing: "offerDetail",
};

// Stable key identifying a specific collection *instance* in the expansion map.
export const collectionKey = (path: ListPath): string => {
  switch (path.kind) {
    case "variation":
      return "variation";
    case "category":
      return `category:${path.variationId}`;
    case "plan":
      return `plan:${path.variationId}:${path.categoryId}`;
    case "feature":
      return `feature:${path.variationId}:${path.categoryId}:${path.planId}`;
    case "pricing":
      return `pricing:${path.variationId}:${path.categoryId}:${path.planId}`;
  }
};

// The variation id affected by a path (undefined only for the top-level list).
export const variationIdOf = (path: ListPath): string | undefined =>
  path.kind === "variation" ? undefined : path.variationId;

// The category id affected by a path (undefined for variation & category lists).
export const categoryIdOf = (path: ListPath): string | undefined =>
  path.kind === "variation" || path.kind === "category" ? undefined : path.categoryId;

export const findVariation = (journey: Journey, id?: string): Variation | undefined =>
  journey.variations.find((v) => v.id === id);

export const findCategory = (
  journey: Journey,
  variationId?: string,
  id?: string
): VariantCategory | undefined =>
  findVariation(journey, variationId)?.categories.find((c) => c.id === id);

export const findPlan = (
  category: VariantCategory | undefined,
  id?: string
): PlanPickerData | undefined => category?.plans.find((p) => p.id === id);

// Resolve the live array referenced by a ListPath within the given journey.
export const getList = (journey: Journey, path: ListPath): AnyItem[] | undefined => {
  switch (path.kind) {
    case "variation":
      return journey.variations;
    case "category":
      return findVariation(journey, path.variationId)?.categories;
    case "plan":
      return findCategory(journey, path.variationId, path.categoryId)?.plans;
    case "feature": {
      const cat = findCategory(journey, path.variationId, path.categoryId);
      return findPlan(cat, path.planId)?.features;
    }
    case "pricing": {
      const cat = findCategory(journey, path.variationId, path.categoryId);
      return findPlan(cat, path.planId)?.pricing;
    }
  }
};

// Recursively assign fresh ids to an item and all of its nested collections.
export const regenIds = <T extends AnyItem>(item: T): T => {
  const clone: any = structuredClone(item);
  clone.id = uid();
  if (Array.isArray(clone.categories)) clone.categories = clone.categories.map(regenIds);
  if (Array.isArray(clone.plans)) clone.plans = clone.plans.map(regenIds);
  if (Array.isArray(clone.features)) clone.features = clone.features.map(regenIds);
  if (Array.isArray(clone.pricing)) clone.pricing = clone.pricing.map(regenIds);
  return clone;
};

const stamp = (): string => new Date().toISOString().slice(0, 16).replace("T", " ");

const newFeature = (): ProductFeature => ({
  id: uid("ft"),
  productFeatureIcon: "check",
  productFeature: "",
});

const newPricing = (): PricingOption => ({
  id: uid("pr"),
  offerDetail: "",
  buttonDescription: "",
  previousPrice: "",
  ariaLabel: "",
});

const newPlan = (): PlanPickerData => ({
  id: uid("pl"),
  productLogo: "",
  badgeTitle: "",
  lowerCaseBadgeTitle: false,
  eyebrow: "",
  productTitleIcon: "",
  productTitle: "",
  productDescription: "",
  disclaimer: "",
  features: [],
  pricing: [],
});

const newCategory = (): VariantCategory => ({
  id: uid("ct"),
  categoryTitle: "",
  categoryQueryParameter: "",
  plans: [],
  publishStatus: "draft",
  lastModified: stamp(),
});

const newVariation = (): Variation => ({
  id: uid("vr"),
  name: "",
  includeAsRegion: false,
  planPickerTitle: "",
  subtitle: "",
  titleAlignment: "Centre",
  enableHorizontalScroll: false,
  pickVariant: "Button Variant",
  categories: [],
});

// Factory for the default item created by an "Add" action for a given list.
export const newItem = (path: ListPath): AnyItem => {
  switch (path.kind) {
    case "variation":
      return newVariation();
    case "category":
      return newCategory();
    case "plan":
      return newPlan();
    case "feature":
      return newFeature();
    case "pricing":
      return newPricing();
  }
};
