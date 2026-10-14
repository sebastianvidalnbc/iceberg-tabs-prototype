import { useState } from "react";
import { Panel, PanelHeader } from "@/v4-eos/ui/panel";
import { ScrollArea } from "@/v4-eos/ui/scroll-area";
import { StructureTreeRow } from "@/v4-eos/ui/structure-tree-row";
import { getContentPageOutlineVisual } from "@/v4-eos/ui/structure-tree-visual";
import {
  CONTENT_PAGE_OUTLINE,
  formatEditDate,
  type ContentPageHistory,
  type OutlineGroupId,
  type OutlineNode,
} from "../contentPages";

export function ContentPageOutline({
  selected,
  onSelect,
  title,
  history,
}: {
  selected: OutlineGroupId;
  onSelect: (id: OutlineGroupId) => void;
  title: string;
  history: ContentPageHistory;
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(["memberships"]));

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const render = (nodes: OutlineNode[], depth: number) =>
    nodes.map((node, index) => {
      const hasChildren = Boolean(node.children?.length);
      const isOpen = open.has(node.id);
      const visual = getContentPageOutlineVisual(node.id, { depth, index });
      return (
        <div key={node.id}>
          {visual.sectionBreak && (
            <div className="structure-tree-break" aria-hidden role="presentation" />
          )}
          <StructureTreeRow
            depth={depth}
            hasChildren={hasChildren}
            isOpen={isOpen}
            selected={selected === node.id}
            label={node.label}
            labelWeight={visual.labelWeight}
            icon={visual.icon}
            onSelect={() => onSelect(node.id)}
            onToggle={() => toggle(node.id)}
          />
          {hasChildren && isOpen && render(node.children!, depth + 1)}
        </div>
      );
    });

  return (
    <Panel className="ui-ws__region ui-ws-explorer" aria-label="Template">
      <div className="ui-ws-explorer__pane--pages flex min-h-0 flex-1 flex-col">
        <PanelHeader eyebrow="Content Pages" title={title} />
        <ScrollArea className="min-h-0 flex-1">
          <div
            className="structure-tree-root structure-tree-root--collection"
            role="tree"
            aria-label="Template outline"
          >
            {render(CONTENT_PAGE_OUTLINE, 0)}
          </div>
        </ScrollArea>
      </div>
      <div className="shrink-0 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2">
        <p className="text-[length:var(--type-body-sm-size)] leading-[length:var(--type-body-sm-lh)] text-[var(--color-text-muted)]">
          Last modified {formatEditDate(history.editDate)}
          {" "}
          by {history.editedBy}
        </p>
      </div>
    </Panel>
  );
}
