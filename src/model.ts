import { uid } from "./data";
import type {
  CollectionKind,
  Journey,
  PlanPickerData,
  PricingOption,
  ProductFeature,
  VariantCategory,
} from "./types";

// A ListPath locates a specific collection array inside the journey tree.
export type ListPath =
  | { kind: "category" }
  | { kind: "plan"; categoryId: string }
  | { kind: "feature"; categoryId: string; planId: string }
  | { kind: "pricing"; categoryId: string; planId: string };

type AnyItem = VariantCategory | PlanPickerData | ProductFeature | PricingOption;

// Clipboard-compatibility kind for a path (identity here — every level is its
// own kind, unlike the old offer/card pricing sharing).
export const pathKind = (path: ListPath): CollectionKind => path.kind;

// The field whose value is used as a row's label for each collection kind.
export const keyField: Record<CollectionKind, string> = {
  category: "categoryTitle",
  plan: "productTitle",
  feature: "productFeature",
  pricing: "offerDetail",
};

// Stable key identifying a specific collection *instance* in the expansion map.
export const collectionKey = (path: ListPath): string => {
  switch (path.kind) {
    case "category":
      return "category";
    case "plan":
      return `plan:${path.categoryId}`;
    case "feature":
      return `feature:${path.categoryId}:${path.planId}`;
    case "pricing":
      return `pricing:${path.categoryId}:${path.planId}`;
  }
};

// The category id affected by a path (undefined only for the top-level list).
export const categoryIdOf = (path: ListPath): string | undefined =>
  path.kind === "category" ? undefined : path.categoryId;

export const findCategory = (
  journey: Journey,
  id?: string
): VariantCategory | undefined => journey.categories.find((c) => c.id === id);

export const findPlan = (
  category: VariantCategory | undefined,
  id?: string
): PlanPickerData | undefined => category?.plans.find((p) => p.id === id);

// Resolve the live array referenced by a ListPath within the given journey.
export const getList = (journey: Journey, path: ListPath): AnyItem[] | undefined => {
  switch (path.kind) {
    case "category":
      return journey.categories;
    case "plan":
      return findCategory(journey, path.categoryId)?.plans;
    case "feature": {
      const cat = findCategory(journey, path.categoryId);
      return findPlan(cat, path.planId)?.features;
    }
    case "pricing": {
      const cat = findCategory(journey, path.categoryId);
      return findPlan(cat, path.planId)?.pricing;
    }
  }
};

// Recursively assign fresh ids to an item and all of its nested collections.
export const regenIds = <T extends AnyItem>(item: T): T => {
  const clone: any = structuredClone(item);
  clone.id = uid();
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

// Factory for the default item created by an "Add" action for a given list.
export const newItem = (path: ListPath): AnyItem => {
  switch (path.kind) {
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
