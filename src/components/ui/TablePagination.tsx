import { PAGE_SIZE_OPTIONS } from "@/libs/hooks/usePagination";
import { cn } from "@/libs/utils/cn";
import { Icon, type IconName } from "./Icon";

/** Page numbers to show: always first & last, the current page ±1, and gaps in between. */
function pageWindow(page: number, totalPages: number): Array<number | "gap"> {
  if (totalPages <= 7) {
    return Array.from({ length: Math.max(1, totalPages) }, (_, index) => index + 1);
  }

  const out: Array<number | "gap"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) out.push("gap");
  for (let n = start; n <= end; n += 1) out.push(n);
  if (end < totalPages - 1) out.push("gap");
  out.push(totalPages);

  return out;
}

function Step({ icon, label, disabled, onClick }: { icon: IconName; label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-md border border-white/12 bg-white/8 text-white/55 transition-colors hover:border-brand/35 hover:bg-white/12 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/12 disabled:hover:text-white/55"
    >
      <Icon icon={icon} className="size-4" />
    </button>
  );
}

type TablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  /** Plural noun for the summary ("Showing 1-10 of 42 leads"). */
  noun?: string;
  className?: string;
};

export function TablePagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  noun = "rows",
  className,
}: TablePaginationProps) {
  const first = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);

  return (
    <div className={cn("flex flex-col-reverse items-center justify-between gap-3 sm:flex-row", className)}>
      <div className="flex items-center gap-3">
        <p className="text-xs text-white/55">
          {totalItems === 0 ? (
            <>No {noun}</>
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-white tabular-nums">
                {first.toLocaleString()}-{last.toLocaleString()}
              </span>{" "}
              of <span className="font-semibold text-white tabular-nums">{totalItems.toLocaleString()}</span> {noun}
            </>
          )}
        </p>
        <select
          aria-label="Rows per page"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-8 rounded-md border border-white/12 bg-white/8 px-2 text-xs text-white outline-none focus:border-brand/45 focus:ring-2 focus:ring-brand/20"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Step icon="solar:double-alt-arrow-left-linear" label="First page" disabled={page <= 1} onClick={() => onPageChange(1)} />
        <Step icon="solar:alt-arrow-left-linear" label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)} />

        {pageWindow(page, totalPages).map((n, index) =>
          n === "gap" ? (
            <span key={`gap-${index}`} className="px-1 text-xs text-white/45">
              &hellip;
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPageChange(n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "h-8 min-w-8 rounded-md px-2 text-xs font-semibold tabular-nums transition-colors",
                n === page
                  ? "bg-brand text-portal shadow-sm"
                  : "border border-white/12 bg-white/8 text-white/55 hover:border-brand/35 hover:bg-white/12 hover:text-brand",
              )}
            >
              {n}
            </button>
          ),
        )}

        <Step icon="solar:alt-arrow-right-linear" label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
        <Step icon="solar:double-alt-arrow-right-linear" label="Last page" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} />
      </nav>
    </div>
  );
}
