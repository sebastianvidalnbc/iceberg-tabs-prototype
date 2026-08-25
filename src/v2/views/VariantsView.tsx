import { useMemo, useState } from "react";
import { Button, IconButton } from "../../ui/Button";
import { Badge, StatusDot } from "../../ui/Badge";
import { SearchInput } from "../../ui/TextInput";
import { Breadcrumb } from "../../ui/Breadcrumb";
import { EmptyState } from "../../ui/EmptyState";
import {
  buildVariantRows,
  findPageNode,
  routes,
  navigate,
  type VariantRow,
} from "../browse";

// Variants list — the second browse level ("Variants for /slug" in real
// Iceberg). Reached from a slug row; clicking a variant opens the editor. A
// breadcrumb keeps the author oriented. All CTAs are prototype no-ops.
export function VariantsView({ pageId }: { pageId: string }) {
  const page = useMemo(() => findPageNode(pageId), [pageId]);
  const allRows = useMemo(() => buildVariantRows(pageId), [pageId]);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = q ? allRows.filter((r) => r.name.toLowerCase().includes(q)) : allRows;

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
          <span className="ui-ws-browse__count">({allRows.length} results)</span>
          <IconButton icon="plus" aria-label="Create variant" variant="primary" />
        </div>
        <div className="ui-ws-browse__tools">
          <Button variant="secondary" size="sm">
            View Archived Variants
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

      <div className="ui-ws-browse__table ui-ws-browse__table--variants" role="table" aria-label={`Variants for ${slug}`}>
        <div className="ui-ws-browse__row ui-ws-browse__row--head" role="row">
          <span role="columnheader">Variant Name</span>
          <span role="columnheader">QA</span>
          <span role="columnheader">Publish</span>
          <span role="columnheader">Created</span>
          <span role="columnheader">Last modified</span>
          <span role="columnheader">Last modified by</span>
          <span role="columnheader" aria-label="Actions" />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No variants match your search"
            description="Try a different name or clear the search."
          />
        ) : (
          rows.map((r) => <VariantRowItem key={r.id} row={r} />)
        )}
      </div>
    </div>
  );
}

function qaBadge(qa: VariantRow["qaStatus"]) {
  if (qa === "Approved") return <Badge variant="success">Approved</Badge>;
  if (qa === "In review") return <Badge variant="warning">In review</Badge>;
  return <span className="ui-ws-browse__muted">—</span>;
}

function VariantRowItem({ row }: { row: VariantRow }) {
  const open = () => navigate(routes.editor(row.id));
  return (
    <div className="ui-ws-browse__row" role="row">
      <span role="cell">
        <button type="button" className="ui-ws-browse__slug-link" onClick={open}>
          {row.name}
        </button>
      </span>
      <span role="cell">{qaBadge(row.qaStatus)}</span>
      <span role="cell">
        {/* Prototype: publish toggle is a no-op reflecting the sampled state. */}
        <StatusDot status={row.published ? "success" : "default"}>
          {row.published ? "Published" : "Unpublished"}
        </StatusDot>
      </span>
      <span role="cell" className="ui-ws-browse__muted">{row.created}</span>
      <span role="cell" className="ui-ws-browse__muted">{row.lastModified}</span>
      <span role="cell" className="ui-ws-browse__muted">{row.lastModifiedBy}</span>
      <span role="cell" className="ui-ws-browse__actions">
        <IconButton icon="sliders" aria-label="Edit" size="sm" onClick={open} />
        <IconButton icon="blocks" aria-label="Duplicate" size="sm" />
        <IconButton icon="download" aria-label="Archive" size="sm" />
        <IconButton icon="trash" aria-label="Delete" size="sm" variant="tertiary" />
      </span>
    </div>
  );
}
