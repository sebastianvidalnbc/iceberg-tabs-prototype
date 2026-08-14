import { useCallback, useState } from "react";
import { AppNav } from "./regions/AppNav";
import { Explorer } from "./regions/Explorer";
import { LivePreview } from "./regions/LivePreview";
import { Properties } from "./regions/Properties";
import { getVariant, seedExpandedFor, VARIANTS, DEFAULT_VARIANT_ID } from "./data";

// Per-Variant Explorer memory: which Structure nodes are expanded and which
// object is selected. Keeping this keyed by Variant lets switching back to a
// Variant restore its prior expansion/selection, and guarantees we never carry
// an invalid Structure selection from one Variant into another.
interface VariantMemory {
  expanded: Set<string>;
  selectedNodeId: string;
}

function seedMemory(variantId: string): VariantMemory {
  const variant = VARIANTS[variantId];
  return {
    expanded: seedExpandedFor(variantId),
    selectedNodeId: variant ? variant.defaultSelectionId : "",
  };
}

// Persistent four-region authoring shell and the single owner of selection
// state. Three distinct concepts are tracked and never conflated:
//   selectedPageId       — a route row in PAGES
//   selectedVariantId    — the active Variant (drives Structure/Preview/Props)
//   selectedStructureNodeId — the selected object within the active Variant
export function WorkspaceShell() {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    DEFAULT_VARIANT_ID
  );
  const [memory, setMemory] = useState<Record<string, VariantMemory>>(() => ({
    [DEFAULT_VARIANT_ID]: seedMemory(DEFAULT_VARIANT_ID),
  }));

  const activeVariant = getVariant(selectedVariantId);
  const active = selectedVariantId ? memory[selectedVariantId] : undefined;
  const selectedStructureNodeId = active?.selectedNodeId ?? null;
  const expanded = active?.expanded ?? new Set<string>();

  // Click a Page: select the route, clear the active Variant and its Structure
  // selection. Never keep the previous Variant/Structure/Properties visible.
  const handleSelectPage = useCallback((pageId: string) => {
    setSelectedPageId(pageId);
    setSelectedVariantId(null);
  }, []);

  // Click a Variant: make it active, seed its memory if unseen (which also sets
  // the default Structure selection), and clear any Page selection.
  const handleSelectVariant = useCallback((variantId: string) => {
    setSelectedPageId(null);
    setSelectedVariantId(variantId);
    setMemory((prev) =>
      prev[variantId] ? prev : { ...prev, [variantId]: seedMemory(variantId) }
    );
  }, []);

  // Click a Structure node: update only the active Variant's selection.
  const handleSelectStructureNode = useCallback(
    (nodeId: string) => {
      if (!selectedVariantId) return;
      setMemory((prev) => ({
        ...prev,
        [selectedVariantId]: {
          ...prev[selectedVariantId],
          selectedNodeId: nodeId,
        },
      }));
    },
    [selectedVariantId]
  );

  // Toggle a Structure node's expansion for the active Variant only.
  const handleToggleExpand = useCallback(
    (nodeId: string) => {
      if (!selectedVariantId) return;
      setMemory((prev) => {
        const cur = prev[selectedVariantId];
        const next = new Set(cur.expanded);
        next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
        return { ...prev, [selectedVariantId]: { ...cur, expanded: next } };
      });
    },
    [selectedVariantId]
  );

  return (
    <div className="ui-ws">
      <AppNav />
      <Explorer
        selectedPageId={selectedPageId}
        selectedVariantId={selectedVariantId}
        activeVariant={activeVariant}
        selectedStructureNodeId={selectedStructureNodeId}
        expanded={expanded}
        onSelectPage={handleSelectPage}
        onSelectVariant={handleSelectVariant}
        onSelectStructureNode={handleSelectStructureNode}
        onToggleExpand={handleToggleExpand}
      />
      <LivePreview variant={activeVariant} />
      <Properties
        variant={activeVariant}
        selectedPageId={selectedPageId}
        selectedStructureNodeId={selectedStructureNodeId}
      />
    </div>
  );
}
