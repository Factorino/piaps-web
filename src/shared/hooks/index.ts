import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type {
  PaginationDto,
  SortParam,
  FilterParam,
  SearchRequest,
} from "@/shared/types";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export interface UseSearchParamsReturn {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  debouncedSearch: string;
  filters: FilterParam[];
  setFilters: (f: FilterParam[]) => void;
  addFilter: (f: FilterParam) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  sort: SortParam[];
  setSort: (s: SortParam[]) => void;
  toggleSort: (field: string) => void;
  pagination: PaginationDto;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  buildSearchRequest: (searchField?: string) => SearchRequest;
}

export function useSearchParams(
  defaultPageSize: number = 25,
): UseSearchParamsReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [filters, setFilters] = useState<FilterParam[]>([]);
  const [sort, setSort] = useState<SortParam[]>([]);
  const [pagination, setPagination] = useState<PaginationDto>({
    page: 1,
    page_size: defaultPageSize,
  });

  const addFilter = useCallback((f: FilterParam) => {
    setFilters((prev) => {
      const without = prev.filter((p) => p.field !== f.field);
      return [...without, f];
    });
    setPagination((p) => ({ ...p, page: 1 }));
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFilters((prev) => prev.filter((p) => p.field !== field));
    setPagination((p) => ({ ...p, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setPagination((p) => ({ ...p, page: 1 }));
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSort((prev) => {
      const existing = prev.find((s) => s.field === field);
      if (!existing) return [{ field, direction: "asc" }];
      if (existing.direction === "asc") return [{ field, direction: "desc" }];
      return [];
    });
  }, []);

  const setPage = useCallback(
    (page: number) => setPagination((p) => ({ ...p, page })),
    [],
  );
  const setPageSize = useCallback(
    (page_size: number) => setPagination({ page: 1, page_size }),
    [],
  );

  const buildSearchRequest = useCallback(
    (searchField?: string): SearchRequest => {
      const allFilters = [...filters];
      if (debouncedSearch && searchField) {
        allFilters.push({
          field: searchField,
          operator: "ilike",
          value: `%${debouncedSearch}%`,
        });
      }
      return {
        filter: allFilters.length > 0 ? { params: allFilters } : null,
        sort: sort.length > 0 ? { params: sort } : null,
        pagination,
      };
    },
    [filters, sort, pagination, debouncedSearch],
  );

  // Reset page when search changes
  const prevSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch) {
      setPagination((p) => ({ ...p, page: 1 }));
      prevSearchRef.current = debouncedSearch;
    }
  }, [debouncedSearch]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    filters,
    setFilters,
    addFilter,
    removeFilter,
    clearFilters,
    sort,
    setSort,
    toggleSort,
    pagination,
    setPage,
    setPageSize,
    buildSearchRequest,
  };
}
