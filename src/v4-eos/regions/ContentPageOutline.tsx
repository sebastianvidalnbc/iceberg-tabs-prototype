import { useState } from "react";
import { Panel } from "@/v4-eos/ui/panel";
import { ScrollArea } from "@/v4-eos/ui/scroll-area";
import { StructureTreeRow } from "@/v4-eos/ui/structure-tree-row";
import { getContentPageOutlineVisual } from "@/v4-eos/ui/structure-tree-visual";
import {
  CONTENT_PAGE_OUTLINE,
  CONTENT_PAGE_OUTLINE_DEFAULT_OPEN,
  type OutlineGroupId,
  type OutlineNode,
} from "../contentPages";

export function ContentPageOutline({
  selected,
  onSelect,
}: {
  selected: OutlineGroupId;
  onSelect: (id: OutlineGroupId) => void;
}) {
  const [open, setOpen] = useState<Set<string>>(() =>
    new Set(CONTENT_PAGE_OUTLINE_DEFAULT_OPEN),
  );
  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const render = (nodes: OutlineNode[], depth: number) =>
    nodes.map((node) => {
      const hasChildren = Boolean(node.children?.length);
      const isOpen = open.has(node.id);
      const visual = getContentPageOutlineVisual(node.id, { depth });
      const selectable = node.selectable !== false;
      return (
        <div key={node.id}>
          <StructureTreeRow
            depth={depth}
            sectionEntry
            hasChildren={hasChildren}
            isOpen={isOpen}
            selected={selectable && selected === node.id}
            label={node.label}
            labelWeight={visual.labelWeight}
            onSelect={() =>
              selectable ? onSelect(node.id) : toggle(node.id)
            }
            onToggle={() => toggle(node.id)}
          />
          {hasChildren && isOpen && render(node.children!, depth + 1)}
        </div>
      );
    });

  return (
    <Panel
      className="ui-ws__region ui-ws-explorer ui-ws-explorer--content-outline bg-[var(--color-bg-subtle)]"
      aria-label="Template"
    >
      <ScrollArea className="min-h-0 flex-1 basis-0">
        <div
          className="structure-tree-root structure-tree-root--collection structure-tree-root--outline-sections flex flex-col gap-1"
          role="tree"
          aria-label="Template outline"
        >
          {render(CONTENT_PAGE_OUTLINE, 0)}
        </div>
      </ScrollArea>
    </Panel>
  );
}
