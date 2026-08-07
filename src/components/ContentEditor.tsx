import { useStore } from "../store";
import { TreeCollection } from "./TreeCollection";
import { VariationBody } from "./EditorBodies";
import { SectionOptionsForm } from "./SectionOptionsForm";
import { variationInvalid } from "../validation";
import type { ListPath } from "../model";

const SECTIONS: { key: "content" | "options"; label: string }[] = [
  { key: "content", label: "Section Content" },
  { key: "options", label: "Section Options" },
];

export function ContentEditor() {
  const { state, dispatch } = useStore();
  const { journey, activeSection } = state;
  const variationPath: ListPath = { kind: "variation" };

  return (
    <main className="col editor">
      <header className="editor-head">
        <h1>{journey.name}</h1>
      </header>
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
      <div className="editor-scroll">
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
    </main>
  );
}
