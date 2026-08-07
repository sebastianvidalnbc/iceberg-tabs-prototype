import type {
  Journey,
  PlanPickerData,
  PricingOption,
  ProductFeature,
  PublishStatus,
  VariantCategory,
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

const plan = (title: string, badge: string, description: string): PlanPickerData => ({
  id: uid("pl"),
  productLogo: "peacock-logo",
  badgeTitle: badge,
  lowerCaseBadgeTitle: false,
  eyebrow: "",
  productTitleIcon: "",
  productTitle: title,
  productDescription: description,
  disclaimer: "",
  features: [
    feature("trophy", "Stream every match live in HD."),
    feature("star", "The shows everyone is watching."),
    feature("download", "Watch on the go, no signal needed."),
  ],
  pricing: [
    price("Annual — $99.99/yr", "Billed once annually", "$119.99", "Select the annual plan"),
    price("Monthly — $11.99/mo", "Billed every month", "", "Select the monthly plan"),
  ],
});

const category = (
  title: string,
  query: string,
  status: PublishStatus,
  lastModified: string
): VariantCategory => ({
  id: uid("ct"),
  categoryTitle: title,
  categoryQueryParameter: query,
  plans: [
    plan("Premium", "Best Value", "Ad-supported access to all of Peacock."),
    plan("Premium Plus", "Most Popular", "Ad-free, with downloads and your local NBC channel."),
    plan("Sports", "New", "Everything in Premium Plus plus premium sports."),
  ],
  publishStatus: status,
  lastModified,
});

export const seedJourney = (): Journey => ({
  id: uid("jn"),
  name: "Journey",
  categories: [
    category("Annual Plan", "annual", "published", "2026-02-18 14:03"),
    category("Monthly Plan", "monthly", "in-review", "2026-02-17 11:20"),
    category("Sports Bundle", "sports", "draft", "2026-02-16 16:55"),
    category("Student Offer", "student", "draft", "2026-02-15 08:10"),
  ],
});
