import { Checkbox, Field, Select } from "../../../components/Field";
import { WidgetTree } from "./WidgetTree";
import { useWidgetStore } from "../store";
import { resolveOfferLabel } from "../model";
import type { WidgetPath } from "../model";
import { OFFER_TYPES, SAVE_MOMENTS, SURVEY_TYPES } from "../data";
import type { Offer, SurveyResponse } from "../types";

// Editing body for a single Offer. Uses the real fields from the screenshots and
// nests the Segmentation > Segment Names collection with the same tree pattern.
export function OfferBody({ offer }: { offer: Offer }) {
  const { dispatch } = useWidgetStore();
  const path: WidgetPath = { kind: "offer" };
  const segmentPath: WidgetPath = { kind: "segmentName", offerId: offer.id };
  const patch = (p: Record<string, unknown>) =>
    dispatch({ type: "updateField", path, id: offer.id, patch: p });

  return (
    <>
      <div className="section-fields">
        <Select
          label="Type"
          value={offer.type}
          options={OFFER_TYPES}
          onChange={(v) => patch({ type: v })}
        />

        <div className="wg-cond">If customer is cancelling</div>
        <Field
          label="Cancellation Product Static ID"
          required
          value={offer.cancellationProductStaticId}
          onChange={(v) => patch({ cancellationProductStaticId: v })}
        />
        <div className="wg-and">and</div>
        <Field
          label="Segment Name (optional)"
          value={offer.segmentName}
          placeholder="e.g. US.CANCEL.40SAVED1YQ125"
          onChange={(v) => patch({ segmentName: v })}
        />
        <div className="wg-and">and</div>
        <Field
          label="Survey Response Label Key (optional)"
          value={offer.surveyResponseLabelKey}
          placeholder="retention.survey.response.id.1"
          onChange={(v) => patch({ surveyResponseLabelKey: v })}
        />

        <div className="wg-cond">Then show</div>
        <Checkbox
          label="Suppress default offer"
          checked={offer.suppressDefaultOffer}
          onChange={(v) => patch({ suppressDefaultOffer: v })}
        />
        <Field
          label="Product / Voucher"
          value={offer.productVoucher}
          onChange={(v) => patch({ productVoucher: v })}
        />
        <Field
          label="Voucher Code"
          value={offer.voucherCode}
          onChange={(v) => patch({ voucherCode: v })}
        />
      </div>

      <div className="subhead">Segmentation</div>
      <div className="section-fields">
        <Field
          label="Offer Type"
          value={offer.segmentation.offerType}
          onChange={(v) => patch({ "segmentation.offerType": v })}
        />
        <Field
          label="Category Title"
          value={offer.segmentation.categoryTitle}
          onChange={(v) => patch({ "segmentation.categoryTitle": v })}
        />
      </div>

      <WidgetTree
        path={segmentPath}
        title="Segment Names"
        addLabel="Add Segment Name"
        items={offer.segmentation.segmentNames.map((s, i) => ({
          id: s.id,
          label: s.segmentName || `Segment ${i + 1}`,
          disabled: s.disabled,
        }))}
        renderBody={(vm) => {
          const seg = offer.segmentation.segmentNames.find((s) => s.id === vm.id)!;
          return (
            <div className="section-fields">
              <Field
                label="Segment Name"
                value={seg.segmentName}
                onChange={(v) =>
                  dispatch({
                    type: "updateField",
                    path: segmentPath,
                    id: seg.id,
                    patch: { segmentName: v },
                  })
                }
              />
            </div>
          );
        }}
      />
    </>
  );
}

// Editing body for a single Survey Response.
export function SurveyResponseBody({ response }: { response: SurveyResponse }) {
  const { dispatch } = useWidgetStore();
  const path: WidgetPath = { kind: "surveyResponse" };
  const patch = (p: Record<string, unknown>) =>
    dispatch({ type: "updateField", path, id: response.id, patch: p });

  return (
    <div className="section-fields">
      <Field label="ID" value={response.responseId} onChange={(v) => patch({ responseId: v })} />
      <Field
        label="Display Label"
        value={response.displayLabel}
        onChange={(v) => patch({ displayLabel: v })}
      />
      <Field
        label="Display Order"
        value={response.displayOrder}
        onChange={(v) => patch({ displayOrder: v })}
      />
      <Select
        label="Type"
        value={response.type}
        options={SURVEY_TYPES}
        onChange={(v) => patch({ type: v })}
      />
      <Select
        label="Save Moment"
        value={response.saveMoment}
        options={SAVE_MOMENTS}
        onChange={(v) => patch({ saveMoment: v })}
      />
      <Field
        label="Save Priority"
        value={response.savePriority}
        onChange={(v) => patch({ savePriority: v })}
      />
    </div>
  );
}

// Re-export so the editor can import label helpers from one place.
export { resolveOfferLabel };
