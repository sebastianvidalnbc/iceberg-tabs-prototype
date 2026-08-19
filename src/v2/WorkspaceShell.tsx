import { useCallback, useState } from "react";
import { AppNav } from "./regions/AppNav";
import { Explorer } from "./regions/Explorer";
import { LivePreview } from "./regions/LivePreview";
import { Properties } from "./regions/Properties";
import {
  getVariant,
  seedExpandedFor,
  VARIANTS,
  DEFAULT_VARIANT_ID,
  getWidgetConfig,
  seedWidgetExpandedFor,
  WIDGET_CONFIGS,
  DEFAULT_WIDGET_CONFIG_ID,
  PAGES_TREE,
  WIDGETS_TREE,
  findNode,
  type AuthoringContext,
} from "./data";

// Per-experience Explorer memory: which Structure nodes are expanded and which
// object is selected. Keeping this keyed by experience (Variant or Widget
// config) lets switching back restore prior expansion/selection, and guarantees
// we never carry an invalid Structure selection from one experience to another.
interface ExperienceMemory {
  expanded: Set<string>;
  selectedNodeId: string;
}

function seedMemory(variantId: string): ExperienceMemory {
  const variant = VARIANTS[variantId];
  return {
    expanded: seedExpandedFor(variantId),
    selectedNodeId: variant ? variant.defaultSelectionId : "",
  };
}

function seedWidgetMemory(configId: string): ExperienceMemory {
  const config = WIDGET_CONFIGS[configId];
  return {
    expanded: seedWidgetExpandedFor(configId),
    selectedNodeId: config ? config.defaultSelectionId : "",
  };
}

// Persistent four-region authoring shell and the single owner of selection
// state. The active AuthoringContext ("page" | "widget") selects which dataset
// feeds Explorer / Live Preview / Properties. Each context keeps its own,
// fully independent selection + memory, so switching Page↔Widget never mutates
// or overwrites the other context's state.
//
// Per context, three distinct concepts are tracked and never conflated:
//   selected route id      — a route row in the collection tree
//   selected experience id — the active Variant / Widget config (drives regions)
//   selectedStructureNodeId — the selected object within the active experience
export function WorkspaceShell() {
  const [context, setContext] = useState<AuthoringContext>("page");

  // --- Page context state (unchanged behaviour) ---------------------------
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    DEFAULT_VARIANT_ID
  );
  const [pageMemory, setPageMemory] = useState<Record<string, ExperienceMemory>>(
    () => ({ [DEFAULT_VARIANT_ID]: seedMemory(DEFAULT_VARIANT_ID) })
  );

  // --- Widget context state (independent) ---------------------------------
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [selectedWidgetConfigId, setSelectedWidgetConfigId] = useState<
    string | null
  >(DEFAULT_WIDGET_CONFIG_ID);
  const [widgetMemory, setWidgetMemory] = useState<
    Record<string, ExperienceMemory>
  >(() => ({ [DEFAULT_WIDGET_CONFIG_ID]: seedWidgetMemory(DEFAULT_WIDGET_CONFIG_ID) }));

  const isPage = context === "page";

  // Resolve the region-facing values from whichever context is active.
  const collectionTree = isPage ? PAGES_TREE : WIDGETS_TREE;
  const collectionHeader = isPage ? "Pages" : "Widgets";
  const selectedRouteId = isPage ? selectedPageId : selectedWidgetId;
  const selectedExperienceId = isPage ? selectedVariantId : selectedWidgetConfigId;
  const activeExperience = isPage
    ? getVariant(selectedVariantId)
    : getWidgetConfig(selectedWidgetConfigId);
  const memory = isPage ? pageMemory : widgetMemory;
  const active = selectedExperienceId ? memory[selectedExperienceId] : undefined;
  const selectedStructureNodeId = active?.selectedNodeId ?? null;
  const expanded = active?.expanded ?? new Set<string>();

  // Label of the currently selected Structure object (drives the Widget preview
  // summary). Resolved from the active experience's structure.
  const selectedObjectLabel =
    activeExperience && selectedStructureNodeId
      ? findNode(activeExperience.structure, selectedStructureNodeId)?.label ?? null
      : null;

  // Switch the major authoring context. Each context preserves its own prior
  // selection because we never touch the other context's state here.
  const handleSelectContext = useCallback((next: AuthoringContext) => {
    setContext(next);
  }, []);

  // Click a route row: select it, clear the active experience (and its Structure
  // selection) for the current context only.
  const handleSelectRoute = useCallback(
    (routeId: string) => {
      if (isPage) {
        setSelectedPageId(routeId);
        setSelectedVariantId(null);
      } else {
        setSelectedWidgetId(routeId);
        setSelectedWidgetConfigId(null);
      }
    },
    [isPage]
  );

  // Click an experience (Variant / Widget config): make it active, seed its
  // memory if unseen, and clear any route selection — for the current context.
  const handleSelectExperience = useCallback(
    (experienceId: string) => {
      if (isPage) {
        setSelectedPageId(null);
        setSelectedVariantId(experienceId);
        setPageMemory((prev) =>
          prev[experienceId] ? prev : { ...prev, [experienceId]: seedMemory(experienceId) }
        );
      } else {
        setSelectedWidgetId(null);
        setSelectedWidgetConfigId(experienceId);
        setWidgetMemory((prev) =>
          prev[experienceId]
            ? prev
            : { ...prev, [experienceId]: seedWidgetMemory(experienceId) }
        );
      }
    },
    [isPage]
  );

  // Click a Structure node: update only the active experience's selection.
  const handleSelectStructureNode = useCallback(
    (nodeId: string) => {
      if (!selectedExperienceId) return;
      const setter = isPage ? setPageMemory : setWidgetMemory;
      setter((prev) => ({
        ...prev,
        [selectedExperienceId]: {
          ...prev[selectedExperienceId],
          selectedNodeId: nodeId,
        },
      }));
    },
    [isPage, selectedExperienceId]
  );

  // Toggle a Structure node's expansion for the active experience only.
  const handleToggleExpand = useCallback(
    (nodeId: string) => {
      if (!selectedExperienceId) return;
      const setter = isPage ? setPageMemory : setWidgetMemory;
      setter((prev) => {
        const cur = prev[selectedExperienceId];
        const next = new Set(cur.expanded);
        next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
        return { ...prev, [selectedExperienceId]: { ...cur, expanded: next } };
      });
    },
    [isPage, selectedExperienceId]
  );

  return (
    <div className="ui-ws">
      <AppNav context={context} onSelectContext={handleSelectContext} />
      <Explorer
        context={context}
        collectionTree={collectionTree}
        collectionHeader={collectionHeader}
        selectedRouteId={selectedRouteId}
        selectedExperienceId={selectedExperienceId}
        activeExperience={activeExperience}
        selectedStructureNodeId={selectedStructureNodeId}
        expanded={expanded}
        onSelectRoute={handleSelectRoute}
        onSelectExperience={handleSelectExperience}
        onSelectStructureNode={handleSelectStructureNode}
        onToggleExpand={handleToggleExpand}
      />
      <LivePreview
        variant={activeExperience}
        context={context}
        selectedObjectLabel={selectedObjectLabel}
      />
      <Properties
        context={context}
        variant={activeExperience}
        selectedRouteId={selectedRouteId}
        selectedStructureNodeId={selectedStructureNodeId}
      />
    </div>
  );
}
