import { useMemo, useState } from "react";
import { Button, IconButton } from "../../ui/Button";
import { Badge, StatusDot } from "../../ui/Badge";
import { SearchInput } from "../../ui/TextInput";
import { EmptyState } from "../../ui/EmptyState";
import { buildSlugRows, routes, navigate, type SlugRow } from "../browse";

// Pages list — the top browse level, mirroring real Iceberg's "Pages (N Results)"
// table. Top-level slugs expand to reveal sub-pages; a row that owns Variants is
// clickable through to the Variants view. All CTAs are prototype no-ops.
export function PagesView() {
  const allRows = useMemo(() => buildSlugRows(), []);
  const [query, setQuery] = useState("");
  // Locally track which slugs are expanded (top-level rows collapsed by default,
  // except those already expanded in the sample tree cannot be known here, so we
  // start with all depth-0 rows expanded to reveal the nested structure).
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(allRows.filter((r) => r.depth === 0).map((r) => r.id))
  );

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // A row is visible when every ancestor page in its path is expanded. Because
  // rows are pre-ordered depth-first, we can hide any row whose nearest shown
  // ancestor is collapsed by tracking a "hidden below depth" cursor.
  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    if (q) return allRows.filter((r) => r.slug.toLowerCase().includes(q));
    const out: SlugRow[] = [];
    let hiddenBelow = Infinity;
    for (const r of allRows) {
      if (r.depth > hiddenBelow) continue;
      out.push(r);
      hiddenBelow = r.hasChildren && !expanded.has(r.id) ? r.depth : Infinity;
    }
    return out;
  }, [allRows, expanded, q]);

  return (
    <div className="ui-ws-browse">
      <header className="ui-ws-browse__head">
        <div className="ui-ws-browse__title">
          <h1 className="ui-ws-browse__h1">Pages</h1>
          <span className="ui-ws-browse__count">({allRows.length} results)</span>
          <IconButton icon="plus" aria-label="Create page" variant="primary" />
        </div>
        <div className="ui-ws-browse__tools">
          <Button variant="secondary" size="sm">
            View Archived Pages
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

      <div className="ui-ws-browse__table" role="table" aria-label="Pages">
        <div className="ui-ws-browse__row ui-ws-browse__row--head" role="row">
          <span role="columnheader">Slug</span>
          <span role="columnheader">Search Visibility</span>
          <span role="columnheader">Un-Publish Date</span>
          <span role="columnheader">Created</span>
          <span role="columnheader">Modified</span>
          <span role="columnheader" aria-label="Actions" />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No pages match your search"
            description="Try a different slug or clear the search."
          />
        ) : (
          rows.map((r) => <PageRow key={r.id} row={r} expanded={expanded.has(r.id)} onToggle={() => toggle(r.id)} />)
        )}
      </div>
    </div>
  );
}

function PageRow({ row, expanded, onToggle }: { row: SlugRow; expanded: boolean; onToggle: () => void }) {
  const clickable = row.variantCount > 0;
  const open = () => clickable && navigate(routes.variants(row.id));
  return (
    <div className="ui-ws-browse__row" role="row">
      <span className="ui-ws-browse__slug" role="cell" style={{ paddingLeft: `calc(${row.depth} * var(--space-5))` }}>
        {row.hasChildren ? (
          <IconButton
            icon={expanded ? "chevron-down" : "chevron-right"}
            aria-label={expanded ? "Collapse" : "Expand"}
            size="sm"
            onClick={onToggle}
          />
        ) : (
          <span className="ui-ws-browse__chevron-spacer" aria-hidden="true" />
        )}
        <Badge variant={row.status === "Published" ? "success" : "default"}>{row.status}</Badge>
        {clickable ? (
          <button type="button" className="ui-ws-browse__slug-link" onClick={open}>
            {row.slug}
            <span className="ui-ws-browse__slug-count">{row.variantCount} variants</span>
          </button>
        ) : (
          <span className="ui-ws-browse__slug-text">{row.slug}</span>
        )}
      </span>
      <span role="cell">
        <StatusDot status={row.visibility === "Visible" ? "success" : "default"}>{row.visibility}</StatusDot>
      </span>
      <span role="cell" className="ui-ws-browse__muted">{row.unpublishDate ?? "—"}</span>
      <span role="cell" className="ui-ws-browse__muted">{row.created}</span>
      <span role="cell" className="ui-ws-browse__muted">{row.modified}</span>
      <span role="cell" className="ui-ws-browse__actions">
        <IconButton icon="plus" aria-label="Add" size="sm" />
        <IconButton icon="search" aria-label="Preview" size="sm" />
        <IconButton icon="blocks" aria-label="Duplicate" size="sm" />
        <IconButton icon="download" aria-label="Archive" size="sm" />
        <IconButton icon="trash" aria-label="Delete" size="sm" variant="tertiary" />
      </span>
    </div>
  );
}
