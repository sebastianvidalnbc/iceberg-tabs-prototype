import { useStore } from "../store";
import { Checkbox, Field, Select, TextArea } from "./Field";
import { TreeCollection } from "./TreeCollection";
import { categoryInvalid, featureInvalid, planInvalid, pricingInvalid } from "../validation";
import type { ListPath } from "../model";
import type {
  PlanPickerData,
  ProductFeature,
  PricingOption,
  PublishStatus,
  VariantCategory,
  Variation,
} from "../types";

const STATUSES: PublishStatus[] = ["draft", "in-review", "published"];
const statusLabel: Record<PublishStatus, string> = {
  draft: "Draft",
  "in-review": "In Review",
  published: "Published",
};

const ALIGNMENTS = ["Left", "Centre", "Right"];
const VARIANTS = ["Button Variant", "Card Variant", "Compact Variant"];

// A content Variation: section-level fields first, then the existing (unchanged)
// Variant Categories tree scoped to this variation.
export function VariationBody({ variation }: { variation: Variation }) {
  const { dispatch } = useStore();
  const path: ListPath = { kind: "variation" };
  const categoryPath: ListPath = { kind: "category", variationId: variation.id };
  const patch = (p: Record<string, unknown>) =>
    dispatch({ type: "updateField", path, id: variation.id, patch: p });

  return (
    <>
      <div className="section-fields">
        <Checkbox
          label="Include this section as a region (Accessibility)"
          checked={variation.includeAsRegion}
          onChange={(v) => patch({ includeAsRegion: v })}
        />
        <Field
          label="Plan Picker Title (optional)"
          value={variation.planPickerTitle}
          onChange={(v) => patch({ planPickerTitle: v })}
        />
        <Field
          label="Subtitle (optional)"
          value={variation.subtitle}
          onChange={(v) => patch({ subtitle: v })}
        />
        <Select
          label="Title & Subtitle Alignment"
          value={variation.titleAlignment}
          options={ALIGNMENTS}
          onChange={(v) => patch({ titleAlignment: v })}
        />
        <Checkbox
          label="Enable Horizontal Scroll on Mobile"
          checked={variation.enableHorizontalScroll}
          onChange={(v) => patch({ enableHorizontalScroll: v })}
        />
        <Select
          label="Pick Variant"
          value={variation.pickVariant}
          options={VARIANTS}
          onChange={(v) => patch({ pickVariant: v })}
        />
      </div>
      <div className="subhead">Variant Categories</div>
      <TreeCollection
        path={categoryPath}
        title="Variant Categories"
        addLabel="Add Category"
        items={variation.categories.map((c, i) => ({
          id: c.id,
          label: c.categoryTitle || `Category ${i + 1}`,
          disabled: c.disabled,
          invalid: categoryInvalid(c),
        }))}
        renderBody={(vm) => {
          const category = variation.categories.find((c) => c.id === vm.id)!;
          return <CategoryBody variationId={variation.id} category={category} />;
        }}
      />
    </>
  );
}

export function CategoryBody({
  variationId,
  category,
}: {
  variationId: string;
  category: VariantCategory;
}) {
  const { dispatch } = useStore();
  const path: ListPath = { kind: "category", variationId };
  const planPath: ListPath = { kind: "plan", variationId, categoryId: category.id };
  const patch = (p: Record<string, unknown>) =>
    dispatch({ type: "updateField", path, id: category.id, patch: p });

  return (
    <>
      <div className="publish-row">
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`chip ${s}${category.publishStatus === s ? " active" : ""}`}
            onClick={() =>
              dispatch({ type: "setPublishStatus", variationId, categoryId: category.id, status: s })
            }
          >
            {statusLabel[s]}
          </button>
        ))}
      </div>
      <Field
        label="Category Title"
        required
        value={category.categoryTitle}
        onChange={(v) => patch({ categoryTitle: v })}
      />
      <Field
        label="Category Query Parameter"
        value={category.categoryQueryParameter}
        onChange={(v) => patch({ categoryQueryParameter: v })}
      />
      <TreeCollection
        path={planPath}
        title="Plan Picker Data"
        addLabel="Add Plan"
        items={category.plans.map((p, i) => ({
          id: p.id,
          label: p.productTitle || `Plan ${i + 1}`,
          disabled: p.disabled,
          invalid: planInvalid(p),
        }))}
        renderBody={(vm) => {
          const plan = category.plans.find((p) => p.id === vm.id)!;
          return <PlanBody variationId={variationId} category={category} plan={plan} />;
        }}
      />
    </>
  );
}

