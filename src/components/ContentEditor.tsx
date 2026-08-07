import { useStore } from "../store";
import { TreeCollection } from "./TreeCollection";
import { CategoryBody } from "./EditorBodies";
import { categoryInvalid } from "../validation";
import type { ListPath } from "../model";

export function ContentEditor() {
  const { state } = useStore();
  const { journey } = state;
  const categoryPath: ListPath = { kind: "category" };

  return (
    <main className="col editor">
      <header className="editor-head">
        <h1>{journey.name}</h1>
      </header>
      <div className="editor-scroll">
        <TreeCollection
          path={categoryPath}
          title="Variant Categories"
          addLabel="Add Category"
          items={journey.categories.map((c, i) => ({
            id: c.id,
            label: c.categoryTitle || `Category ${i + 1}`,
            disabled: c.disabled,
            invalid: categoryInvalid(c),
          }))}
          renderBody={(vm) => {
            const category = journey.categories.find((c) => c.id === vm.id)!;
            return <CategoryBody category={category} />;
          }}
        />
      </div>
    </main>
  );
}
