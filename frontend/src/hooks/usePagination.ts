import { useState, useMemo, useEffect } from "react";

export interface PaginationResult<T> {
  items: T[];          // Items de la página actual
  page: number;        // Página actual (1-based)
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasPrev: boolean;
  hasNext: boolean;
  goTo: (page: number) => void;
  prev: () => void;
  next: () => void;
  setPageSize: (size: number) => void;
}

export function usePagination<T>(
  data: T[],
  initialPageSize = 10
): PaginationResult<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Cuando cambia el conjunto filtrado, volvemos a la primera página
  useEffect(() => {
    setPage(1);
  }, [data.length]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const items = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const prev = () => goTo(page - 1);
  const next = () => goTo(page + 1);

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  return {
    items,
    page,
    totalPages,
    totalItems: data.length,
    pageSize,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    goTo,
    prev,
    next,
    setPageSize,
  };
}
