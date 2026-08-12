import { useStore } from "../store";
import { Icon } from "./Icon";
import { Badge } from "../ui/Badge";
import { TreeCollection } from "./TreeCollection";
import { VariationBody } from "./EditorBodies";
import { SectionOptionsForm } from "./SectionOptionsForm";
import { variationInvalid } from "../validation";
import type { ListPath } from "../model";
import type { PublishStatus, SiblingSection } from "../types";

const SECTIONS: { key: "content" | "options"; label: string }[] = [
  { key: "content", label: "Section Content" },
  { key: "options", label: "Section Options" },
];

const STATUS_LABEL: Record<PublishStatus, string> = {
  draft: "Draft",
  "in-review": "In Review",
  published: "Published",
};

// Map publish status to the design-system Badge tint (never color-only).
const STATUS_VARIANT: Record<PublishStatus, "default" | "warning" | "success"> = {
  draft: "default",
  "in-review": "warning",
  published: "success",
};

// A collapsed sibling section on the page — placeholder context only (not
// authorable in this prototype).
function SiblingRow({ section }: { section: SiblingSection }) {
  return (
    <div className="ui-section-block ui-section-block--placeholder">
      <div className="ui-section-head" aria-disabled="true">
        <span className="ui-section-head__chevron">
          <Icon name="chevron-right" />
        </span>
        <span className="ui-section-head__name">{section.name}</span>
        <Badge variant={STATUS_VARIANT[section.status]}>{STATUS_LABEL[section.status]}</Badge>
        <span className="ui-section-head__id">Section ID: {section.sectionId}</span>
      </div>
    </div>
  );
}

// The section being redesigned: the existing Content/Options editor, now hosted
// as one expandable section among its siblings on the page.
function TargetSection() {
  const { state, dispatch } = useStore();
  const { journey, activeSection, sectionExpanded } = state;
  const variationPath: ListPath = { kind: "variation" };

  return (
    <div className="ui-section-block">
      <button
        className="ui-section-head"
        aria-expanded={sectionExpanded}
        onClick={() => dispatch({ type: "toggleTargetSection" })}
      >
        <span className="ui-section-head__chevron">
          <Icon name={sectionExpanded ? "chevron-down" : "chevron-right"} />
        </span>
        <span className="ui-section-head__name">{journey.name}</span>
        <Badge variant={STATUS_VARIANT[state.page.status]}>
          {STATUS_LABEL[state.page.status]}
        </Badge>
        <span className="ui-section-head__id">Section ID: {journey.id}</span>
      </button>

      {sectionExpanded && (
        <div className="ui-section-block__body">
          <div className="ui-section-views" role="tablist">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={activeSection === s.key}
                className="ui-section-view"
                onClick={() => dispatch({ type: "setActiveSection", section: s.key })}
              >
                {s.label}
              </button>
            ))}
          </div>
          {activeSection === "content" ? (
            <TreeCollection
              path={variationPath}
              title="Content Variations"
              addLabel="Add Variation"
              variant="card"
              items={journey.variations.map((v, i) => ({
                id: v.id,
                label: v.name || `Variation ${i + 1}`,
                disabled: v.disabled,
                invalid: variationInvalid(v),
              }))}
              renderBody={(vm) => {
                const variation = journey.variations.find((v) => v.id === vm.id)!;
                return <VariationBody variation={variation} />;
              }}
            />
          ) : (
            <SectionOptionsForm />
          )}
        </div>
      )}
    </div>
  );
}

export function ContentEditor() {
  const { state } = useStore();
  const { page } = state;

  return (
    <main className="col editor">
      <nav className="page-crumb" aria-label="Page">
        <span className="page-url">{page.url}</span>
        <span className="page-meta">{page.pageId}</span>
        <span className={`chip ${page.status} active`}>{STATUS_LABEL[page.status]}</span>
      </nav>
      <div className="editor-scroll page-sections">
        {page.siblingsBefore.map((s) => (
          <SiblingRow key={s.id} section={s} />
        ))}
        <TargetSection />
        {page.siblingsAfter.map((s) => (
          <SiblingRow key={s.id} section={s} />
        ))}
      </div>
    </main>
  );
}
