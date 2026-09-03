import type { CSSProperties, ReactNode } from "react";
import { Button } from "./Button";
import { ItemCountBadge } from "./Indicators";

// Token-driven indentation: prefer the --indent-{level} token, fall back to
// level*16px for arbitrary depth. Exposed as an inline --indent custom prop.
export function indentStyle(level = 0): CSSProperties {
  const token = level <= 4 ? `var(--indent-${level})` : `${level * 16}px`;
  return { ["--indent" as string]: token } as CSSProperties;
}

export interface CollectionHeaderProps {
  title: string;
  count?: number;
  onAdd?: () => void;
  actions?: ReactNode;
  expandAllSlot?: ReactNode;
}

export function CollectionHeader({
  title,
  count,
  onAdd,
  actions,
  expandAllSlot,
}: CollectionHeaderProps) {
  return (
    <div className="ui-collection__head">
      <span className="ui-collection__title">{title}</span>
      {count != null && <ItemCountBadge count={count} />}
      <div className="ui-collection__actions">
        {expandAllSlot}
        {actions}
        {onAdd && (
          <Button variant="tertiary" size="sm" leadingIcon="plus" onClick={onAdd}>
            Add
          </Button>
        )}
      </div>
    </div>
  );
}

export interface CollectionItemProps {
  level?: number;
  children: ReactNode;
}

export function CollectionItem({ level = 0, children }: CollectionItemProps) {
  return (
    <div className="ui-collection__item" style={indentStyle(level)}>
      {children}
    </div>
  );
}

// Semantic alias for a nested item; identical rendering, clearer intent.
export function NestedCollectionItem(props: CollectionItemProps) {
  return <CollectionItem {...props} />;
}
