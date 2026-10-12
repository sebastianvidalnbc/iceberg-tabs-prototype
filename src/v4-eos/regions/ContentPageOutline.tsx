import { useState } from "react";
import { Panel, PanelHeader } from "@/v4-eos/ui/panel";
import { TreeRow } from "@/v4-eos/ui/tree-row";
import {
  CONTENT_PAGE_OUTLINE,
  formatEditDate,
  type ContentPageHistory,
  type OutlineGroupId,
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

  return (
    <Panel className="ui-ws__region ui-ws-explorer" aria-label="Template">
      <PanelHeader eyebrow="Content Pages" title={title} />
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        <div role="tree" aria-label="Template outline">
          {CONTENT_PAGE_OUTLINE.map((node) => {
            const hasChildren = Boolean(node.children?.length);
            const isOpen = open.has(node.id);
            return (
              <div key={node.id} role="group">
                <TreeRow
                  depth={0}
                  hasChildren={hasChildren}
                  isOpen={isOpen}
                  selected={selected === node.id}
                  label={node.label}
                  onSelect={() => onSelect(node.id)}
                  onToggle={() => toggle(node.id)}
                />
                {hasChildren &&
                  isOpen &&
                  node.children?.map((child) => (
                    <TreeRow
                      key={child.id}
                      depth={1}
                      hasChildren={false}
                      isOpen={false}
                      selected={selected === child.id}
                      label={child.label}
                      onSelect={() => onSelect(child.id)}
                      onToggle={() => undefined}
                    />
                  ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 border-t border-[var(--color-border-subtle)] px-3 py-2">
        <p className="text-[length:var(--type-body-sm-size)] leading-[length:var(--type-body-sm-lh)] text-[var(--color-text-muted)]">
          Last modified {formatEditDate(history.editDate)}
          {" "}
          by {history.editedBy}
        </p>
      </div>
    </Panel>
  );
}
