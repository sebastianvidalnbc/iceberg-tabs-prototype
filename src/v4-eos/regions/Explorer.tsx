import { useState } from "react";
import { Panel, PanelHeader, SearchInput } from "@/v4-eos/ui/panel";
import { TreeRow } from "@/v4-eos/ui/tree-row";
import { RowActionsMenu } from "@/v4-eos/ui/row-actions";
import { ScrollArea } from "@/v4-eos/ui/scroll-area";
import { MSym } from "@/v4-eos/ui/msym";
import { useDrag } from "@/v4-eos/ui/useDrag";
import {
  type AuthoringContext,
  type TreeNode,
  type StructureNode,
  type VariantWorkspace,
  WIDGET_OFFERS_NODE_ID,
  WIDGET_OFFER_FILTER_INDEX,
} from "../data";

// Collection tree — mixes route rows and experience rows (Variants in Page
// context, Widget configs in Widget context). Expansion is local (routes are
// static). Clicking routes to onSelectRoute/onSelectExperience by node type.
// Remounted per context (via a React key) so its local expansion resets when
// the dataset changes. Rows use the V2-local shadcn-based TreeRow (§16).
function CollectionTree({
  tree,
  selectedId,
  onSelectRoute,
  onSelectExperience,
}: {
  tree: TreeNode[];
  selectedId: string | null;
  onSelectRoute: (id: string) => void;
  onSelectExperience: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const acc = new Set<string>();
    const walk = (nodes: TreeNode[]) => {
      for (const nd of nodes) {
        if (nd.defaultExpanded) acc.add(nd.id);
        if (nd.children) walk(nd.children);
      }
    };
    walk(tree);
    return acc;
  });

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const render = (list: TreeNode[], depth: number) =>
    list.map((node) => {
      const hasChildren = !!node.children && node.children.length > 0;
      const isOpen = expanded.has(node.id);
      return (
        <div key={node.id}>
          <TreeRow
            depth={depth}
            hasChildren={hasChildren}
            isOpen={isOpen}
            selected={node.id === selectedId}
            muted={node.kind === "path"}
            label={node.label}
            onSelect={() =>
              node.type === "variant"
                ? onSelectExperience(node.id)
                : onSelectRoute(node.id)
            }
            onToggle={() => toggle(node.id)}
          />
          {hasChildren && isOpen && render(node.children!, depth + 1)}
        </div>
      );
    });

  return (
    <div className="flex flex-col gap-px px-2 py-2" role="tree">
      {render(tree, 0)}
    </div>
  );
}

// Structure authoring actions supplied by the shell (operate on the editable
// per-experience structure state). Backs both drag-reorder and the row's
// overflow menu (rename / duplicate / copy / paste / disable / delete).
interface StructureActions {
  canPaste: boolean;
  onRenameNode: (id: string, label: string) => void;
  onDuplicateNode: (id: string) => void;
  onCopyNode: (id: string) => void;
  onPasteNode: (afterId: string | null) => void;
  onToggleDisabledNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onMoveNode: (parentId: string | null, from: number, to: number) => void;
}

