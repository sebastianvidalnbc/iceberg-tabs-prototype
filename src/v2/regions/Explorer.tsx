import { useState } from "react";
import { Icon } from "../../ui/Icon";
import { SearchInput } from "../../ui/TextInput";
import {
  PAGES_TREE,
  type TreeNode,
  type StructureNode,
  type VariantWorkspace,
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
      className={`ui-tree__row${selected ? " ui-tree__row--selected" : ""}`}
      style={{ paddingLeft: `calc(var(--space-2) + ${depth} * var(--indent-1))` }}
      onClick={onSelect}
      role="treeitem"
      aria-selected={selected}
      aria-expanded={hasChildren ? isOpen : undefined}
    >
      {hasChildren ? (
        <button
          type="button"
          className="ui-tree__disc"
          aria-label={isOpen ? "Collapse" : "Expand"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <Icon name={isOpen ? "chevron-down" : "chevron-right"} size={12} />
        </button>
      ) : (
        <span className="ui-tree__spacer" aria-hidden="true" />
      )}
      <span
        className={`ui-tree__label${node.kind === "path" ? " ui-tree__label--path" : ""}`}
      >
        {node.label}
      </span>
    </div>
  );
}

// PAGES tree — mixes Page rows and Variant rows. Expansion is local (routes
// are static). Clicking routes to onSelectPage/onSelectVariant by node type.
function PagesTree({
  selectedId,
  onSelectPage,
  onSelectVariant,
}: {
  selectedId: string | null;
  onSelectPage: (id: string) => void;
  onSelectVariant: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const acc = new Set<string>();
    const walk = (nodes: TreeNode[]) => {
      for (const nd of nodes) {
        if (nd.defaultExpanded) acc.add(nd.id);
        if (nd.children) walk(nd.children);
      }
    };
    walk(PAGES_TREE);
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
              node.type === "variant" ? onSelectVariant(node.id) : onSelectPage(node.id)
            }
            onToggle={() => toggle(node.id)}
          />
          {hasChildren && isOpen && render(node.children!, depth + 1)}
        </div>
      );
    });

  return (
    <div className="ui-tree" role="tree">
      {render(PAGES_TREE, 0)}
    </div>
  );
}

// STRUCTURE tree — fully controlled by the shell so expansion + selection are
// scoped per active Variant.
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
  const render = (list: StructureNode[], depth: number) =>
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
            onSelect={() => onSelect(node.id)}
            onToggle={() => onToggle(node.id)}
          />
          {hasChildren && isOpen && render(node.children!, depth + 1)}
        </div>
      );
    });

  return (
    <div className="ui-tree" role="tree">
      {render(nodes, 0)}
    </div>
  );
}

// Finds a node's label anywhere in the PAGES tree (for the Structure empty
// state header when a Page is selected).
function findPageLabel(id: string | null): string | null {
  if (!id) return null;
  let result: string | null = null;
  const walk = (nodes: TreeNode[]) => {
    for (const nd of nodes) {
      if (nd.id === id) result = nd.label;
      if (nd.children) walk(nd.children);
    }
  };
  walk(PAGES_TREE);
  return result;
}

interface ExplorerProps {
  selectedPageId: string | null;
  selectedVariantId: string | null;
  activeVariant: VariantWorkspace | null;
  selectedStructureNodeId: string | null;
  expanded: Set<string>;
  onSelectPage: (id: string) => void;
  onSelectVariant: (id: string) => void;
  onSelectStructureNode: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

// Explorer region: two persistent panes (PAGES / STRUCTURE) that scroll
// independently. Navigation only — no editable fields. Expanding a node
// reveals children; selecting a Variant loads its Structure; selecting a
// Structure row drives Properties.
export function Explorer({
  selectedPageId,
  selectedVariantId,
  activeVariant,
  selectedStructureNodeId,
  expanded,
  onSelectPage,
  onSelectVariant,
  onSelectStructureNode,
  onToggleExpand,
}: ExplorerProps) {
  const [pageQuery, setPageQuery] = useState("");
  // The highlighted PAGES row is whichever of page/variant is active.
  const pagesSelectedId = selectedVariantId ?? selectedPageId;
  const pageLabel = findPageLabel(selectedPageId);

  return (
    <section className="ui-ws__region ui-ws-explorer" aria-label="Explorer">
      <div className="ui-ws-explorer__pane ui-ws-explorer__pane--pages">
        <div className="ui-ws-head ui-ws-head--stacked">
          <span className="ui-ws-head__eyebrow">Pages</span>
          <SearchInput
            size="sm"
            value={pageQuery}
            onChange={setPageQuery}
            onClear={() => setPageQuery("")}
            placeholder="Search…"
          />
        </div>
        <div className="ui-ws-explorer__scroll">
          <PagesTree
            selectedId={pagesSelectedId}
            onSelectPage={onSelectPage}
            onSelectVariant={onSelectVariant}
          />
        </div>
      </div>
      <div className="ui-ws-explorer__pane ui-ws-explorer__pane--structure">
        <div className="ui-ws-head ui-ws-head--stacked">
          <span className="ui-ws-head__eyebrow">Structure</span>
          <span className="ui-ws-head__sub">
            {activeVariant ? activeVariant.name : pageLabel ?? "—"}
          </span>
        </div>
        <div className="ui-ws-explorer__scroll">
          {activeVariant ? (
            <StructureTree
              nodes={activeVariant.structure}
              selectedId={selectedStructureNodeId}
              expanded={expanded}
              onSelect={onSelectStructureNode}
              onToggle={onToggleExpand}
            />
          ) : (
            <p className="ui-ws-explorer__empty">
              Select a variant to view its structure.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
