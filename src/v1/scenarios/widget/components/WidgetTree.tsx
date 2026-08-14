import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useToast } from "../../../../ui/Toast";
import { useDrag } from "../../../useDrag";
import { useMenu } from "../../../useMenu";
import { Icon } from "../../../../ui/Icon";
import { Menu } from "../../../components/Menu";
import type { MenuItem } from "../../../components/Menu";
import { collectionKey, pathKind } from "../model";
import type { WidgetPath } from "../model";
import { useWidgetStore } from "../store";

// Widget-scoped copy of the Page scenario's generic TreeCollection/TreeItem. The
// rendering, CSS classes, hooks and Menu are identical to the Page tree — only
// the store/model binding (useWidgetStore + WidgetPath) differs, so the existing
// Page tree components are not touched. Rows can supply their own resolved label.

export interface ItemVM {
  id: string;
  label: string;
  disabled?: boolean;
  invalid?: boolean;
}

export type TreeVariant = "card" | "row";

export function WidgetTree({
  path,
  title,
  items,
  addLabel,
  renderBody,
  variant = "row",
  headerExtra,
  headClassName,
}: {
  path: WidgetPath;
  title: string;
  items: ItemVM[];
  addLabel: string;
  renderBody: (item: ItemVM) => ReactNode;
  variant?: TreeVariant;
  // Optional slot rendered between the count and the Add button (e.g. search).
  headerExtra?: ReactNode;
  // Optional extra class on the header row (e.g. to allow wrapping).
  headClassName?: string;
}) {
  const { state, dispatch } = useWidgetStore();
  const { notify } = useToast();
  const { menu, openAt, close } = useMenu();
  const drag = useDrag((from, to) => dispatch({ type: "reorder", path, from, to }));
  const key = collectionKey(path);
  const openIds = state.expanded[key] ?? [];
  const allOpen = items.length > 0 && openIds.length >= items.length;
  const card = variant === "card";

  const collMenu = [
    {
      label: "Paste",
      disabled: state.clipboard?.kind !== pathKind(path),
      onClick: () => {
        dispatch({ type: "paste", path });
        notify(`Pasted into ${title}`);
      },
    },
  ];

  return (
    <div className="tree-collection">
      <div
        className={`${card ? "ui-coll-head" : "tree-collection-head"}${
          headClassName ? ` ${headClassName}` : ""
        }`}
      >
        <span className={card ? "ui-coll-head__title" : "tree-collection-title"}>{title}</span>
        <span className={card ? "ui-coll-head__count" : "pill"}>{items.length}</span>
        {headerExtra}
        {card && <span className="ui-coll-head__spacer" />}
        <button
          className="tree-add"
          onClick={() => {
            dispatch({ type: "add", path });
            notify(`Added ${addLabel.replace(/^Add\s+/i, "")}`);
          }}
        >
          <Icon name="plus" /> {addLabel}
        </button>
        {items.length > 1 && (
          <button
            className="tree-expand-all"
            title={allOpen ? "Collapse all" : "Expand all"}
            onClick={() =>
              allOpen
                ? dispatch({ type: "collapseAll", path })
                : dispatch({ type: "expandAll", path, ids: items.map((it) => it.id) })
            }
          >
            <Icon name={allOpen ? "chevron-down" : "chevron-right"} />
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )}
        <button
          className="overflow"
          onClick={(e) => {
            e.stopPropagation();
            openAt(e, collMenu);
          }}
        >
          <Icon name="dots" />
        </button>
      </div>
      <div className={card ? "ui-var-list" : "tree-list"}>
        {items.map((item, i) => (
          <WidgetTreeItem
            key={item.id}
            path={path}
            item={item}
            index={i}
            expanded={openIds.includes(item.id)}
            onToggle={() => dispatch({ type: "toggleExpand", path, id: item.id })}
            drag={drag}
            variant={variant}
            renderBody={() => renderBody(item)}
          />
        ))}
        {items.length === 0 && <div className="empty small">No items yet.</div>}
      </div>
      {menu && <Menu x={menu.x} y={menu.y} items={menu.items} onClose={close} />}
    </div>
  );
}

function WidgetTreeItem({
  path,
  item,
  index,
  expanded,
  onToggle,
  drag,
  renderBody,
  variant = "row",
}: {
  path: WidgetPath;
  item: ItemVM;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  drag: ReturnType<typeof useDrag>;
  renderBody: () => ReactNode;
  variant?: TreeVariant;
}) {
  const { state, dispatch } = useWidgetStore();
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
