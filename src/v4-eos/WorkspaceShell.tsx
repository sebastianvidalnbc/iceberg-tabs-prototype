import { useCallback, useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AppShell } from "./AppShell";
import { Explorer } from "./regions/Explorer";
import { LivePreview } from "./regions/LivePreview";
import { Properties } from "./regions/Properties";
import { Breadcrumb } from "./ui-lib/Breadcrumb";
import { Icon } from "./ui-lib/Icon";
import { Button } from "@/v4-eos/ui/button";
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
import {
  appendChild,
  cloneKeepIds,
  cloneWithNewIds,
  deleteNode,
  duplicateNode,
  findNodeById,
  insertAfter,
  insertBefore,
  moveWithin,
  renameNode,
  setNodeContent,
  toggleDisabled,
} from "./structureOps";
import type { StructureNode, StructureObjectType } from "./data";
import { collectVariationNodes, derivePreviewModel } from "./previewModel";
import { collectInvalidFields } from "./validate";
import { LayoutPicker } from "./regions/LayoutPicker";
import { createChildNode, getLayoutDef } from "./layouts";

// Per-experience Explorer memory: which Structure nodes are expanded and which
// object is selected. Keeping this keyed by experience (Variant or Widget
// config) lets switching back restore prior expansion/selection, and guarantees
// we never carry an invalid Structure selection from one experience to another.
interface ExperienceMemory {
  expanded: Set<string>;
  selectedNodeId: string;
  // Editable copy of the experience's Structure tree (drag-reorder + row
  // actions mutate this, never the shared static dataset).
  structure: StructureNode[];
}

function seedMemory(variantId: string): ExperienceMemory {
  const variant = VARIANTS[variantId];
  return {
    expanded: seedExpandedFor(variantId),
    selectedNodeId: variant ? variant.defaultSelectionId : "",
    structure: variant ? cloneKeepIds(variant.structure) : [],
  };
}

