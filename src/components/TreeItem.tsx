import { useState } from "react";
import type { ReactNode } from "react";
import { useStore } from "../store";
import { useMenu } from "../useMenu";
import { useDrag } from "../useDrag";
import { pathKind } from "../model";
import type { ListPath } from "../model";
import { Icon } from "./Icon";
import { Menu } from "./Menu";
import type { MenuItem } from "./Menu";

export interface ItemVM {
  id: string;
  label: string;
  disabled?: boolean;
  invalid?: boolean;
}

export function TreeItem({
  path,
  item,
  index,
  expanded,
  onToggle,
  drag,
  renderBody,
}: {
  path: ListPath;
  item: ItemVM;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  drag: ReturnType<typeof useDrag>;
  renderBody: () => ReactNode;
}) {
  const { state, dispatch } = useStore();
  const { menu, openAt, close } = useMenu();
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(item.label);

  const startRename = () => {
    setDraft(item.label);
    setRenaming(true);
  };
  const commitRename = () => {
    setRenaming(false);
    const next = draft.trim();
    if (next && next !== item.label) dispatch({ type: "rename", path, id: item.id, name: next });
  };

  const rowMenu = (): MenuItem[] => [
    { label: "Rename", onClick: startRename },
    { label: "Duplicate", onClick: () => dispatch({ type: "duplicate", path, id: item.id }) },
    { label: "Copy", onClick: () => dispatch({ type: "copy", path, id: item.id }) },
    {
      label: "Paste",
      disabled: state.clipboard?.kind !== pathKind(path),
      onClick: () => dispatch({ type: "paste", path }),
    },
    {
      label: item.disabled ? "Enable" : "Disable",
      onClick: () => dispatch({ type: "toggleDisabled", path, id: item.id }),
    },
    {
      label: "Delete",
      danger: true,
      separatorBefore: true,
      onClick: () => dispatch({ type: "delete", path, id: item.id }),
    },
  ];

  return (
    <div className="tree-node">
      <div
        className={`tree-row${expanded ? " open" : ""}${item.disabled ? " disabled" : ""}${
          drag.isDragging(index) ? " dragging" : ""
        }${drag.isOver(index) ? " drop-over" : ""}`}
        {...drag.handlers(index)}
        onClick={() => {
          if (!renaming) onToggle();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          openAt(e, rowMenu());
        }}
      >
        <span className="grip" title="Drag to reorder">
          <Icon name="grip" />
        </span>
        <span className="tree-caret">
          <Icon name={expanded ? "chevron-down" : "chevron-right"} />
        </span>
        {renaming ? (
          <input
            className="tree-rename-input"
            autoFocus
            value={draft}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              else if (e.key === "Escape") setRenaming(false);
            }}
          />
        ) : (
          <span className="tree-label">{item.label}</span>
        )}
        {item.invalid && !item.disabled && (
          <span className="status-dot invalid" title="Has validation issues">
            <Icon name="warning" />
          </span>
        )}
        {item.disabled && (
          <span className="tree-tag">
            <Icon name="ban" /> Disabled
          </span>
        )}
        <button
          className="overflow"
          onClick={(e) => {
            e.stopPropagation();
            openAt(e, rowMenu());
          }}
        >
          <Icon name="dots" />
        </button>
      </div>
      {expanded && <div className="tree-children">{renderBody()}</div>}
      {menu && <Menu x={menu.x} y={menu.y} items={menu.items} onClose={close} />}
    </div>
  );
}
