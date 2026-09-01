import { useRef, useState } from "react";
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
  const { menu, openAt, openAtTrigger, close } = useMenu();
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(item.label);
  const overflowRef = useRef<HTMLButtonElement>(null);

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
      separatorBefore: true,
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
      separatorBefore: true,
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

  const bodyId = `${item.id}-body`;

  const head = (
    <>
      {/* Only the handle is draggable, so the disclosure control, the overflow
          menu and the rename field never start a drag. */}
      <span
        className={`${B}__grip ib-drag-handle`}
        title="Drag to reorder"
        aria-hidden="true"
        {...drag.gripProps(index)}
      >
        <Icon name="grip" />
      </span>
      {renaming ? (
        <>
          <span className={`${B}__chevron`}>
            <Icon name={expanded ? "chevron-down" : "chevron-right"} />
          </span>
          <input
            className={`${B}__rename`}
            aria-label="Rename"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              else if (e.key === "Escape") setRenaming(false);
            }}
          />
        </>
      ) : (
        // A real button so the accordion is keyboard-operable and exposes its
        // expanded state; the grip and overflow controls stay outside it so no
        // interactive element is nested inside another.
        <button
          type="button"
          className={`${B}__disclosure`}
          aria-expanded={expanded}
          aria-controls={expanded ? bodyId : undefined}
          onClick={onToggle}
        >
          <span className={`${B}__chevron`}>
            <Icon name={expanded ? "chevron-down" : "chevron-right"} />
          </span>
          <span className={`${B}__name`}>{item.label}</span>
        </button>
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
        ref={overflowRef}
        type="button"
        className={`${B}__overflow ib-overflow`}
        aria-label={`Actions for ${item.label}`}
        aria-haspopup="menu"
        aria-expanded={menu != null}
        // Keeps the click off the row header, so opening the menu never toggles
        // the accordion.
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          openAtTrigger(overflowRef.current, rowMenu());
        }}
      >
        <Icon name="dots" />
      </button>
    </>
  );

  const headProps = {
    ...drag.dropProps(index),
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault();
      openAt(e, rowMenu());
    },
  };

  const floatingMenu = menu && (
    <Menu
      x={menu.x}
      y={menu.y}
      align={menu.align}
      items={menu.items}
      onClose={close}
      className="ib-menu"
    />
  );

  if (card) {
    return (
      <div className={shellClass} data-drag-row>
        <div className={headClass} {...headProps}>
          {head}
        </div>
        {expanded && (
          <div className="ui-var-card__body" id={bodyId}>
            {renderBody()}
          </div>
        )}
        {floatingMenu}
      </div>
    );
  }

  return (
    <div className="ui-nrow-node" data-drag-row>
      <div className={headClass} {...headProps}>
        {head}
      </div>
      {expanded && (
        <div className="ui-nrow__children" id={bodyId}>
          {renderBody()}
        </div>
      )}
      {floatingMenu}
    </div>
  );
}
