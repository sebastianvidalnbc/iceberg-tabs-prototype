import { useState } from "react";
import { Icon } from "../../ui/Icon";
import { SearchInput } from "../../ui/TextInput";
import {
  type AuthoringContext,
  type TreeNode,
  type StructureNode,
  type VariantWorkspace,
  WIDGET_OFFERS_NODE_ID,
  WIDGET_OFFER_FILTER_INDEX,
} from "../data";

// Row primitive shared by both trees. Chevron controls expansion only; the row
// body triggers selection.
function TreeRow({
  node,
  depth,
  isOpen,
  hasChildren,
  selected,
  onSelect,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  isOpen: boolean;
  hasChildren: boolean;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className={`ui-ws-tree__row${selected ? " ui-ws-tree__row--selected" : ""}`}
      style={{ paddingLeft: `calc(var(--space-2) + ${depth} * var(--indent-1))` }}
      onClick={onSelect}
      role="treeitem"
      aria-selected={selected}
      aria-expanded={hasChildren ? isOpen : undefined}
    >
      {hasChildren ? (
        <button
          type="button"
          className="ui-ws-tree__disc"
          aria-label={isOpen ? "Collapse" : "Expand"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <Icon name={isOpen ? "chevron-down" : "chevron-right"} size={12} />
        </button>
      ) : (
        <span className="ui-ws-tree__spacer" aria-hidden="true" />
      )}
      <span
        className={`ui-ws-tree__label${node.kind === "path" ? " ui-ws-tree__label--path" : ""}`}
      >
        {node.label}
      </span>
    </div>
  );
}

// Collection tree — mixes route rows and experience rows (Variants in Page
// context, Widget configs in Widget context). Expansion is local (routes are
// static). Clicking routes to onSelectRoute/onSelectExperience by node type.
// Remounted per context (via a React key) so its local expansion resets when
// the dataset changes.
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
            node={node}
            depth={depth}
            isOpen={isOpen}
            hasChildren={hasChildren}
            selected={node.id === selectedId}
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
    <div className="ui-ws-tree" role="tree">
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
            node={node}
            depth={depth}
            isOpen={isOpen}
            hasChildren={hasChildren}
            selected={node.id === selectedId}
            onSelect={() => onSelect(node.id)}
            onToggle={() => onToggle(node.id)}
          />
          {isOffers && isOpen && (
            <div
              style={{
                paddingLeft: `calc(var(--space-2) + ${depth + 1} * var(--indent-1))`,
                paddingRight: "var(--space-2)",
                paddingBlock: "var(--space-1)",
              }}
            >
              <SearchInput
                size="sm"
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
    <div className="ui-ws-tree" role="tree">
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
    <section className="ui-ws__region ui-ws-explorer" aria-label="Explorer">
      <div className="ui-ws-explorer__pane ui-ws-explorer__pane--pages">
        <div className="ui-ws-head ui-ws-head--stacked">
          <span className="ui-ws-head__eyebrow">{collectionHeader}</span>
          <SearchInput
            size="sm"
            value={collectionQuery}
            onChange={setCollectionQuery}
            onClear={() => setCollectionQuery("")}
            placeholder="Search…"
          />
        </div>
        <div className="ui-ws-explorer__scroll">
          <CollectionTree
            key={context}
            tree={collectionTree}
            selectedId={collectionSelectedId}
            onSelectRoute={onSelectRoute}
            onSelectExperience={onSelectExperience}
          />
        </div>
      </div>
      <div className="ui-ws-explorer__pane ui-ws-explorer__pane--structure">
        <div className="ui-ws-head ui-ws-head--stacked">
          <span className="ui-ws-head__eyebrow">Structure</span>
          <span className="ui-ws-head__sub">
            {activeExperience ? activeExperience.name : routeLabel ?? "—"}
          </span>
        </div>
        <div className="ui-ws-explorer__scroll">
          {activeExperience ? (
            <StructureTree
              nodes={activeExperience.structure}
              selectedId={selectedStructureNodeId}
              expanded={expanded}
              onSelect={onSelectStructureNode}
              onToggle={onToggleExpand}
            />
          ) : (
            <p className="ui-ws-explorer__empty">
              Select a {structureEmptyNoun} to view its structure.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
