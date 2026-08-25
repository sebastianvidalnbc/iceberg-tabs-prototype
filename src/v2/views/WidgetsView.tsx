import { useMemo, useState } from "react";
import { Button, IconButton } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { SearchInput } from "../../ui/TextInput";
import { EmptyState } from "../../ui/EmptyState";
import {
  buildWidgetRows,
  routes,
  navigate,
  type WidgetRow,
  type WidgetChildRow,
} from "../browse";

// Widgets list — mirrors real Iceberg's Widgets screen: a SINGLE list where each
// widget slug expands INLINE (rather than navigating away) to reveal the entries
// it owns under a "Pages:" label. Only one widget is expanded at a time. Clicking
// a child row opens the editor. All CTAs are prototype no-ops.
export function WidgetsView() {
  const allRows = useMemo(() => buildWidgetRows(), []);
  const [query, setQuery] = useState("");
  // Single-open accordion: the id of the currently expanded widget, or null.
  const [openId, setOpenId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const rows = q
    ? allRows.filter((r) => r.slug.toLowerCase().includes(q))
    : allRows;

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <div className="ui-ws-browse">
      <header className="ui-ws-browse__head">
        <div className="ui-ws-browse__title">
          <h1 className="ui-ws-browse__h1">Widgets</h1>
          <span className="ui-ws-browse__count">({allRows.length} results)</span>
          <IconButton icon="plus" aria-label="Create widget" variant="primary" />
        </div>
        <div className="ui-ws-browse__tools">
          <Button variant="secondary" size="sm">
            View Archived Widgets
          </Button>
          <SearchInput
            size="sm"
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
            placeholder="Search…"
          />
        </div>
      </header>

      <div className="ui-ws-browse__table ui-ws-browse__table--widgets" role="table" aria-label="Widgets">
        <div className="ui-ws-browse__row ui-ws-browse__row--head" role="row">
          <span role="columnheader">Slug</span>
          <span role="columnheader">Created</span>
          <span role="columnheader">Modified</span>
          <span role="columnheader" aria-label="Actions" />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No widgets match your search"
            description="Try a different slug or clear the search."
          />
        ) : (
          rows.map((r) => (
            <WidgetRowItem
              key={r.id}
              row={r}
              expanded={openId === r.id}
              onToggle={() => toggle(r.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function WidgetRowItem({
  row,
  expanded,
  onToggle,
}: {
  row: WidgetRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  // Leaf vs parent, mirroring Pages: a widget that owns child Pages is
  // expand-only (its chevron reveals them; each child opens the editor). A
  // childless widget is itself the editable experience, so its slug opens the
  // editor directly in widget context.
  const hasChildren = row.children.length > 0;
  const openSelf = () =>
    !hasChildren && navigate(routes.editor("widget", row.id));
  return (
    <>
      <div className="ui-ws-browse__row ui-ws-browse__row--widgets" role="row">
        <span className="ui-ws-browse__slug" role="cell">
          {hasChildren ? (
            <IconButton
              icon={expanded ? "chevron-down" : "chevron-right"}
              aria-label={expanded ? "Collapse" : "Expand"}
              aria-expanded={expanded}
              size="sm"
              onClick={onToggle}
            />
          ) : (
            <span className="ui-ws-browse__chevron-spacer" aria-hidden="true" />
          )}
          <Badge variant={row.status === "Published" ? "success" : "default"}>{row.status}</Badge>
          <button
            type="button"
            className="ui-ws-browse__slug-link"
            onClick={hasChildren ? onToggle : openSelf}
          >
            {row.slug}
          </button>
        </span>
        <span role="cell" className="ui-ws-browse__muted">{row.created}</span>
        <span role="cell" className="ui-ws-browse__muted">{row.modified}</span>
        <span role="cell" className="ui-ws-browse__actions">
          <IconButton icon="plus" aria-label="Add" size="sm" />
          <IconButton icon="search" aria-label="Preview" size="sm" />
          <IconButton icon="download" aria-label="Archive" size="sm" />
          <IconButton icon="trash" aria-label="Delete" size="sm" variant="tertiary" />
        </span>
      </div>
      {hasChildren && expanded && (
        <div className="ui-ws-browse__widget-children" role="rowgroup">
          <div className="ui-ws-browse__widget-children-label">Pages:</div>
          {row.children.map((c) => (
            <WidgetChildItem key={c.id} child={c} />
          ))}
        </div>
      )}
    </>
  );
}

function WidgetChildItem({ child }: { child: WidgetChildRow }) {
  const open = () => navigate(routes.editor("widget", child.id));
  return (
    <div className="ui-ws-browse__widget-child" role="row">
      <Badge variant={child.status === "Published" ? "success" : "default"}>{child.status}</Badge>
      <button type="button" className="ui-ws-browse__slug-link" onClick={open}>
        {child.name}
      </button>
    </div>
  );
}
