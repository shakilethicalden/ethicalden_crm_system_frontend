import { useMemo, useState } from "react";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/**
 * Client-side pagination over an already filtered list.
 * The current page is clamped whenever the list shrinks; call `resetPage()` when filters change.
 */
export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  function setPageSize(size: number) {
    setPageSizeState(size);
    setPage(1);
  }

  return {
    page: currentPage,
    pageSize,
    totalPages,
    totalItems: items.length,
    pageItems,
    setPage,
    setPageSize,
    resetPage: () => setPage(1),
  };
}

export type PaginationState = ReturnType<typeof usePagination>;
