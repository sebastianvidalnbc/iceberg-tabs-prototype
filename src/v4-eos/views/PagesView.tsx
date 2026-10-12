import { useEffect, useMemo, useState } from "react";
import { Button, IconButton } from "../ui-lib/Button";
import { Icon } from "../ui-lib/Icon";
import { Badge, StatusDot } from "../ui-lib/Badge";
import { SearchInput } from "../ui-lib/TextInput";
import { EmptyState } from "../ui-lib/EmptyState";
import { FilterChip } from "../ui-lib/FilterChip";
import { TableFooter } from "../ui-lib/TableFooter";
import {
  buildSlugRows,
  GROUP_SWATCHES,
  groupHueVars,
  routes,
  navigate,
  type GroupSwatch,
  type GroupSwatchId,
  type SlugRow,
} from "../browse";
import { BrowseGroupHeader, useGroupHues } from "../ui-lib/BrowseGroupHeader";

type VisibilityFilter = "all" | "Visible" | "Hidden";

// Pages list — the top browse level, mirroring real Iceberg's Pages table
// (Figma 488:8901: CardHeader → Toolbar → Filters → Table → TableFooter).
// Top-level slugs expand to reveal sub-pages; a row that owns Variants is
// clickable through to the Variants view. All CTAs besides search/filters/
// pagination are prototype no-ops.
export function PagesView() {
  const allRows = useMemo(() => buildSlugRows(), []);
  const { swatchFor, setGroupHue } = useGroupHues();
  const pageHueDefaults = useMemo(() => {
    const ids = [...new Set(allRows.filter((r) => r.depth === 0 && r.hasChildren).map((r) => r.groupId))];
    const map: Record<string, GroupSwatchId> = {};
    ids.forEach((id, i) => {
      map[id] = GROUP_SWATCHES[i % GROUP_SWATCHES.length].id;
    });
    return map;
  }, [allRows]);
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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
  // ancestor is collapsed by tracking a "hidden below depth" cursor. A search
  // query or an active Visibility filter drops the tree structure in favour of
  // a flat, fully-matching list (same as real Iceberg's filtered results).
  const q = query.trim().toLowerCase();
  const flatMode = q !== "" || visibilityFilter !== "all";
  const rows = useMemo(() => {
    if (flatMode) {
      return allRows.filter((r) => {
        if (q && !r.slug.toLowerCase().includes(q)) return false;
        if (visibilityFilter !== "all" && r.visibility !== visibilityFilter) return false;
        return true;
      });
    }
    const out: SlugRow[] = [];
    let hiddenBelow = Infinity;
    for (const r of allRows) {
      if (r.depth > hiddenBelow) continue;
      out.push(r);
      hiddenBelow = r.hasChildren && !expanded.has(r.id) ? r.depth : Infinity;
    }
    return out;
  }, [allRows, expanded, q, visibilityFilter, flatMode]);

  // Reset to page 1 whenever the visible row set changes shape.
  useEffect(() => setPage(0), [q, visibilityFilter, pageSize]);

  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="ui-ws-browse">
      <header className="ui-ws-browse__head">
        <div className="ui-ws-browse__title">
          <h1 className="ui-ws-browse__h1">Pages</h1>
          <IconButton icon="plus" aria-label="Create page" className="ui-ws-browse__add" />
        </div>
      </header>

      <div className="ui-ws-browse__toolbar">
        <SearchInput
          size="sm"
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          placeholder="Search…"
        />
        <div className="ui-ws-browse__tools">
          <Button variant="secondary" size="sm">
            View Archived Pages
          </Button>
        </div>
      </div>

      <div className="ui-ws-browse__filters">
        <Button variant="tertiary" size="sm" leadingIcon="filter">
          All Filters
        </Button>
        <FilterChip
          label="Visible"
          active={visibilityFilter === "Visible"}
          onClick={() => setVisibilityFilter((f) => (f === "Visible" ? "all" : "Visible"))}
        />
        <FilterChip
          label="Hidden"
          active={visibilityFilter === "Hidden"}
          onClick={() => setVisibilityFilter((f) => (f === "Hidden" ? "all" : "Hidden"))}
        />
        {visibilityFilter !== "all" && (
          <Button variant="tertiary" size="sm" leadingIcon="filter-off" onClick={() => setVisibilityFilter("all")}>
            Clear Filters
          </Button>
        )}
      </div>

      <div className="ui-ws-browse__table ui-ws-browse__table--pages" role="table" aria-label="Pages">
        <div className="ui-ws-browse__row ui-ws-browse__row--head" role="row">
          <span role="columnheader">Slug</span>
          <span role="columnheader">Search Visibility</span>
          <span role="columnheader">Un-Publish Date</span>
          <span role="columnheader">Created</span>
          <span role="columnheader">Modified</span>
          <span role="columnheader" aria-label="Actions" />
        </div>

        {pageRows.length === 0 ? (
          <EmptyState
            title="No pages match your search"
            description="Try a different slug or clear the search/filters."
          />
        ) : (
          pageRows.map((r) => {
            const fallback = pageHueDefaults[r.groupId] ?? "gray";
            const swatch = swatchFor(r.groupId, fallback);
            if (r.depth === 0 && r.hasChildren) {
              return (
                <BrowseGroupHeader
                  key={r.id}
                  name={r.slug}
                  count={r.childCount}
                  collapsed={!expanded.has(r.id)}
                  swatch={swatch}
                  onToggle={() => toggle(r.id)}
                  onSwatchChange={(id) => setGroupHue(r.groupId, id)}
                />
              );
            }
            return (
              <PageRow
                key={r.id}
                row={r}
                expanded={expanded.has(r.id)}
                swatch={r.depth > 0 ? swatch : undefined}
                onToggle={() => toggle(r.id)}
              />
            );
          })
        )}
      </div>

      <TableFooter
        page={page}
        pageSize={pageSize}
        total={rows.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

function PageRow({
  row,
  expanded,
  swatch,
  onToggle,
}: {
  row: SlugRow;
  expanded: boolean;
  swatch?: GroupSwatch;
  onToggle: () => void;
}) {
  // A slug is clickable when it is an editable experience: either it owns
  // Variants (→ Variants list) or it is a leaf route with no sub-pages
  // (→ straight to the editor). Parent slugs that own sub-pages stay
  // expand-only — opening one would just repeat its children in the editor's
  // Structure tree, which is redundant.
  const ownsVariants = row.variantCount > 0;
  const isLeaf = !row.hasChildren;
  const clickable = ownsVariants || isLeaf;
  const open = () => {
    if (!clickable) return;
    navigate(ownsVariants ? routes.variants(row.id) : routes.editor("page", row.id));
  };
  const nest = Math.max(0, row.depth - (swatch ? 1 : 0));
  return (
    <div className="ui-ws-browse__row" role="row" style={swatch ? groupHueVars(swatch) : undefined}>
      <span className="ui-ws-browse__slug ui-ws-browse__primary" role="cell" style={{ paddingLeft: `calc(${nest} * var(--space-5))` }}>
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
        <span className="ui-ws-browse__markers">
          {swatch && <span className="ui-ws-browse__fam-dot" aria-hidden="true" />}
          <span
            className={`ui-ws-browse__protect${row.protect ? " is-on" : ""}`}
            title={row.protect ? "This page is protected" : "This page is not protected"}
            aria-label={row.protect ? "Protected" : "Not protected"}
          >
            <Icon name="protect" size={14} />
          </span>
        </span>
        <Badge variant={row.status === "Published" ? "success" : "default"}>{row.status}</Badge>
        {clickable ? (
          <button type="button" className="ui-ws-browse__slug-link" onClick={open}>
            {row.slug}
            {ownsVariants && (
              <span className="ui-ws-browse__slug-count">{row.variantCount} variants</span>
            )}
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
        <IconButton icon="eye" aria-label="Preview" size="sm" />
        <IconButton icon="copy" aria-label="Duplicate" size="sm" />
        <IconButton icon="archive" aria-label="Archive" size="sm" />
        <IconButton icon="trash" aria-label="Delete" size="sm" variant="tertiary" />
      </span>
    </div>
  );
}
