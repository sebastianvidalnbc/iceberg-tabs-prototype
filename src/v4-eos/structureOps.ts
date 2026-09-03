import type { StructureNode } from "./data";

// Pure, immutable tree operations backing the Structure tree's authoring
// interactions (drag-reorder + the overflow/context menu: rename, duplicate,
// copy, paste, disable, delete). All helpers return NEW arrays/nodes so React
// state updates stay referentially honest; none mutate their inputs.
//
// Nodes are addressed by id. Reordering is scoped to a sibling list identified
// by its parent id (null = the Structure root list), matching the per-list
// drag model in `useDrag`.

let cloneCounter = 0;

// Structural deep-copy that PRESERVES ids — used to seed editable per-experience
// state from the shared static dataset without ever mutating that constant.
export function cloneKeepIds(nodes: StructureNode[]): StructureNode[] {
  return nodes.map((n) => ({
    ...n,
    children: n.children ? cloneKeepIds(n.children) : undefined,
  }));
}

// Deep-clone a node, assigning fresh unique ids throughout so a duplicated /
// pasted subtree never collides with the original (ids drive selection).
export function cloneWithNewIds(node: StructureNode): StructureNode {
  const suffix = `copy-${Date.now().toString(36)}-${(cloneCounter++).toString(36)}`;
  const next: StructureNode = {
    ...node,
    id: `${node.id}-${suffix}`,
    children: node.children?.map(cloneWithNewIds),
  };
  return next;
}

export function findNodeById(
  nodes: StructureNode[],
  id: string,
): StructureNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const hit = findNodeById(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

export function renameNode(
  nodes: StructureNode[],
  id: string,
  label: string,
): StructureNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, label };
    if (n.children) return { ...n, children: renameNode(n.children, id, label) };
    return n;
  });
}

export function toggleDisabled(
  nodes: StructureNode[],
  id: string,
): StructureNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, disabled: !n.disabled };
    if (n.children) return { ...n, children: toggleDisabled(n.children, id) };
    return n;
  });
}

export function deleteNode(nodes: StructureNode[], id: string): StructureNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) =>
      n.children ? { ...n, children: deleteNode(n.children, id) } : n,
    );
}

// Insert `incoming` immediately after the node with `afterId`, in that node's
// sibling list (at any depth). If `afterId` is null/not found, append to root.
export function insertAfter(
  nodes: StructureNode[],
  afterId: string | null,
  incoming: StructureNode,
): StructureNode[] {
  if (!afterId) return [...nodes, incoming];
  let inserted = false;
  const walk = (list: StructureNode[]): StructureNode[] => {
    const out: StructureNode[] = [];
    for (const n of list) {
      const nextNode = n.children ? { ...n, children: walk(n.children) } : n;
      out.push(nextNode);
      if (n.id === afterId) {
        out.push(incoming);
        inserted = true;
      }
    }
    return out;
  };
  const result = walk(nodes);
  return inserted ? result : [...nodes, incoming];
}

// Duplicate the node with `id`, inserting the clone right after it (same list).
export function duplicateNode(
  nodes: StructureNode[],
  id: string,
): StructureNode[] {
  const original = findNodeById(nodes, id);
  if (!original) return nodes;
  return insertAfter(nodes, id, cloneWithNewIds(original));
}

// Reorder within a single sibling list identified by `parentId` (null = root).
export function moveWithin(
  nodes: StructureNode[],
  parentId: string | null,
  from: number,
  to: number,
): StructureNode[] {
  const reorder = (list: StructureNode[]): StructureNode[] => {
    if (from === to || from < 0 || to < 0) return list;
    if (from >= list.length || to >= list.length) return list;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  };
  if (parentId === null) return reorder(nodes);
  return nodes.map((n) => {
    if (n.id === parentId && n.children) {
      return { ...n, children: reorder(n.children) };
    }
    if (n.children) return { ...n, children: moveWithin(n.children, parentId, from, to) };
    return n;
  });
}
