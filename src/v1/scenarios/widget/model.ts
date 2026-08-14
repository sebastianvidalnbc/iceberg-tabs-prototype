import { wuid } from "./data";
import type { Offer, SegmentName, SurveyResponse, Widget, WidgetKind } from "./types";

// A WidgetPath locates a specific collection array inside the Widget tree.
// Mirrors the Page scenario's ListPath protocol so the same generic tree
// interaction model applies, but scoped to Widget kinds only.
export type WidgetPath =
  | { kind: "offer" }
  | { kind: "segmentName"; offerId: string }
  | { kind: "surveyResponse" };

type AnyWidgetItem = Offer | SegmentName | SurveyResponse;

// Clipboard-compatibility kind for a path (identity — each level is its own kind,
// so Offers only paste into Offers, Segment Names into Segment Names, etc.).
export const pathKind = (path: WidgetPath): WidgetKind => path.kind;

// The field whose value seeds a row's label for each collection kind. Offers use
// a richer resolver (resolveOfferLabel); this is the field a Rename writes to
// only when there is no dedicated customLabel concept (segment/survey use the
// customLabel override, so their keyField is just the primary display source).
export const keyField: Record<WidgetKind, string> = {
  offer: "customLabel",
  segmentName: "segmentName",
  surveyResponse: "customLabel",
};

// Stable key identifying a specific collection instance in the expansion map.
export const collectionKey = (path: WidgetPath): string => {
  switch (path.kind) {
    case "offer":
      return "offer";
    case "segmentName":
      return `segmentName:${path.offerId}`;
    case "surveyResponse":
      return "surveyResponse";
  }
};

const findOffer = (widget: Widget, id?: string): Offer | undefined =>
  widget.offers.find((o) => o.id === id);

// Resolve the live array referenced by a WidgetPath within the given widget.
export const getList = (widget: Widget, path: WidgetPath): AnyWidgetItem[] | undefined => {
  switch (path.kind) {
    case "offer":
      return widget.offers;
    case "segmentName":
      return findOffer(widget, path.offerId)?.segmentation.segmentNames;
    case "surveyResponse":
      return widget.surveyResponses;
  }
};

// Recursively assign fresh ids to an item and all of its nested collections.
export const regenIds = <T extends AnyWidgetItem>(item: T): T => {
  const clone: any = structuredClone(item);
  clone.id = wuid();
  if (clone.segmentation && Array.isArray(clone.segmentation.segmentNames)) {
    clone.segmentation.segmentNames = clone.segmentation.segmentNames.map(regenIds);
  }
  return clone;
};

// Label hierarchy for an Offer row (product requirement §6/§7):
// 1. customLabel (user Rename) 2. Segment Name 3. Voucher Code
// 4. Cancellation Product Static ID 5. fallback "Offer N".
export const resolveOfferLabel = (offer: Offer, index: number): string => {
  const custom = offer.customLabel?.trim();
  if (custom) return custom;
  if (offer.segmentName.trim()) return offer.segmentName.trim();
  if (offer.voucherCode.trim()) return offer.voucherCode.trim();
  if (offer.cancellationProductStaticId.trim()) return offer.cancellationProductStaticId.trim();
  return `Offer ${index + 1}`;
};

// Label for a Survey Response row: customLabel -> responseId -> fallback.
export const resolveSurveyLabel = (r: SurveyResponse, index: number): string => {
  const custom = r.customLabel?.trim();
  if (custom) return custom;
  if (r.responseId.trim()) return r.responseId.trim();
  return `Response ${index + 1}`;
};

const newOffer = (): Offer => ({
  id: wuid("of"),
  type: "Retention",
  cancellationProductStaticId: "",
  segmentName: "",
  surveyResponseLabelKey: "",
  suppressDefaultOffer: false,
  productVoucher: "",
  voucherCode: "",
  segmentation: { offerType: "Retention", categoryTitle: "D2C", segmentNames: [] },
});

const newSegmentName = (): SegmentName => ({ id: wuid("sg"), segmentName: "" });

const newSurveyResponse = (): SurveyResponse => ({
  id: wuid("sr"),
  responseId: "",
  displayLabel: "",
  displayOrder: "",
  type: "Checkbox",
  saveMoment: "Offer Save",
  savePriority: "",
});

// Factory for the default item created by an "Add" action for a given list.
export const newItem = (path: WidgetPath): AnyWidgetItem => {
  switch (path.kind) {
    case "offer":
      return newOffer();
    case "segmentName":
      return newSegmentName();
    case "surveyResponse":
      return newSurveyResponse();
  }
};