function seedWidgetMemory(configId: string): ExperienceMemory {
  const config = WIDGET_CONFIGS[configId];
  return {
    expanded: seedWidgetExpandedFor(configId),
    selectedNodeId: config ? config.defaultSelectionId : "",
    structure: config ? cloneKeepIds(config.structure) : [],
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

  // Structure clipboard for Copy/Paste, shared across experiences (mirrors V1).
  const [clipboard, setClipboard] = useState<StructureNode | null>(null);

  // Layout Picker target: where a newly chosen premade layout will be inserted.
  // null ⇒ the picker is closed. `refId` is the top-level section the insert is
  // relative to (null for "append to end").
  const [layoutPicker, setLayoutPicker] = useState<{
    position: "before" | "after" | "end";
    refId: string | null;
    refLabel?: string;
  } | null>(null);

  // MVT / A-B override: a variation id to PREVIEW instead of the current
  // selection (the mvtOverride analog — preview-only, never mutates data). ""
  // means "as authored" (derive from the selected node).
  const [mvtOverride, setMvtOverride] = useState<string>("");

  // Resizable Explorer column: the author can drag the divider between the
  // tree/collection pane and the preview to widen the tree (up to a max).
  const EXPLORER_MIN = 240;
  const EXPLORER_MAX = 560;
  const [explorerWidth, setExplorerWidth] = useState(280);
  const beginExplorerResize = useCallback(
    (e: ReactPointerEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = explorerWidth;
      const onMove = (ev: PointerEvent) => {
        const next = Math.min(
          EXPLORER_MAX,
          Math.max(EXPLORER_MIN, startW + (ev.clientX - startX)),
        );
        setExplorerWidth(next);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [explorerWidth],
  );

  const isPage = context === "page";

  // Resolve the region-facing values from whichever context is active.
  const collectionTree = isPage ? PAGES_TREE : WIDGETS_TREE;
  const collectionHeader = isPage ? "Pages" : "Widgets";
  const selectedRouteId = isPage ? selectedPageId : selectedWidgetId;
  const selectedExperienceId = isPage ? selectedVariantId : selectedWidgetConfigId;
  const baseExperience = isPage
    ? getVariant(selectedVariantId)
    : getWidgetConfig(selectedWidgetConfigId);
  const memory = isPage ? pageMemory : widgetMemory;
  const active = selectedExperienceId ? memory[selectedExperienceId] : undefined;
  // The experience handed to the regions carries the EDITABLE structure (from
  // per-experience memory) rather than the shared static one, so drag-reorder
  // and row actions are reflected everywhere (Explorer, Preview, Properties).
  const activeExperience = baseExperience
    ? { ...baseExperience, structure: active?.structure ?? baseExperience.structure }
    : null;
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

  // --- Structure authoring: drag-reorder + row actions --------------------
  // All ops route through the active experience's editable structure memory.
  const updateStructure = useCallback(
    (
      updater: (nodes: StructureNode[]) => StructureNode[],
      nextSelectedId?: string,
    ) => {
      if (!selectedExperienceId) return;
      const setter = isPage ? setPageMemory : setWidgetMemory;
      setter((prev) => {
        const cur = prev[selectedExperienceId];
        if (!cur) return prev;
        return {
          ...prev,
          [selectedExperienceId]: {
            ...cur,
            structure: updater(cur.structure),
            ...(nextSelectedId !== undefined
              ? { selectedNodeId: nextSelectedId }
              : {}),
          },
        };
      });
    },
    [isPage, selectedExperienceId]
  );

  const handleRenameNode = useCallback(
    (nodeId: string, label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      updateStructure((nodes) => renameNode(nodes, nodeId, trimmed));
    },
    [updateStructure]
  );

  const handleDuplicateNode = useCallback(
    (nodeId: string) => updateStructure((nodes) => duplicateNode(nodes, nodeId)),
    [updateStructure]
  );

  const handleCopyNode = useCallback(
    (nodeId: string) => {
      const nodes = active?.structure ?? [];
      const found = findNodeById(nodes, nodeId);
      if (found) setClipboard(cloneWithNewIds(found));
    },
    [active]
  );

  const handlePasteNode = useCallback(
    (afterId: string | null) => {
      if (!clipboard) return;
      // Fresh ids each paste so repeated pastes never collide.
      const toInsert = cloneWithNewIds(clipboard);
      updateStructure(
        (nodes) => insertAfter(nodes, afterId, toInsert),
        toInsert.id,
      );
    },
    [clipboard, updateStructure]
  );

  const handleToggleDisabled = useCallback(
    (nodeId: string) => updateStructure((nodes) => toggleDisabled(nodes, nodeId)),
    [updateStructure]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      // If the deleted node is currently selected, clear the selection.
      const clearSel = selectedStructureNodeId === nodeId;
      updateStructure(
        (nodes) => deleteNode(nodes, nodeId),
        clearSel ? "" : undefined,
      );
    },
    [updateStructure, selectedStructureNodeId]
  );

  const handleMoveNode = useCallback(
    (parentId: string | null, from: number, to: number) =>
      updateStructure((nodes) => moveWithin(nodes, parentId, from, to)),
    [updateStructure]
  );

  // --- Page builder: add a premade LAYOUT (a new top-level section) ---------
  // Open the Layout Picker, targeting an insert position relative to a section.
  const handleRequestAddLayout = useCallback(
    (position: "before" | "after" | "end", refId: string | null, refLabel?: string) => {
      setLayoutPicker({ position, refId, refLabel });
    },
    []
  );

  // Apply the chosen layout: build a fresh pre-filled section subtree and insert
  // it at the target slot, then select + expand it so the author lands on it.
  const handleChooseLayout = useCallback(
    (layoutId: string) => {
      const def = getLayoutDef(layoutId);
      if (!def || !selectedExperienceId || !layoutPicker) return;
      const node = def.build();
      const { position, refId } = layoutPicker;
      const setter = isPage ? setPageMemory : setWidgetMemory;
      setter((prev) => {
        const cur = prev[selectedExperienceId];
        if (!cur) return prev;
        const structure =
          position === "before"
            ? insertBefore(cur.structure, refId, node)
            : insertAfter(cur.structure, refId, node); // "after" or "end" (refId null)
        const expanded = new Set(cur.expanded).add(node.id);
        return {
          ...prev,
          [selectedExperienceId]: {
            ...cur,
            structure,
            expanded,
            selectedNodeId: node.id,
          },
        };
      });
      setLayoutPicker(null);
    },
    [isPage, selectedExperienceId, layoutPicker]
  );

  // Add a CHILD to a container (the "Add {itemNoun}" / add-plan action). Builds a
  // default instance of the container's child type, appends it, then selects +
  // expands the parent so the new card/row is visible and editable.
  const handleAddChild = useCallback(
    (parentId: string, childType: StructureObjectType) => {
      if (!selectedExperienceId) return;
      const child = createChildNode(childType);
      const setter = isPage ? setPageMemory : setWidgetMemory;
      setter((prev) => {
        const cur = prev[selectedExperienceId];
        if (!cur) return prev;
        const structure = appendChild(cur.structure, parentId, child);
        const expanded = new Set(cur.expanded).add(parentId);
        return {
          ...prev,
          [selectedExperienceId]: {
            ...cur,
            structure,
            expanded,
            selectedNodeId: child.id,
          },
        };
      });
    },
    [isPage, selectedExperienceId]
  );

  // Edit a property field on the selected object (live). This writes the value
  // onto the element INSTANCE's `content` within the variant's Structure — the
  // V4 analog of updatePlaceholderContentByPath — so the edit persists on the
  // instance and drives both the Properties panel and the live preview.
  const handleEditField = useCallback(
    (nodeId: string, label: string, value: string) => {
      updateStructure((nodes) => setNodeContent(nodes, nodeId, label, value));
    },
    [updateStructure]
  );

  // The selected instance's authored VALUES.
  const selectedNodeContent: Record<string, string> = selectedNode?.content ?? {};

  // MVT variations available in this experience, and the derived preview. When
  // an MVT override is active the canvas renders that variation's subtree;
  // otherwise it follows the tree selection.
  const variations = collectVariationNodes(activeExperience);
  // Drop a stale override if the active experience no longer has that variation.
  useEffect(() => {
    if (mvtOverride && !variations.some((v) => v.id === mvtOverride)) {
      setMvtOverride("");
    }
  }, [mvtOverride, variations]);
  // The preview composes the WHOLE variant (all sections) and is independent of
  // which layer is selected — selection only drives the edit panel + highlight.
  // It changes on variant switch, live field edits, or an MVT variation choice.
  const previewModel = derivePreviewModel(activeExperience, mvtOverride || null);

  // Validation across the whole experience (the invalidSections analog). Feeds
  // the save gate in the editor bar and the inline invalid marks on the selected
  // object's required fields.
  const issues = collectInvalidFields(activeExperience);
  const selectedInvalidFields = new Set(
    issues
      .filter((i) => i.nodeId === selectedStructureNodeId)
      .map((i) => i.field)
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
          {/* Right cluster: a save gate (blocked while required fields are empty,
              the checkValidationErrors analog) + the design-system catalog link. */}
          <div className="ml-auto flex items-center gap-2">
            {activeExperience && (
              <Button
                variant={issues.length > 0 ? "outline" : "default"}
                size="sm"
                disabled={issues.length > 0}
                title={
                  issues.length > 0
                    ? `${issues.length} required field${
                        issues.length === 1 ? "" : "s"
                      } need attention before saving`
                    : "All required fields complete"
                }
                onClick={() => {}}
              >
                <Icon name="check" size={16} />
                {issues.length > 0 ? `Save · ${issues.length} issue${issues.length === 1 ? "" : "s"}` : "Save"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(routes.designSystem())}
            >
              <Icon name="grid" size={16} />
              Design System
            </Button>
          </div>
        </div>
        <div
          className="ui-ws"
          style={{
            gridTemplateColumns: `${explorerWidth}px 6px minmax(0, 1fr) 380px`,
          }}
        >
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
            canPaste={clipboard != null}
            onRenameNode={handleRenameNode}
            onDuplicateNode={handleDuplicateNode}
            onCopyNode={handleCopyNode}
            onPasteNode={handlePasteNode}
            onToggleDisabledNode={handleToggleDisabled}
            onDeleteNode={handleDeleteNode}
            onMoveNode={handleMoveNode}
            onRequestAddLayout={handleRequestAddLayout}
          />
          {/* Drag handle: resize the Explorer column (tree/collection) against
              the preview, up to a max width. */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize structure panel"
            title="Drag to resize"
            onPointerDown={beginExplorerResize}
            onDoubleClick={() => setExplorerWidth(280)}
            className="group relative z-10 cursor-col-resize select-none"
          >
            <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--color-border-default)] transition-colors group-hover:bg-[var(--color-action-primary)]" />
            <span className="pointer-events-none absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100" style={{ background: "var(--color-action-primary)" }} />
          </div>
          <LivePreview
            variant={activeExperience}
            context={context}
            selectedObject={selectedObject}
            previewModel={previewModel}
            selectedId={selectedStructureNodeId}
            onPickSection={handleSelectStructureNode}
            variations={variations}
            mvtOverride={mvtOverride}
            onMvtChange={setMvtOverride}
          />
          <Properties
            context={context}
            variant={activeExperience}
            selectedRouteId={selectedRouteId}
            selectedStructureNodeId={selectedStructureNodeId}
            selectedObjectType={selectedNode?.objectType ?? null}
            content={selectedNodeContent}
            invalidFields={selectedInvalidFields}
            onEditField={handleEditField}
            onAddChild={handleAddChild}
            onRemoveChild={handleDeleteNode}
            onReorderChild={handleMoveNode}
          />
        </div>
      </div>
      {/* Page-builder: the Layout Picker modal (opened from the Structure pane's
          "+ Add layout" affordances). Selecting inserts a pre-filled section. */}
      <LayoutPicker
        open={layoutPicker != null}
        onOpenChange={(open) => {
          if (!open) setLayoutPicker(null);
        }}
        onSelect={handleChooseLayout}
        contextLabel={
          layoutPicker
            ? layoutPicker.position === "end"
              ? "at the end of the page"
              : `${layoutPicker.position === "before" ? "above" : "below"} ${
                  layoutPicker.refLabel ?? "this section"
                }`
            : undefined
        }
      />
    </AppShell>
  );
}
