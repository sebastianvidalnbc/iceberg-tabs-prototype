import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useStore } from "../store";
import { useToast } from "../../ui/Toast";
import { useMenu } from "../useMenu";
import { useDrag } from "../useDrag";
import { pathKind } from "../model";
import type { ListPath } from "../model";
import { Icon } from "../../ui/Icon";
import { Menu } from "./Menu";
import type { MenuItem } from "./Menu";

export interface ItemVM {
  id: string;
  label: string;
  disabled?: boolean;
  invalid?: boolean;
}

export type TreeVariant = "card" | "row";

export function TreeItem({
  path,
  item,
  index,
  expanded,
  onToggle,
  drag,
  renderBody,
  variant = "row",
}: {
  path: ListPath;
  item: ItemVM;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  drag: ReturnType<typeof useDrag>;
  renderBody: () => ReactNode;
  variant?: TreeVariant;
}) {
  const { state, dispatch } = useStore();
  const { notify } = useToast();
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
    {
      label: "Duplicate",
      onClick: () => {
        dispatch({ type: "duplicate", path, id: item.id });
        notify(`Duplicated “${item.label}”`);
      },
    },
    {
      label: "Copy",
      onClick: () => {
        dispatch({ type: "copy", path, id: item.id });
        notify(`Copied “${item.label}”`);
      },
    },
    {
      label: "Paste",
      disabled: state.clipboard?.kind !== pathKind(path),
      onClick: () => {
        dispatch({ type: "paste", path });
        notify("Pasted item");
      },
    },
    {
      label: item.disabled ? "Enable" : "Disable",
      onClick: () => {
        dispatch({ type: "toggleDisabled", path, id: item.id });
        notify(`${item.disabled ? "Enabled" : "Disabled"} “${item.label}”`);
      },
    },
    {
      label: "Delete",
      danger: true,
      separatorBefore: true,
      onClick: () => {
        dispatch({ type: "delete", path, id: item.id });
        notify(`Deleted “${item.label}”`);
      },
    },
  ];

  // Card (Level 5, top-level Variations) vs. lightweight row (nested, deeper).
  const card = variant === "card";
  const B = card ? "ui-var-card" : "ui-nrow";
  const headClass = card
    ? `ui-var-card__head`
    : `ui-nrow${expanded ? " is-expanded" : ""}${item.disabled ? " is-disabled" : ""}${
        drag.isDragging(index) ? " is-dragging" : ""
      }${drag.isOver(index) ? " is-drop-over" : ""}`;
  const shellClass = card
    ? `ui-var-card${expanded ? " is-expanded" : ""}${item.disabled ? " is-disabled" : ""}${
        item.invalid && !item.disabled ? " is-warning" : ""
      }${drag.isDragging(index) ? " is-dragging" : ""}${drag.isOver(index) ? " is-drop-over" : ""}`
    : "";

  const head = (
    <>
      <span className={`${B}__grip`} title="Drag to reorder">
        <Icon name="grip" />
      </span>
      <span className={`${B}__chevron`}>
        <Icon name={expanded ? "chevron-down" : "chevron-right"} />
      </span>
      {renaming ? (
        <input
          className={`${B}__rename`}
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
        <span className={`${B}__name`}>{item.label}</span>
      )}
      {item.invalid && !item.disabled && (
        <span className="ui-row-warn" title="Has validation issues">
          <Icon name="warning" />
        </span>
      )}
      {item.disabled && (
        <span className="ui-row-tag">
          <Icon name="ban" /> Disabled
        </span>
      )}
      <button
        className={`${B}__overflow`}
        onClick={(e) => {
          e.stopPropagation();
          openAt(e, rowMenu());
        }}
      >
        <Icon name="dots" />
      </button>
    </>
  );

  const headProps = {
    ...drag.handlers(index),
    onClick: () => {
      if (!renaming) onToggle();
    },
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault();
      openAt(e, rowMenu());
    },
  };

  if (card) {
    return (
      <div className={shellClass}>
        <div className={headClass} {...headProps}>
          {head}
        </div>
        {expanded && <div className="ui-var-card__body">{renderBody()}</div>}
        {menu && <Menu x={menu.x} y={menu.y} items={menu.items} onClose={close} />}
      </div>
    );
  }

  return (
    <div className="ui-nrow-node">
      <div className={headClass} {...headProps}>
        {head}
      </div>
      {expanded && <div className="ui-nrow__children">{renderBody()}</div>}
      {menu && <Menu x={menu.x} y={menu.y} items={menu.items} onClose={close} />}
    </div>
  );
}
