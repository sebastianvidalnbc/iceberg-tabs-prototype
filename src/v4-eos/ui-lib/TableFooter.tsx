import { IconButton } from "./Button";
import { Select } from "./Select";

// Eos "TableFooter" (Figma 488:8901, node 453:29053): rows-per-page select,
// an "X-Y of Z" range readout, and prev/next navigation. `page` is 0-indexed.
export interface TableFooterProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function TableFooter({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: TableFooterProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, pageCount - 1);
  const start = total === 0 ? 0 : clampedPage * pageSize + 1;
  const end = Math.min(total, (clampedPage + 1) * pageSize);
  const canPrev = clampedPage > 0;
  const canNext = end < total;

  return (
    <div className="ui-table-footer">
      <div className="ui-table-footer__size">
        <span className="ui-table-footer__label">Rows per page:</span>
        <Select
          size="sm"
          value={String(pageSize)}
          onChange={(v) => onPageSizeChange(Number(v))}
          options={pageSizeOptions.map((n) => ({ label: String(n), value: String(n) }))}
        />
      </div>
      <span className="ui-table-footer__range">
        {start}-{end} of {total}
      </span>
      <div className="ui-table-footer__nav">
        <IconButton
          icon="chevron-left"
          aria-label="Previous page"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(clampedPage - 1)}
        />
        <IconButton
          icon="chevron-right"
          aria-label="Next page"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(clampedPage + 1)}
        />
      </div>
    </div>
  );
}