export function PlanBody({
  variationId,
  category,
  plan,
}: {
  variationId: string;
  category: VariantCategory;
  plan: PlanPickerData;
}) {
  const { dispatch } = useStore();
  const path: ListPath = { kind: "plan", variationId, categoryId: category.id };
  const featurePath: ListPath = { kind: "feature", variationId, categoryId: category.id, planId: plan.id };
  const pricingPath: ListPath = { kind: "pricing", variationId, categoryId: category.id, planId: plan.id };
  const patch = (p: Record<string, unknown>) =>
    dispatch({ type: "updateField", path, id: plan.id, patch: p });

  return (
    <>
      <Field label="Product Logo" value={plan.productLogo} onChange={(v) => patch({ productLogo: v })} />
      <Field label="Badge Title" value={plan.badgeTitle} onChange={(v) => patch({ badgeTitle: v })} />
      <Checkbox
        label="Lower Case Badge Title"
        checked={plan.lowerCaseBadgeTitle}
        onChange={(v) => patch({ lowerCaseBadgeTitle: v })}
      />
      <Field label="Eyebrow" value={plan.eyebrow} onChange={(v) => patch({ eyebrow: v })} />
      <Field
        label="Product Title Icon"
        value={plan.productTitleIcon}
        onChange={(v) => patch({ productTitleIcon: v })}
      />
      <Field
        label="Product Title"
        required
        value={plan.productTitle}
        onChange={(v) => patch({ productTitle: v })}
      />
      <TextArea
        label="Product Description"
        value={plan.productDescription}
        onChange={(v) => patch({ productDescription: v })}
      />
      <TextArea label="Disclaimer" value={plan.disclaimer} onChange={(v) => patch({ disclaimer: v })} />
      <TreeCollection
        path={featurePath}
        title="Product Features List"
        addLabel="Add Feature"
        items={plan.features.map((f, i) => ({
          id: f.id,
          label: f.productFeature || `Feature ${i + 1}`,
          disabled: f.disabled,
          invalid: featureInvalid(f),
        }))}
        renderBody={(vm) => {
          const feature = plan.features.find((f) => f.id === vm.id)!;
          return (
            <FeatureBody
              variationId={variationId}
              category={category}
              plan={plan}
              feature={feature}
            />
          );
        }}
      />
      <TreeCollection
        path={pricingPath}
        title="Pricing Options"
        addLabel="Add Pricing Option"
        items={plan.pricing.map((p, i) => ({
          id: p.id,
          label: p.offerDetail || `Pricing ${i + 1}`,
          disabled: p.disabled,
          invalid: pricingInvalid(p),
        }))}
        renderBody={(vm) => {
          const pricing = plan.pricing.find((p) => p.id === vm.id)!;
          return (
            <PricingBody
              variationId={variationId}
              category={category}
              plan={plan}
              pricing={pricing}
            />
          );
        }}
      />
    </>
  );
}

export function FeatureBody({
  variationId,
  category,
  plan,
  feature,
}: {
  variationId: string;
  category: VariantCategory;
  plan: PlanPickerData;
  feature: ProductFeature;
}) {
  const { dispatch } = useStore();
  const path: ListPath = { kind: "feature", variationId, categoryId: category.id, planId: plan.id };
  const patch = (p: Record<string, unknown>) =>
    dispatch({ type: "updateField", path, id: feature.id, patch: p });
  return (
    <>
      <Field
        label="Product Feature Icon"
        value={feature.productFeatureIcon}
        onChange={(v) => patch({ productFeatureIcon: v })}
      />
      <TextArea
        label="Product Feature"
        value={feature.productFeature}
        onChange={(v) => patch({ productFeature: v })}
      />
    </>
  );
}

export function PricingBody({
  variationId,
  category,
  plan,
  pricing,
}: {
  variationId: string;
  category: VariantCategory;
  plan: PlanPickerData;
  pricing: PricingOption;
}) {
  const { dispatch } = useStore();
  const path: ListPath = { kind: "pricing", variationId, categoryId: category.id, planId: plan.id };
  const patch = (p: Record<string, unknown>) =>
    dispatch({ type: "updateField", path, id: pricing.id, patch: p });
  return (
    <>
      <Field label="Offer Detail" value={pricing.offerDetail} onChange={(v) => patch({ offerDetail: v })} />
      <TextArea
        label="Button Description"
        value={pricing.buttonDescription}
        onChange={(v) => patch({ buttonDescription: v })}
      />
      <Field
        label="Previous Price"
        value={pricing.previousPrice}
        onChange={(v) => patch({ previousPrice: v })}
      />
      <Field
        label="Aria Label"
        required
        value={pricing.ariaLabel}
        onChange={(v) => patch({ ariaLabel: v })}
      />
    </>
  );
}
