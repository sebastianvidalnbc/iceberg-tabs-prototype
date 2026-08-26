import { useState } from "react";
import { Panel, PanelHeader, SearchInput } from "@/v2/ui/panel";
import { TreeRow } from "@/v2/ui/tree-row";
import { RowActionsMenu } from "@/v2/ui/row-actions";
import { ScrollArea } from "@/v2/ui/scroll-area";
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

// STRUCTURE tree — fully controlled by the shell so expansion + selection are
// scoped per active Variant. The Widget Offers collection (80+ children) gets a
// local search/filter affordance: when that node is expanded, a compact search
// row filters its children by label / segment name / voucher code / product id
// without mutating underlying order. Clearing restores the full list.
function StructureTree({
  nodes,
  selectedId,
  expanded,
  onSelect,
  onToggle,
}: {
  nodes: StructureNode[];
  selectedId: string | null;
  expanded: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [offerQuery, setOfferQuery] = useState("");
  const q = offerQuery.trim().toLowerCase();

  // Filters an Offers node's children against the search query. Non-Offers
  // nodes are returned unchanged. Order is preserved.
  const visibleChildren = (node: StructureNode): StructureNode[] => {
    const children = node.children ?? [];
    if (node.id !== WIDGET_OFFERS_NODE_ID || !q) return children;
    return children.filter((c) => {
      const idx = WIDGET_OFFER_FILTER_INDEX[c.id];
      if (!idx) return c.label.toLowerCase().includes(q);
      return idx.label.toLowerCase().includes(q) || idx.keys.includes(q);
    });
  };

  const render = (list: StructureNode[], depth: number) =>
    list.map((node) => {
      const isOffers = node.id === WIDGET_OFFERS_NODE_ID;
      const hasChildren = !!node.children && node.children.length > 0;
      const isOpen = expanded.has(node.id);
      const kids = visibleChildren(node);
      return (
        <div key={node.id}>
          <TreeRow
            depth={depth}
            hasChildren={hasChildren}
            isOpen={isOpen}
            selected={node.id === selectedId}
            muted={node.kind === "path"}
            label={node.label}
            trailing={<RowActionsMenu label={node.label} />}
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
          {hasChildren && isOpen && render(kids, depth + 1)}
        </div>
      );
    });

  return (
    <div className="flex flex-col gap-px px-2 py-2" role="tree">
      {render(nodes, 0)}
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
