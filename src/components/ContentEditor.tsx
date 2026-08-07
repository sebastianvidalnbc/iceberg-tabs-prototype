import { useStore } from "../store";
import { Icon } from "./Icon";
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

// A collapsed sibling section on the page — placeholder context only (not
// authorable in this prototype).
function SiblingRow({ section }: { section: SiblingSection }) {
  return (
    <div className="page-section placeholder">
      <div className="page-section-head" aria-disabled>
        <Icon name="chevron-right" />
        <span className="page-section-name">{section.name}</span>
        <span className={`chip ${section.status} active`}>{STATUS_LABEL[section.status]}</span>
        <span className="page-section-id">Section ID: {section.sectionId}</span>
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
    <div className="page-section target">
      <button
        className="page-section-head"
        aria-expanded={sectionExpanded}
        onClick={() => dispatch({ type: "toggleTargetSection" })}
      >
        <Icon name={sectionExpanded ? "chevron-down" : "chevron-right"} />
        <span className="page-section-name">{journey.name}</span>
        <span className="chip published active">{STATUS_LABEL[state.page.status]}</span>
        <span className="page-section-id">Section ID: {journey.id}</span>
      </button>

      {sectionExpanded && (
        <div className="page-section-body">
          <div className="section-tabs" role="tablist">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={activeSection === s.key}
                className={`section-tab${activeSection === s.key ? " active" : ""}`}
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
