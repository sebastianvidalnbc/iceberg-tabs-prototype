import { useCallback, useState } from "react";
import { AppShell } from "./AppShell";
import { Explorer } from "./regions/Explorer";
import { LivePreview } from "./regions/LivePreview";
import { Properties } from "./regions/Properties";
import { Breadcrumb } from "../ui/Breadcrumb";
import { Palette } from "lucide-react";
import { Button } from "@/v2/ui/button";
import {
  getVariant,
  seedExpandedFor,
  VARIANTS,
  DEFAULT_VARIANT_ID,
  isVariantId,
  getWidgetConfig,
  isWidgetConfigId,
  seedWidgetExpandedFor,
  WIDGET_CONFIGS,
  DEFAULT_WIDGET_CONFIG_ID,
  PAGES_TREE,
  WIDGETS_TREE,
  findNode,
  type AuthoringContext,
} from "./data";
import { findPageForVariant, routes, navigate } from "./browse";

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
// `initialContext` + `initialVariantId` come from the
// #/editor/:context/:id route so a deep link opens straight into the right
// authoring context AND experience — this is what makes the editor "dynamic":
// opening a Widget boots the shell in widget context (Widgets breadcrumb +
// widget Structure tree), opening a Page boots it in page context. Unknown ids
// fall back to that context's default so the editor always renders a populated
// workspace of the CORRECT kind.
export function WorkspaceShell({
  initialContext = "page",
  initialVariantId,
}: {
  initialContext?: AuthoringContext;
  initialVariantId?: string;
}) {
  const openVariantId =
    initialVariantId && isVariantId(initialVariantId)
      ? initialVariantId
      : DEFAULT_VARIANT_ID;
  // Widget deep-link target: use the id when it's a real widget config,
  // otherwise the default widget config (so the widget tree still renders).
  const openWidgetConfigId =
    initialVariantId && isWidgetConfigId(initialVariantId)
      ? initialVariantId
      : DEFAULT_WIDGET_CONFIG_ID;

  const [context, setContext] = useState<AuthoringContext>(initialContext);

  // --- Page context state (unchanged behaviour) ---------------------------
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    openVariantId
  );
  const [pageMemory, setPageMemory] = useState<Record<string, ExperienceMemory>>(
    () => ({ [openVariantId]: seedMemory(openVariantId) })
  );

  // --- Widget context state (independent) ---------------------------------
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [selectedWidgetConfigId, setSelectedWidgetConfigId] = useState<
    string | null
  >(openWidgetConfigId);
  const [widgetMemory, setWidgetMemory] = useState<
    Record<string, ExperienceMemory>
  >(() => ({ [openWidgetConfigId]: seedWidgetMemory(openWidgetConfigId) }));

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

  // The currently selected Structure object, resolved once from the active
  // experience's structure. Drives the Live Preview so the canvas reflects which
  // object (and, for Sections, which page role) the author is editing — the
  // workshop's "which section does this field control?" ask. Null when a route
  // (not an experience) is selected or nothing is selected.
  const selectedNode =
    activeExperience && selectedStructureNodeId
      ? findNode(activeExperience.structure, selectedStructureNodeId)
      : null;
  const selectedObject = selectedNode
    ? {
        label: selectedNode.label,
        role: selectedNode.role ?? null,
        objectType: selectedNode.objectType ?? null,
      }
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

  // Breadcrumb keeps the author oriented ("Where am I?"): <Collection> / /slug /
  // <experience>. Crumbs navigate back up the browse flow via hash routes, and
  // are context-aware. Pages have a per-slug Variants level; Widgets are a single
  // inline-expandable list, so a widget's owner crumb points back to that list.
  const activeExperienceId =
    selectedExperienceId ?? (isPage ? openVariantId : openWidgetConfigId);
  const ownerPage = findPageForVariant(activeExperienceId, context);
  const activeName = activeExperience?.name ?? activeExperienceId;
  const rootCrumb = isPage
    ? { label: "Pages", href: routes.pages() }
    : { label: "Widgets", href: routes.widgets() };
  // For Pages the owner slug links to its Variants list; for Widgets there is no
  // sub-page, so the owner slug links back to the single Widgets list.
  const ownerHref = ownerPage
    ? isPage
      ? routes.variants(ownerPage.id)
      : routes.widgets()
    : "";
  const crumbs = [
    { label: rootCrumb.label, href: rootCrumb.href, onClick: () => navigate(rootCrumb.href) },
    ...(ownerPage
      ? [
          {
            label: ownerPage.label,
            href: ownerHref,
            onClick: () => navigate(ownerHref),
          },
        ]
      : []),
    { label: activeName },
  ];

  // The persistent rail is provided by AppShell (shared across all V2 levels).
  // In the editor the rail keeps its original behaviour: clicking Pages/Widgets
  // swaps the in-editor dataset via handleSelectContext rather than navigating
  // away. Below the rail sits the breadcrumb bar and the three editing regions.
  return (
    <AppShell activeContext={context} onSelectContext={handleSelectContext}>
      <div className="ui-ws-editor">
        <div className="ui-ws-editor__bar">
          <Breadcrumb items={crumbs} />
          {/* Top-right entry to the V2 design-system catalog (mirrors V1's
              top-right "Design System" link, scoped to the V2 shadcn layer). */}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => navigate(routes.designSystem())}
          >
            <Palette className="size-4" />
            Design System
          </Button>
        </div>
        <div className="ui-ws">
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
            selectedObject={selectedObject}
          />
          <Properties
            context={context}
            variant={activeExperience}
            selectedRouteId={selectedRouteId}
            selectedStructureNodeId={selectedStructureNodeId}
          />
        </div>
      </div>
    </AppShell>
  );
}
