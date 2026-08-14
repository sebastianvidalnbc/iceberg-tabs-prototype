import { useMemo, useState } from "react";
import { Badge } from "../../../../ui/Badge";
import { Icon } from "../../../../ui/Icon";
import { Select } from "../../../components/Field";
import { WidgetStoreProvider, useWidgetStore } from "../store";
import { resolveOfferLabel, resolveSurveyLabel } from "../model";
import type { WidgetPath } from "../model";
import { WidgetTree } from "./WidgetTree";
import { OfferBody, SurveyResponseBody } from "./WidgetBodies";
import type { Offer } from "../types";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  "in-review": "In Review",
  published: "Published",
};

const JOURNEY_FLOW_OPTIONS = [
  "Reminder > Content or Dual Plan > Content",
  "Reminder > Content",
  "Dual Plan > Content",
];
const QUICK_CANCEL_OPTIONS = ["Confirm Cancel", "Skip Confirm", "Offer First"];
const IMMEDIATE_CANCEL_OPTIONS = ["Plan Options", "Confirm Cancel", "Immediate"];

// Does an offer match the current search query across its label + key fields?
const offerMatches = (offer: Offer, index: number, q: string): boolean => {
  if (!q) return true;
  const hay = [
    resolveOfferLabel(offer, index),
    offer.segmentName,
    offer.voucherCode,
    offer.cancellationProductStaticId,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
};

function WidgetEditorInner() {
  const { state, dispatch } = useWidgetStore();
  const { widget } = state;
  const [query, setQuery] = useState("");
  const offerPath: WidgetPath = { kind: "offer" };
  const surveyPath: WidgetPath = { kind: "surveyResponse" };

  // Filter the DISPLAYED offers only; underlying order/collection is unchanged.
  const q = query.trim().toLowerCase();
  const offerItems = useMemo(
    () =>
      widget.offers
        .map((offer, index) => ({ offer, index }))
        .filter(({ offer, index }) => offerMatches(offer, index, q))
        .map(({ offer, index }) => ({
          id: offer.id,
          label: resolveOfferLabel(offer, index),
          disabled: offer.disabled,
        })),
    [widget.offers, q]
  );

  const surveyItems = widget.surveyResponses.map((r, i) => ({
    id: r.id,
    label: resolveSurveyLabel(r, i),
    disabled: r.disabled,
  }));

  const setWidget = (patch: Record<string, unknown>) =>
    dispatch({ type: "updateWidget", patch });

  const search = (
    <div className="wg-search">
      <Icon name="search" />
      <input
        className="wg-search__input"
        value={query}
        placeholder="Search offers..."
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          className="wg-search__clear"
          title="Clear search"
          aria-label="Clear search"
          onClick={() => setQuery("")}
        >
          ×
        </button>
      )}
      <span className="wg-search__count">
        {q ? `${offerItems.length} of ${widget.offers.length}` : `${widget.offers.length}`}
      </span>
    </div>
  );

  return (
    <main className="col editor">
      <nav className="page-crumb" aria-label="Widget">
        <span className="page-url">{widget.url}</span>
        <span className={`chip ${widget.status} active`}>{STATUS_LABEL[widget.status]}</span>
      </nav>
      <div className="editor-scroll page-sections">
        <div className="wg-header">
          <div className="wg-header__variant" title={widget.variantName}>
            {widget.variantName}
          </div>
          <div className="wg-header__meta">
            <Badge variant="success">{STATUS_LABEL[widget.variantStatus]}</Badge>
            <span className="wg-header__format">{widget.format}</span>
            <span className="wg-header__type">Widget Type: {widget.widgetType}</span>
          </div>
        </div>

        <div className="subhead">Journey Flows</div>
        <div className="section-fields">
          <Select
            label="Select Retention Journey Flow"
            value={widget.retentionJourneyFlow}
            options={JOURNEY_FLOW_OPTIONS}
            onChange={(v) => setWidget({ retentionJourneyFlow: v })}
          />
          <Select
            label="Select Quick Cancel Journey"
            value={widget.quickCancelJourney}
            options={QUICK_CANCEL_OPTIONS}
            onChange={(v) => setWidget({ quickCancelJourney: v })}
          />
          <Select
            label="Select Immediate Cancel Journey"
            value={widget.immediateCancelJourney}
            options={IMMEDIATE_CANCEL_OPTIONS}
            onChange={(v) => setWidget({ immediateCancelJourney: v })}
          />
        </div>

        <WidgetTree
          path={offerPath}
          title="Offers"
          addLabel="Add Offer"
          items={offerItems}
          headClassName="wg-offers-head"
          headerExtra={search}
          renderBody={(vm) => {
            const offer = widget.offers.find((o) => o.id === vm.id)!;
            return <OfferBody offer={offer} />;
          }}
        />

        <div className="wg-gap" />

        <WidgetTree
          path={surveyPath}
          title="Survey Responses"
          addLabel="Add Response"
          items={surveyItems}
          renderBody={(vm) => {
            const response = widget.surveyResponses.find((r) => r.id === vm.id)!;
            return <SurveyResponseBody response={response} />;
          }}
        />
      </div>
    </main>
  );
}

// Entry point: wraps the editor in its own self-contained Widget store so the
// Page scenario's store is never involved.
export function WidgetEditor() {
  return (
    <WidgetStoreProvider>
      <WidgetEditorInner />
    </WidgetStoreProvider>
  );
}
