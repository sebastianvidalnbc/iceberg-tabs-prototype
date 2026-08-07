import type { ReactNode } from "react";
import { useStore } from "../store";
import { useDrag } from "../useDrag";
import { useMenu } from "../useMenu";
import { collectionKey, pathKind } from "../model";
import type { ListPath } from "../model";
import { Icon } from "./Icon";
import { Menu } from "./Menu";
import { TreeItem } from "./TreeItem";
import type { ItemVM } from "./TreeItem";

export function TreeCollection({
  path,
  title,
  items,
  addLabel,
  renderBody,
}: {
  path: ListPath;
  title: string;
  items: ItemVM[];
  addLabel: string;
  renderBody: (item: ItemVM) => ReactNode;
}) {
  const { state, dispatch } = useStore();
  const { menu, openAt, close } = useMenu();
  const drag = useDrag((from, to) => dispatch({ type: "reorder", path, from, to }));
  const key = collectionKey(path);
  const expandedId = state.expanded[key];

  const collMenu = [
    {
      label: "Paste",
      disabled: state.clipboard?.kind !== pathKind(path),
      onClick: () => dispatch({ type: "paste", path }),
    },
  ];

  return (
    <div className="tree-collection">
      <div className="tree-collection-head">
        <span className="tree-collection-title">{title}</span>
        <span className="pill">{items.length}</span>
        <button className="tree-add" onClick={() => dispatch({ type: "add", path })}>
          <Icon name="plus" /> {addLabel}
        </button>
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
      <div className="tree-list">
        {items.map((item, i) => (
          <TreeItem
            key={item.id}
            path={path}
            item={item}
            index={i}
            expanded={expandedId === item.id}
            onToggle={() => dispatch({ type: "toggleExpand", path, id: item.id })}
            drag={drag}
            renderBody={() => renderBody(item)}
          />
        ))}
        {items.length === 0 && <div className="empty small">No items yet.</div>}
      </div>
      {menu && <Menu x={menu.x} y={menu.y} items={menu.items} onClose={close} />}
    </div>
  );
}