// One sibling list within the Structure tree. Each level owns its own drag
// state (via useDrag) so reordering is scoped to that parent's children — you
// drag a layer among its siblings. Rows expose a grip handle (drag), a
// disclosure control, an inline rename field, and an overflow menu.
function StructureLevel({
  nodes,
  parentId,
  depth,
  dragDisabled,
  selectedId,
  expanded,
  renamingId,
  draft,
  setDraft,
  startRename,
  commitRename,
  cancelRename,
  onSelect,
  onToggle,
  actions,
  offerQuery,
  setOfferQuery,
}: {
  nodes: StructureNode[];
  parentId: string | null;
  depth: number;
  dragDisabled?: boolean;
  selectedId: string | null;
  expanded: Set<string>;
  renamingId: string | null;
  draft: string;
  setDraft: (v: string) => void;
  startRename: (id: string, label: string) => void;
  commitRename: (id: string) => void;
  cancelRename: () => void;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  actions: StructureActions;
  offerQuery: string;
  setOfferQuery: (v: string) => void;
}) {
  const drag = useDrag((from, to) => actions.onMoveNode(parentId, from, to));
  const q = offerQuery.trim().toLowerCase();

  // Filters an Offers node's children against the search query (order preserved).
  const visibleChildren = (node: StructureNode): StructureNode[] => {
    const children = node.children ?? [];
    if (node.id !== WIDGET_OFFERS_NODE_ID || !q) return children;
    return children.filter((c) => {
      const idx = WIDGET_OFFER_FILTER_INDEX[c.id];
      if (!idx) return c.label.toLowerCase().includes(q);
      return idx.label.toLowerCase().includes(q) || idx.keys.includes(q);
    });
  };

  return (
    <>
      {nodes.map((node, index) => {
        const isOffers = node.id === WIDGET_OFFERS_NODE_ID;
        const hasChildren = !!node.children && node.children.length > 0;
        const isOpen = expanded.has(node.id);
        const kids = visibleChildren(node);
        // Reorder must map to the real structure, so drag is disabled while the
        // Offers list is filtered (indices would not match).
        const childDragDisabled = isOffers && !!q;
        const grip = dragDisabled ? null : (
          <span
            {...drag.gripProps(index)}
            onClick={(e) => e.stopPropagation()}
            className="flex size-4 shrink-0 cursor-grab items-center justify-center text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            title="Drag to reorder"
            aria-hidden
          >
            <MSym name="drag_indicator" size={16} />
          </span>
        );
        return (
          <div key={node.id}>
            <TreeRow
              depth={depth}
              hasChildren={hasChildren}
              isOpen={isOpen}
              selected={node.id === selectedId}
              muted={node.kind === "path"}
              disabled={node.disabled}
              grip={grip}
              dropHandlers={dragDisabled ? undefined : drag.dropProps(index)}
              isDragging={drag.isDragging(index)}
              isOver={drag.isOver(index)}
              label={
                renamingId === node.id ? (
                  <input
                    autoFocus
                    aria-label="Rename"
                    className="w-full rounded-sm border border-input bg-background px-1 py-0.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => commitRename(node.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(node.id);
                      else if (e.key === "Escape") cancelRename();
                    }}
                  />
                ) : (
                  node.label
                )
              }
              trailing={
                <RowActionsMenu
                  label={node.label}
                  disabled={node.disabled}
                  canPaste={actions.canPaste}
                  onRename={() => startRename(node.id, node.label)}
                  onDuplicate={() => actions.onDuplicateNode(node.id)}
                  onCopy={() => actions.onCopyNode(node.id)}
                  onPaste={() => actions.onPasteNode(node.id)}
                  onToggleDisabled={() => actions.onToggleDisabledNode(node.id)}
                  onDelete={() => actions.onDeleteNode(node.id)}
                />
              }
              onSelect={() => onSelect(node.id)}
              onToggle={() => onToggle(node.id)}
            />
            {isOffers && isOpen && (
              <div
                className="py-1 pr-2"
                style={{ paddingLeft: 8 + (depth + 1) * 16 }}
              >
                <SearchInput
                  value={offerQuery}
                  onChange={setOfferQuery}
                  onClear={() => setOfferQuery("")}
                  placeholder="Search offers…"
                />
              </div>
            )}
            {hasChildren && isOpen && (
              <StructureLevel
                nodes={kids}
                parentId={node.id}
                depth={depth + 1}
                dragDisabled={childDragDisabled}
                selectedId={selectedId}
                expanded={expanded}
                renamingId={renamingId}
                draft={draft}
                setDraft={setDraft}
                startRename={startRename}
                commitRename={commitRename}
                cancelRename={cancelRename}
                onSelect={onSelect}
                onToggle={onToggle}
                actions={actions}
                offerQuery={offerQuery}
                setOfferQuery={setOfferQuery}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

// STRUCTURE tree — fully controlled by the shell so expansion + selection are
// scoped per active Variant. Layers can be drag-reordered among siblings and
// edited via each row's overflow menu. The Widget Offers collection (80+
// children) keeps its local search/filter affordance.
function StructureTree({
  nodes,
  selectedId,
  expanded,
  onSelect,
  onToggle,
  actions,
}: {
  nodes: StructureNode[];
  selectedId: string | null;
  expanded: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  actions: StructureActions;
}) {
  const [offerQuery, setOfferQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const startRename = (id: string, label: string) => {
    setDraft(label);
    setRenamingId(id);
  };
  const commitRename = (id: string) => {
    actions.onRenameNode(id, draft);
    setRenamingId(null);
  };
  const cancelRename = () => setRenamingId(null);

  return (
    <div className="flex flex-col gap-px px-2 py-2" role="tree">
      <StructureLevel
        nodes={nodes}
        parentId={null}
        depth={0}
        selectedId={selectedId}
        expanded={expanded}
        renamingId={renamingId}
        draft={draft}
        setDraft={setDraft}
        startRename={startRename}
        commitRename={commitRename}
        cancelRename={cancelRename}
        onSelect={onSelect}
        onToggle={onToggle}
        actions={actions}
        offerQuery={offerQuery}
        setOfferQuery={setOfferQuery}
      />
    </div>
  );
}

// Finds a node's label anywhere in the given collection tree (for the Structure
// empty-state header when a route — not an experience — is selected).
function findRouteLabel(tree: TreeNode[], id: string | null): string | null {
  if (!id) return null;
  let result: string | null = null;
  const walk = (nodes: TreeNode[]) => {
    for (const nd of nodes) {
      if (nd.id === id) result = nd.label;
      if (nd.children) walk(nd.children);
    }
  };
  walk(tree);
  return result;
}

interface ExplorerProps {
  context: AuthoringContext;
  collectionTree: TreeNode[];
  collectionHeader: string; // plural collection name (PAGES / WIDGETS)
  selectedRouteId: string | null;
  selectedExperienceId: string | null;
  activeExperience: VariantWorkspace | null;
  selectedStructureNodeId: string | null;
  expanded: Set<string>;
  onSelectRoute: (id: string) => void;
  onSelectExperience: (id: string) => void;
  onSelectStructureNode: (id: string) => void;
  onToggleExpand: (id: string) => void;
  canPaste: boolean;
  onRenameNode: (id: string, label: string) => void;
  onDuplicateNode: (id: string) => void;
  onCopyNode: (id: string) => void;
  onPasteNode: (afterId: string | null) => void;
  onToggleDisabledNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onMoveNode: (parentId: string | null, from: number, to: number) => void;
}

// Explorer region: two persistent panes (collection / STRUCTURE) that scroll
// independently. Navigation only — no editable fields. Expanding a node
// reveals children; selecting an experience loads its Structure; selecting a
// Structure row drives Properties. The collection pane's dataset and header
// follow the active AuthoringContext.
export function Explorer({
  context,
  collectionTree,
  collectionHeader,
  selectedRouteId,
  selectedExperienceId,
  activeExperience,
  selectedStructureNodeId,
  expanded,
  onSelectRoute,
  onSelectExperience,
  onSelectStructureNode,
  onToggleExpand,
  canPaste,
  onRenameNode,
  onDuplicateNode,
  onCopyNode,
  onPasteNode,
  onToggleDisabledNode,
  onDeleteNode,
  onMoveNode,
}: ExplorerProps) {
  const [collectionQuery, setCollectionQuery] = useState("");
  // The highlighted collection row is whichever of route/experience is active.
  const collectionSelectedId = selectedExperienceId ?? selectedRouteId;
  const routeLabel = findRouteLabel(collectionTree, selectedRouteId);
  const structureEmptyNoun = context === "widget" ? "widget config" : "variant";

  return (
    // Keep the shell grid contract (.ui-ws__region) on the outer element; the
    // panel internals are fully shadcn/Tailwind (§8). Dark panel surface.
    <Panel className="ui-ws__region" aria-label="Explorer">
      {/* Collection pane */}
      <div className="flex min-h-0 flex-[0_1_42%] flex-col">
        <PanelHeader
          eyebrow={collectionHeader}
          actions={
            <div className="w-40">
              <SearchInput
                value={collectionQuery}
                onChange={setCollectionQuery}
                onClear={() => setCollectionQuery("")}
              />
            </div>
          }
        />
        <ScrollArea className="min-h-0 flex-1">
          <CollectionTree
            key={context}
            tree={collectionTree}
            selectedId={collectionSelectedId}
            onSelectRoute={onSelectRoute}
            onSelectExperience={onSelectExperience}
          />
        </ScrollArea>
      </div>
      {/* Structure pane */}
      <div className="flex min-h-0 flex-[1_1_58%] flex-col border-t border-[var(--color-border-strong)]">
        <PanelHeader
          eyebrow="Structure"
          sub={activeExperience ? activeExperience.name : routeLabel ?? "—"}
        />
        <ScrollArea className="min-h-0 flex-1">
          {activeExperience ? (
            <StructureTree
              nodes={activeExperience.structure}
              selectedId={selectedStructureNodeId}
              expanded={expanded}
              onSelect={onSelectStructureNode}
              onToggle={onToggleExpand}
              actions={{
                canPaste,
                onRenameNode,
                onDuplicateNode,
                onCopyNode,
                onPasteNode,
                onToggleDisabledNode,
                onDeleteNode,
                onMoveNode,
              }}
            />
          ) : (
            <p className="m-3 text-[13px] leading-relaxed text-muted-foreground">
              Select a {structureEmptyNoun} to view its structure.
            </p>
          )}
        </ScrollArea>
      </div>
    </Panel>
  );
}
