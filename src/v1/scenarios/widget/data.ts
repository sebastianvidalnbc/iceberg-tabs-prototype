import type { Offer, SegmentName, SurveyResponse, Widget } from "./types";

// Counter-based id generator, local to the Widget scenario so it never collides
// with the Page scenario's uid() sequence.
let counter = 0;
export const wuid = (prefix = "wid"): string => `${prefix}_${(counter++).toString(36)}`;

// Real Offer segment names taken from the supplied screenshots. These seed the
// first rows so reviewers immediately recognise meaningful labels instead of
// numbered tabs.
const REAL_SEGMENTS: string[] = [
  "US.CANCEL.40SAVED1YQ125",
  "US.CANCEL.50SAVED1YQ424",
  "US.CANCEL.60SAVED1YQ424",
  "US.CANCEL.70SAVED1YQ125",
  "US.CANCEL.299SAVED6MQ425WWE",
  "US.CANCEL.299SAVED6MQ425SOLO",
  "US.CANCEL.599SAVED6MQ425SOLO",
  "US.CANCEL.799SAVED6MQ425SOLO",
  "US.CANCEL.299SAVED6MQ425DUAL",
  "US.CANCEL.599SAVED6MQ425DUAL",
  "US.CANCEL.799SAVED6MQ425DUAL",
  "US.CANCEL.SAVECCG30D1YQ126SOLO",
  "US.CANCEL.SAVECCG50D1YQ126SOLO",
  "US.CANCEL.SAVECCG80D1YQ126SOLO",
  "US.CANCEL.SAVECCG30D1YQ126DUAL",
  "US.CANCEL.SAVECCG50D1YQ126DUAL",
  "US.CANCEL.SAVECCG80D1YQ126DUAL",
  "US.CANCEL.NOOFFER",
];

const segName = (name: string): SegmentName => ({ id: wuid("sg"), segmentName: name });

const offer = (segmentName: string, extras: Partial<Offer> = {}): Offer => ({
  id: wuid("of"),
  type: "Retention",
  cancellationProductStaticId: extras.cancellationProductStaticId ?? "peacock_premium_monthly",
  segmentName,
  surveyResponseLabelKey: extras.surveyResponseLabelKey ?? "",
  suppressDefaultOffer: extras.suppressDefaultOffer ?? false,
  productVoucher: extras.productVoucher ?? "Peacock Premium",
  voucherCode: extras.voucherCode ?? segmentName.replace(/^US\.CANCEL\./, ""),
  segmentation: extras.segmentation ?? {
    offerType: "Retention",
    categoryTitle: "D2C",
    segmentNames: [],
  },
});

// Programmatically extend the real seeds up to ~81 offers so the collection
// convincingly demonstrates the scale problem. Generated rows reuse realistic
// naming patterns; they need not be unique production data.
const PATTERNS = ["SAVED1YQ", "SAVED6MQ", "SAVECCG", "WINBACK", "LOYALTY"];
const PLANS = ["SOLO", "DUAL", "WWE", "PREMIUM", "PLUS"];

const generatedOffers = (start: number, target: number): Offer[] => {
  const out: Offer[] = [];
  for (let i = start; i < target; i++) {
    const price = 199 + (i % 8) * 100;
    const pattern = PATTERNS[i % PATTERNS.length];
    const plan = PLANS[i % PLANS.length];
    const name = `US.CANCEL.${price}${pattern}${(i % 12) + 1}${plan}`;
    out.push(offer(name));
  }
  return out;
};

const surveyResponse = (n: number, extras: Partial<SurveyResponse> = {}): SurveyResponse => ({
  id: wuid("sr"),
  responseId: `retention.survey.response.id.${n}`,
  displayLabel: extras.displayLabel ?? `Survey response ${n}`,
  displayOrder: String(n),
  type: extras.type ?? "Checkbox",
  saveMoment: extras.saveMoment ?? "Offer Save",
  savePriority: extras.savePriority ?? String(n),
});

// Build the seed Widget: real seeds first, then generated rows to reach 81. One
// representative Offer (the first) carries a populated Segmentation > Segment
// Names list to demonstrate deep nesting; a second offer gets a smaller list.
export const seedWidget = (): Widget => {
  counter = 0;
  const realOffers = REAL_SEGMENTS.map((s) => offer(s));

  // Deep nested example on the first offer.
  realOffers[0].segmentation.segmentNames = [
    segName("US.CANCEL.40SAVED1YQ125"),
    segName("US.CANCEL.50SAVED1YQ424"),
    segName("US.CANCEL.60SAVED1YQ424"),
    segName("US.CANCEL.70SAVED1YQ125"),
  ];
  realOffers[0].surveyResponseLabelKey = "retention.survey.response.id.1";
  // A second, smaller nested example.
  realOffers[4].segmentation.segmentNames = [
    segName("US.CANCEL.299SAVED6MQ425WWE"),
    segName("US.CANCEL.299SAVED6MQ425SOLO"),
  ];
  // The NOOFFER row suppresses the default offer.
  const noOffer = realOffers.find((o) => o.segmentName.endsWith("NOOFFER"));
  if (noOffer) noOffer.suppressDefaultOffer = true;

  const offers = [...realOffers, ...generatedOffers(realOffers.length, 81)];

  return {
    id: wuid("wg"),
    url: "/retention-service-config-us",
    status: "published",
    variantName:
      "qa-republish-Copy of Copy of Copy of Jun.10.2026.New.Offer.Constructs",
    variantStatus: "published",
    format: "JSON",
    widgetType: "Form / Json",
    retentionJourneyFlow: "Reminder > Content or Dual Plan > Content",
    quickCancelJourney: "Confirm Cancel",
    immediateCancelJourney: "Plan Options",
    offers,
    surveyResponses: [
      surveyResponse(1, { displayLabel: "Too expensive" }),
      surveyResponse(2, { displayLabel: "Not watching enough" }),
      surveyResponse(3, { displayLabel: "Technical issues" }),
      surveyResponse(4, { displayLabel: "Found a better service" }),
      surveyResponse(5, { displayLabel: "Only wanted one show" }),
      surveyResponse(6, { displayLabel: "Content not available" }),
      surveyResponse(7, { displayLabel: "Temporary break" }),
      surveyResponse(8, { displayLabel: "Other" }),
    ],
  };
};

// Options reused across Offer / Survey Response editing forms.
export const OFFER_TYPES = ["Retention", "Winback", "Acquisition"];
export const SURVEY_TYPES = ["Checkbox", "Radio", "Text"];
export const SAVE_MOMENTS = ["Offer Save", "Confirm Save", "Immediate Save"];
