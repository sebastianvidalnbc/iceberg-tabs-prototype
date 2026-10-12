import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Button, IconButton } from "../ui-lib/Button";
import { Badge } from "../ui-lib/Badge";
import { SearchInput, TextInput } from "../ui-lib/TextInput";
import { EmptyState } from "../ui-lib/EmptyState";
import { FilterChip } from "../ui-lib/FilterChip";
import { TableFooter } from "../ui-lib/TableFooter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/v4-eos/ui/dialog";
import { routes, navigate } from "../browse";
import {
  createContentPage,
  listContentPages,
  subscribeContentPages,
  type ContentPageRecord,
  type ContentPageStatus,
} from "../contentPages";

type StatusFilter = "all" | ContentPageStatus;

export function ContentPagesView() {
  const allRows = useSyncExternalStore(
    subscribeContentPages,
    listContentPages,
    listContentPages,
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [creating, setCreating] = useState(false);

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    return allRows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        r.territory.toLowerCase().includes(q) ||
        r.locale.toLowerCase().includes(q)
      );
    });
  }, [allRows, q, statusFilter]);

  useEffect(() => setPage(0), [q, statusFilter, pageSize]);

  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="ui-ws-browse">
      <header className="ui-ws-browse__head">
        <div className="ui-ws-browse__title">
          <h1 className="ui-ws-browse__h1">Content Pages</h1>
          <IconButton
            icon="plus"
            aria-label="Create content page"
            className="ui-ws-browse__add"
            onClick={() => setCreating(true)}
          />
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
            View Archived Templates
          </Button>
        </div>
      </div>

      <div className="ui-ws-browse__filters">
        <Button variant="tertiary" size="sm" leadingIcon="filter">
          All Filters
        </Button>
        <FilterChip
          label="Published"
          active={statusFilter === "Published"}
          onClick={() =>
            setStatusFilter((f) => (f === "Published" ? "all" : "Published"))
          }
        />
        <FilterChip
          label="Draft"
          active={statusFilter === "Draft"}
          onClick={() => setStatusFilter((f) => (f === "Draft" ? "all" : "Draft"))}
        />
        {statusFilter !== "all" && (
          <Button
            variant="tertiary"
            size="sm"
            leadingIcon="filter-off"
            onClick={() => setStatusFilter("all")}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div
        className="ui-ws-browse__table ui-ws-browse__table--content-pages"
        role="table"
        aria-label="Content Pages"
      >
        <div className="ui-ws-browse__row ui-ws-browse__row--head" role="row">
          <span role="columnheader">Template</span>
          <span role="columnheader">Territory</span>
          <span role="columnheader">Locale</span>
          <span role="columnheader">Modified</span>
          <span role="columnheader">By</span>
          <span role="columnheader" aria-label="Actions" />
        </div>

        {pageRows.length === 0 ? (
          <EmptyState
            title="No content pages match your search"
            description="Try a different name or clear the search/filters."
          />
        ) : (
          pageRows.map((row) => <ContentPageRow key={row.id} row={row} />)
        )}
      </div>

      <TableFooter
        page={page}
        pageSize={pageSize}
        total={rows.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <CreateContentPageDialog
        open={creating}
        onOpenChange={setCreating}
      />
    </div>
  );
}

function ContentPageRow({ row }: { row: ContentPageRecord }) {
  const open = () => navigate(routes.contentPage(row.id));
  return (
    <div className="ui-ws-browse__row" role="row">
      <span className="ui-ws-browse__slug ui-ws-browse__primary" role="cell">
        <span className="ui-ws-browse__chevron-spacer" aria-hidden="true" />
        <Badge variant={row.status === "Published" ? "success" : "default"}>
          {row.status}
        </Badge>
        <button type="button" className="ui-ws-browse__slug-link" onClick={open}>
          {row.name}
          <span className="ui-ws-browse__slug-count">{row.slug}</span>
        </button>
      </span>
      <span role="cell">{row.territory}</span>
      <span role="cell" className="ui-ws-browse__muted">
        {row.locale}
      </span>
      <span role="cell" className="ui-ws-browse__muted">
        {row.modified}
      </span>
      <span role="cell" className="ui-ws-browse__muted">
        {row.editedBy}
      </span>
      <span role="cell" className="ui-ws-browse__actions">
        <IconButton icon="eye" aria-label="Preview" size="sm" onClick={open} />
        <IconButton icon="copy" aria-label="Duplicate" size="sm" />
        <IconButton icon="archive" aria-label="Archive" size="sm" />
        <IconButton icon="trash" aria-label="Delete" size="sm" variant="tertiary" />
      </span>
    </div>
  );
}

function CreateContentPageDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [territory, setTerritory] = useState("");
  const [locale, setLocale] = useState("en-US");

  const reset = () => {
    setName("");
    setTerritory("");
    setLocale("en-US");
  };

  const canCreate = name.trim().length > 0 && territory.trim().length > 0;

  const submit = () => {
    if (!canCreate) return;
    const page = createContentPage({ name, territory, locale });
    reset();
    onOpenChange(false);
    navigate(routes.contentPage(page.id));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-[440px] p-0" showClose>
        <DialogHeader>
          <DialogTitle>Create content page</DialogTitle>
          <DialogDescription>
            A territory template wraps every ATOM title in that locale. You are
            not creating a page per title.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-5 py-4">
          <label className="flex flex-col gap-1">
            <span className="text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] font-semibold text-[var(--color-text-secondary)]">
              Name
            </span>
            <TextInput
              size="sm"
              value={name}
              onChange={setName}
              placeholder="Canada template"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] font-semibold text-[var(--color-text-secondary)]">
              Territory
            </span>
            <TextInput
              size="sm"
              value={territory}
              onChange={setTerritory}
              placeholder="Canada"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] font-semibold text-[var(--color-text-secondary)]">
              Locale
            </span>
            <TextInput
              size="sm"
              value={locale}
              onChange={setLocale}
              placeholder="en-CA"
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="tertiary" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!canCreate}
            onClick={submit}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
