import { useMemo, useState, type ReactNode } from "react";
import { PAGE_SIZE_OPTIONS } from "@/libs/hooks/usePagination";
import { cn } from "@/libs/utils/cn";
import { Icon } from "./Icon";
import { TableRowsSkeleton } from "./Skeleton";
import { Table, TD, TH, THead, TR } from "./Table";
import { TablePagination } from "./TablePagination";

export type SortDir = "asc" | "desc";

export type DataTableColumn<T> = {
  key: string;
  label: ReactNode;
  /** Cell content; defaults to `accessor(row)` or `row[key]`. */
  render?: (row: T, index: number) => ReactNode;
  /** Plain value used for sorting, search and default rendering. */
  accessor?: (row: T) => string | number | null | undefined;
  sortable?: boolean;
  className?: string;
  headClassName?: string;
};

type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  isLoading?: boolean;

  /** Row actions column. */
  renderActions?: (row: T) => ReactNode;
  /** "start" puts Action right after SL (as in the design reference); default "end". */
  actionsPosition?: "start" | "end";
  /** Leading serial-number column. Default true. */
  showSerial?: boolean;

  /** Built-in search box. Default true. */
  showSearch?: boolean;
  searchPlaceholder?: string;
  /** Text a row is searched by; defaults to all column accessors / values. */
  searchText?: (row: T) => string;
  /** Controlled search (optional). */
  search?: string;
  onSearchChange?: (value: string) => void;

  /** Extra filter controls shown in the toolbar next to the search. */
  filters?: ReactNode;
  showRowsPerPage?: boolean;
  defaultPageSize?: number;
  showPagination?: boolean;
  /** Plural noun for summaries ("leads"). */
  noun?: string;
  emptyText?: ReactNode;
  rowClassName?: (row: T) => string;
  minWidth?: number;
  /** Drop the outer padding (when embedded inside a padded section). */
  padded?: boolean;
};

function cellValue<T>(row: T, column: DataTableColumn<T>) {
  if (column.accessor) {
    return column.accessor(row);
  }

  const value = (row as Record<string, unknown>)[column.key];
  return typeof value === "string" || typeof value === "number" ? value : null;
}

function SortIcons({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="ml-1 inline-flex flex-col leading-none text-muted/50" aria-hidden="true">
      <Icon icon="solar:alt-arrow-up-linear" className={cn("size-2.5", active && dir === "asc" && "text-ink")} />
      <Icon icon="solar:alt-arrow-down-linear" className={cn("-mt-0.5 size-2.5", active && dir === "desc" && "text-ink")} />
    </span>
  );
}

/**
 * Client-side data table: toolbar (rows per page + search + filters), SL column, sortable
 * columns, row actions, skeleton rows while loading, and numbered pagination.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  isLoading = false,
  renderActions,
  actionsPosition = "end",
  showSerial = true,
  showSearch = true,
  searchPlaceholder = "Search...",
  searchText,
  search: controlledSearch,
  onSearchChange,
  filters,
  showRowsPerPage = true,
  defaultPageSize = 10,
  showPagination = true,
  noun = "rows",
  emptyText = "No records found.",
  rowClassName,
  minWidth = 640,
  padded = true,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const search = controlledSearch ?? internalSearch;

  function updateSearch(value: string) {
    if (onSearchChange) onSearchChange(value);
    else setInternalSearch(value);
    setPage(1);
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let data = term
      ? rows.filter((row) => {
          const haystack = searchText
            ? searchText(row)
            : columns.map((column) => cellValue(row, column) ?? "").join(" ");
          return haystack.toLowerCase().includes(term);
        })
      : rows;

    const sortColumn = sortKey ? columns.find((column) => column.key === sortKey) : undefined;

    if (sortColumn) {
      data = [...data].sort((a, b) => {
        const av = cellValue(a, sortColumn) ?? "";
        const bv = cellValue(b, sortColumn) ?? "";
        const compare =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? compare : -compare;
      });
    }

    return data;
  }, [rows, search, searchText, columns, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = showPagination
    ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filtered;
  const firstSerial = showPagination ? (currentPage - 1) * pageSize + 1 : 1;

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const actionsHead = renderActions ? <TH key="__actions" className="w-24">Action</TH> : null;
  const columnCount = columns.length + (showSerial ? 1 : 0) + (renderActions ? 1 : 0);
  const showToolbar = showRowsPerPage || showSearch || !!filters;

  return (
    <div>
      {showToolbar ? (
        <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", padded ? "px-4 py-3" : "pb-3")}>
          {showRowsPerPage ? (
            <label className="flex items-center gap-2 text-xs text-muted">
              Row Per Page
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-8 rounded-md border border-line bg-white px-2 text-xs text-ink outline-none focus:border-brand-dark focus:ring-2 focus:ring-brand/25"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              Entries
            </label>
          ) : (
            <span />
          )}

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {filters}
            {showSearch ? (
              <div className="relative w-full sm:w-64">
                <Icon
                  icon="solar:magnifer-linear"
                  className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted/70"
                />
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  value={search}
                  onChange={(event) => updateSearch(event.target.value)}
                  onKeyDown={(event) => {
                    // Filtering is live; stop Enter from submitting a surrounding form.
                    if (event.key === "Enter") event.preventDefault();
                  }}
                  className="h-8 w-full rounded-md border border-line bg-white pr-3 pl-8 text-xs text-ink outline-none placeholder:text-muted/60 focus:border-brand-dark focus:ring-2 focus:ring-brand/25"
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={padded ? "px-4 pb-4" : ""}>
        <Table minWidth={minWidth}>
          <THead>
            <tr>
              {showSerial ? <TH className="w-12 text-center">SL</TH> : null}
              {actionsPosition === "start" ? actionsHead : null}
              {columns.map((column) => (
                <TH key={column.key} className={column.headClassName} aria-sort={sortKey === column.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}>
                  {column.sortable ? (
                    <button type="button" onClick={() => toggleSort(column.key)} className="inline-flex items-center hover:text-ink">
                      {column.label}
                      <SortIcons active={sortKey === column.key} dir={sortDir} />
                    </button>
                  ) : (
                    column.label
                  )}
                </TH>
              ))}
              {actionsPosition === "end" ? actionsHead : null}
            </tr>
          </THead>
          <tbody>
            {isLoading ? (
              <TableRowsSkeleton columns={columnCount} rows={Math.min(pageSize, 6)} />
            ) : pageRows.length === 0 ? (
              <TR>
                <TD colSpan={columnCount} className="py-10 text-center text-muted">
                  {search ? `No ${noun} match “${search}”.` : emptyText}
                </TD>
              </TR>
            ) : (
              pageRows.map((row, index) => {
                const actionsCell = renderActions ? <TD key="__actions">{renderActions(row)}</TD> : null;

                return (
                  <TR key={getRowId(row)} className={rowClassName?.(row)}>
                    {showSerial ? <TD className="text-center text-muted tabular-nums">{firstSerial + index}</TD> : null}
                    {actionsPosition === "start" ? actionsCell : null}
                    {columns.map((column) => (
                      <TD key={column.key} className={column.className}>
                        {column.render ? column.render(row, index) : (cellValue(row, column) ?? "N/A")}
                      </TD>
                    ))}
                    {actionsPosition === "end" ? actionsCell : null}
                  </TR>
                );
              })
            )}
          </tbody>
        </Table>

        {showPagination && !isLoading ? (
          <TablePagination
            className="mt-4"
            page={currentPage}
            pageSize={pageSize}
            totalItems={filtered.length}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            noun={noun}
          />
        ) : null}
      </div>
    </div>
  );
}
