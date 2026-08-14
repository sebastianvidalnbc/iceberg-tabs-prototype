// Data model for the second V1 scenario: the /retention-service-config-us
// Widget. This is a self-contained parallel to the Page/Plan-Picker model so the
// existing Page scenario is not touched. Every repeated object is a labelled item
// in a collection; Offer labels derive from a key hierarchy (see resolveOfferLabel).

export type WidgetKind = "offer" | "segmentName" | "surveyResponse";
export type WidgetPublishStatus = "draft" | "in-review" | "published";

// A single Segment Name inside an Offer's Segmentation. This is the deepest
// nested collection and demonstrates recursion inside one of 80+ Offers.
export interface SegmentName {
  id: string;
  disabled?: boolean;
  segmentName: string;
}

// Segmentation block within an Offer. Holds scalar context plus the repeatable
// Segment Names collection.
export interface Segmentation {
  offerType: string;
  categoryTitle: string;
  segmentNames: SegmentName[];
}

// One Offer within the Widget's Offers collection. The displayed row label is
// derived from segmentName -> voucherCode -> cancellationProductStaticId ->
// "Offer N"; a user-set customLabel overrides all of these without mutating the
// underlying segmentName (see product requirement §7).
export interface Offer {
  id: string;
  disabled?: boolean;
  customLabel?: string;

  type: string; // e.g. "Retention"
  cancellationProductStaticId: string; // Required
  segmentName: string; // Optional (also the primary label source)
  surveyResponseLabelKey: string; // e.g. retention.survey.response.id.1
  suppressDefaultOffer: boolean;
  productVoucher: string; // Product / Voucher
  voucherCode: string;

  segmentation: Segmentation;
}

// A Survey Response within the Widget-level Survey Responses collection. Uses the
// same collection pattern as Offers to prove the redesign works recursively
// across different Widget schemas.
export interface SurveyResponse {
  id: string;
  disabled?: boolean;
  customLabel?: string;

  responseId: string; // e.g. retention.survey.response.id.1 (primary label source)
  displayLabel: string;
  displayOrder: string;
  type: string; // e.g. "Checkbox"
  saveMoment: string; // e.g. "Offer Save"
  savePriority: string;
}

// The Widget being authored. Top-level scalar context (header + Journey Flows)
// plus the two primary collections: Offers and Survey Responses.
export interface Widget {
  id: string;
  url: string; // /retention-service-config-us
  status: WidgetPublishStatus;
  variantName: string; // qa-republish-Copy of Copy of ...
  variantStatus: WidgetPublishStatus;
  format: string; // JSON
  widgetType: string; // Form / Json

  // Journey Flows context fields (realistic but not the primary interaction).
  retentionJourneyFlow: string;
  quickCancelJourney: string;
  immediateCancelJourney: string;

  offers: Offer[];
  surveyResponses: SurveyResponse[];
}

// A copied item held on the clipboard, tagged with its collection kind so it can
// only be pasted back into a compatible list.
export interface WidgetClipboard {
  kind: WidgetKind;
  item: Offer | SegmentName | SurveyResponse;
}
