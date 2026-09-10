import { Fragment, useMemo, useState } from "react";
import { Button, IconButton } from "../ui-lib/Button";
import { Badge } from "../ui-lib/Badge";
import { Icon } from "../ui-lib/Icon";
import { SearchInput } from "../ui-lib/TextInput";
import { SegmentedControl } from "../ui-lib/SegmentedControl";
import { EmptyState } from "../ui-lib/EmptyState";
import {
  buildWidgetRows,
  groupWidgetRows,
  WIDGET_TYPE_ORDER,
  routes,
  navigate,
  type WidgetRow,
  type WidgetChildRow,
  type WidgetType,
} from "../browse";

// Widgets list — a SINGLE list, now organised by widget Type so 20+ mixed
// widgets stay scannable. A Type filter sits above the table and rows are
// grouped under collapsible Type section headers (Retention pinned first).
// Search matches slugs; a widget slug still expands INLINE to reveal the entries
// it owns under a "Pages:" label. Clicking a child opens the editor. All CTAs
// are prototype no-ops.
export function WidgetsView() {
  const allRows = useMemo(() => buildWidgetRows(), []);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | WidgetType>("all");
  // Single-open accordion: the id of the currently expanded widget, or null.
  const [openId, setOpenId] = useState<string | null>(null);
  // Per-Type collapse memory for the group section headers.
  const [collapsedGroups, setCollapsedGroups] = useState<Set<WidgetType>>(
    () => new Set(),
  );

  const q = query.trim().toLowerCase();
  const searched = q
    ? allRows.filter((r) => r.slug.toLowerCase().includes(q))
    : allRows;

  // Per-Type counts over the current search results — drive the filter labels.
  const typeCounts = useMemo(() => {
    const acc = {} as Record<WidgetType, number>;
    for (const r of searched) acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, [searched]);

  // If the active type filter has no matches after a search, fall back to All so
  // the list never looks empty for a still-selected-but-absent type.
  const effectiveFilter =
    typeFilter !== "all" && !typeCounts[typeFilter] ? "all" : typeFilter;

  const filtered =
    effectiveFilter === "all"
      ? searched
      : searched.filter((r) => r.type === effectiveFilter);
  const groups = groupWidgetRows(filtered);

  // Searching, or narrowing to one type, forces every visible group open so
  // matches are never hidden behind a collapsed header.
  const forceOpen = q !== "" || effectiveFilter !== "all";
  const isCollapsed = (t: WidgetType) => !forceOpen && collapsedGroups.has(t);

  const filterOptions = [
    { label: `All (${searched.length})`, value: "all" },
    ...WIDGET_TYPE_ORDER.filter((t) => typeCounts[t] > 0).map((t) => ({
      label: `${t} (${typeCounts[t]})`,
      value: t,
    })),
  ];

  const toggleRow = (id: string) => setOpenId((cur) => (cur === id ? null : id));
  const toggleGroup = (t: WidgetType) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  return (
    <div className="ui-ws-browse">
      <header className="ui-ws-browse__head">
        <div className="ui-ws-browse__title">
          <h1 className="ui-ws-browse__h1">Widgets</h1>
          <span className="ui-ws-browse__count">({allRows.length} results)</span>
          <IconButton icon="plus" aria-label="Create widget" className="ui-ws-browse__add" />
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

      <div className="ui-ws-browse__filters">
        <SegmentedControl
          aria-label="Filter widgets by type"
          options={filterOptions}
          value={effectiveFilter}
          onChange={(v) => setTypeFilter(v as "all" | WidgetType)}
        />
      </div>

      <div className="ui-ws-browse__table ui-ws-browse__table--widgets" role="table" aria-label="Widgets">
        <div className="ui-ws-browse__row ui-ws-browse__row--head" role="row">
          <span role="columnheader">Slug</span>
          <span role="columnheader">Created</span>
          <span role="columnheader">Modified</span>
          <span role="columnheader" aria-label="Actions" />
        </div>

        {groups.length === 0 ? (
          <EmptyState
            title="No widgets match your search"
            description="Try a different slug, clear the search, or switch the type filter."
          />
        ) : (
          groups.map((g) => {
            const collapsed = isCollapsed(g.type);
            return (
              <Fragment key={g.type}>
                <WidgetGroupHeader
                  type={g.type}
                  count={g.rows.length}
                  collapsed={collapsed}
                  onToggle={() => toggleGroup(g.type)}
                />
                {!collapsed &&
                  g.rows.map((r) => (
                    <WidgetRowItem
                      key={r.id}
                      row={r}
                      expanded={openId === r.id}
                      onToggle={() => toggleRow(r.id)}
                    />
                  ))}
              </Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}

// Collapsible Type section header spanning the full table width. Groups the
// widget rows beneath it (Retention, Plan Picker, …) so the list is scannable.
function WidgetGroupHeader({
  type,
  count,
  collapsed,
  onToggle,
}: {
  type: WidgetType;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="ui-ws-browse__group"
      data-fam={type}
      aria-expanded={!collapsed}
      onClick={onToggle}
    >
      <Icon
        name={collapsed ? "chevron-right" : "chevron-down"}
        className="ui-ws-browse__group-chevron"
      />
      <span className="ui-ws-browse__group-name">{type}</span>
      <span className="ui-ws-browse__group-count">{count}</span>
    </button>
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
      <div className="ui-ws-browse__row ui-ws-browse__row--widgets" data-fam={row.type} role="row">
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
          <span className="ui-ws-browse__widget-fam-dot" aria-hidden="true" />
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
          <IconButton icon="eye" aria-label="Preview" size="sm" />
          <IconButton icon="archive" aria-label="Archive" size="sm" />
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
