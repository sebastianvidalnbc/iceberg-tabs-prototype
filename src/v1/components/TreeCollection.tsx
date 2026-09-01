import { useRef } from "react";
import type { ReactNode } from "react";
import { useStore } from "../store";
import { useToast } from "../../ui/Toast";
import { useDrag } from "../useDrag";
import { useMenu } from "../useMenu";
import { collectionKey, pathKind } from "../model";
import type { ListPath } from "../model";
import { Icon } from "../../ui/Icon";
import { Menu } from "./Menu";
import { TreeItem } from "./TreeItem";
import type { ItemVM, TreeVariant } from "./TreeItem";

export function TreeCollection({
  path,
  title,
  items,
  addLabel,
  renderBody,
  variant = "row",
}: {
  path: ListPath;
  title: string;
  items: ItemVM[];
  addLabel: string;
  renderBody: (item: ItemVM) => ReactNode;
  variant?: TreeVariant;
}) {
  const { state, dispatch } = useStore();
  const { notify } = useToast();
  const { menu, openAtTrigger, close } = useMenu();
  const overflowRef = useRef<HTMLButtonElement>(null);
  const drag = useDrag((from, to) => dispatch({ type: "reorder", path, from, to }));
  const key = collectionKey(path);
  const openIds = state.expanded[key] ?? [];
  const allOpen = items.length > 0 && openIds.length >= items.length;

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

  // Top-level Variations render as a quiet Level-4 collection header + card list;
  // nested collections keep the deeper, lighter tree header + row list.
  const card = variant === "card";

  return (
    <div className="tree-collection">
      <div className={card ? "ui-coll-head" : "tree-collection-head"}>
        <span className={card ? "ui-coll-head__title" : "tree-collection-title"}>{title}</span>
        <span className={card ? "ui-coll-head__count" : "pill"}>{items.length}</span>
        {card && <span className="ui-coll-head__spacer" />}
        {/* Grouped so the actions wrap together and stay right-aligned when the
            editor column is too narrow to fit them beside the title. */}
        <div className="tree-collection-actions">
          <button
            type="button"
            className="tree-add ib-btn"
            onClick={() => {
              dispatch({ type: "add", path });
              notify(`Added ${addLabel.replace(/^Add\s+/i, "")}`);
            }}
          >
            <Icon name="plus" /> {addLabel}
          </button>
          {items.length > 1 && (
            <button
              type="button"
              className="tree-expand-all ib-btn"
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
            ref={overflowRef}
            type="button"
            className="overflow ib-overflow"
            aria-label={`Actions for ${title}`}
            aria-haspopup="menu"
            aria-expanded={menu != null}
            onClick={(e) => {
              e.stopPropagation();
              openAtTrigger(overflowRef.current, collMenu);
            }}
          >
            <Icon name="dots" />
          </button>
        </div>
      </div>
      <div className={card ? "ui-var-list" : "tree-list"}>
        {items.map((item, i) => (
          <TreeItem
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
      {menu && (
        <Menu
          x={menu.x}
          y={menu.y}
          align={menu.align}
          items={menu.items}
          onClose={close}
          className="ib-menu"
        />
      )}
    </div>
  );
}
