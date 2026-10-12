import { useEffect, useMemo, useState } from "react";
import { Button, IconButton } from "../ui-lib/Button";
import { Icon } from "../ui-lib/Icon";
import { Badge, StatusDot } from "../ui-lib/Badge";
import { SearchInput } from "../ui-lib/TextInput";
import { Breadcrumb } from "../ui-lib/Breadcrumb";
import { FilterChip } from "../ui-lib/FilterChip";
import { TableFooter } from "../ui-lib/TableFooter";
import { EmptyState } from "../ui-lib/EmptyState";
import {
  buildVariantRows,
  findPageNode,
  routes,
  navigate,
  type VariantRow,
} from "../browse";

type QaFilter = "all" | "Approved" | "In review";

// Variants list — the second browse level ("Variants for /slug" in real
// Iceberg; Figma 488:8901: CardHeader → Toolbar → Filters → Table →
// TableFooter). Reached from a slug row; clicking a variant opens the editor.
// A breadcrumb keeps the author oriented. All CTAs besides search/filters/
// pagination are prototype no-ops.
export function VariantsView({ pageId }: { pageId: string }) {
  const page = useMemo(() => findPageNode(pageId), [pageId]);
  const allRows = useMemo(() => buildVariantRows(pageId), [pageId]);
  const [query, setQuery] = useState("");
  const [qaFilter, setQaFilter] = useState<QaFilter>("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const q = query.trim().toLowerCase();
  const rows = useMemo(
    () =>
      allRows.filter((r) => {
        if (q && !r.name.toLowerCase().includes(q)) return false;
        if (qaFilter !== "all" && r.qaStatus !== qaFilter) return false;
        return true;
      }),
    [allRows, q, qaFilter]
  );

  useEffect(() => setPageIndex(0), [q, qaFilter, pageSize]);

  const pageRows = rows.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);

  const slug = page?.label ?? pageId;

  return (
    <div className="ui-ws-browse">
      <Breadcrumb
        items={[
          { label: "Pages", href: routes.pages(), onClick: () => navigate(routes.pages()) },
          { label: slug },
        ]}
      />
      <header className="ui-ws-browse__head">
        <div className="ui-ws-browse__title">
          <h1 className="ui-ws-browse__h1">Variants for {slug}</h1>
          <IconButton icon="plus" aria-label="Create variant" className="ui-ws-browse__add" />
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
            View Archived Variants
          </Button>
        </div>
      </div>

      <div className="ui-ws-browse__filters">
        <Button variant="tertiary" size="sm" leadingIcon="filter">
          All Filters
        </Button>
        <FilterChip
          label="Approved"
          active={qaFilter === "Approved"}
          onClick={() => setQaFilter((f) => (f === "Approved" ? "all" : "Approved"))}
        />
        <FilterChip
          label="In review"
          active={qaFilter === "In review"}
          onClick={() => setQaFilter((f) => (f === "In review" ? "all" : "In review"))}
        />
        {qaFilter !== "all" && (
          <Button variant="tertiary" size="sm" leadingIcon="filter-off" onClick={() => setQaFilter("all")}>
            Clear Filters
          </Button>
        )}
      </div>

      <div className="ui-ws-browse__table ui-ws-browse__table--variants" role="table" aria-label={`Variants for ${slug}`}>
        <div className="ui-ws-browse__row ui-ws-browse__row--head" role="row">
          <span role="columnheader">Variant Name</span>
          <span role="columnheader">QA Status</span>
          <span role="columnheader">Optimizely</span>
          <span role="columnheader">Publish</span>
          <span role="columnheader">Scheduled time</span>
          <span role="columnheader">Un-Published time</span>
          <span role="columnheader">Created</span>
          <span role="columnheader">Last modified</span>
          <span role="columnheader">Last modified by</span>
          <span role="columnheader" aria-label="Actions" />
        </div>

        {pageRows.length === 0 ? (
          <EmptyState
            title="No variants match your search"
            description="Try a different name or clear the search/filters."
          />
        ) : (
          pageRows.map((r) => <VariantRowItem key={r.id} row={r} />)
        )}
      </div>

      <TableFooter
        page={pageIndex}
        pageSize={pageSize}
        total={rows.length}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

function qaBadge(qa: VariantRow["qaStatus"]) {
  if (qa === "Approved") return <Badge variant="success">Approved</Badge>;
  if (qa === "In review") return <Badge variant="warning">In review</Badge>;
  return <span className="ui-ws-browse__muted">—</span>;
}

function VariantRowItem({ row }: { row: VariantRow }) {
  const open = () => navigate(routes.editor("page", row.id));
  return (
    <div className="ui-ws-browse__row" role="row">
      <span className="ui-ws-browse__primary" role="cell">
        <button type="button" className="ui-ws-browse__slug-link" onClick={open}>
          {row.name}
        </button>
      </span>
      <span role="cell">{qaBadge(row.qaStatus)}</span>
      <span
        className={`ui-ws-browse__optimizely${row.optimizely ? " is-on" : ""}`}
        role="cell"
        title={row.optimizely ? "Optimizely is on" : "Optimizely is off"}
        aria-label={row.optimizely ? "Optimizely on" : "Optimizely off"}
      >
        <Icon name="flask" size={16} />
      </span>
      <span role="cell">
        {/* Prototype: publish toggle is a no-op reflecting the sampled state. */}
        <StatusDot status={row.published ? "success" : "default"}>
          {row.published ? "Published" : "Unpublished"}
        </StatusDot>
      </span>
      <span role="cell" className="ui-ws-browse__muted">{row.scheduled}</span>
      <span role="cell" className="ui-ws-browse__muted">{row.unpublished}</span>
      <span role="cell" className="ui-ws-browse__muted">{row.created}</span>
      <span role="cell" className="ui-ws-browse__muted">{row.lastModified}</span>
      <span role="cell" className="ui-ws-browse__muted">{row.lastModifiedBy}</span>
      <span role="cell" className="ui-ws-browse__actions">
        <IconButton icon="edit" aria-label="Edit" size="sm" onClick={open} />
        <IconButton icon="copy" aria-label="Duplicate" size="sm" />
        <IconButton icon="archive" aria-label="Archive" size="sm" />
        <IconButton icon="trash" aria-label="Delete" size="sm" variant="tertiary" />
      </span>
    </div>
  );
}
