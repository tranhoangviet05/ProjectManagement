import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const SearchFilterContext = createContext(null);

function formatLocalIsoDate(date) {
  if (!date) return "";
  if (typeof date === "string") return date.slice(0, 10);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const DEFAULT_FILTERS = {
  startDate: "",
  endDate: "",
  quantity: 1,
  numAdults: 2,
  numChildren: 0,
  hasPets: false,
  group: "",
};

/**
 * Context lưu trữ bộ lọc tìm kiếm gần nhất (ngày đi/về, số lượng, người lớn, trẻ em, thú cưng)
 * để tự động điền sẵn vào màn hình Thông tin đặt chỗ (BookingCheckoutScreen).
 */
export function SearchFilterProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const updateSearchFilters = useCallback((partial = {}) => {
    setFilters((prev) => ({
      ...prev,
      ...(partial.startDate !== undefined
        ? { startDate: formatLocalIsoDate(partial.startDate) }
        : {}),
      ...(partial.endDate !== undefined ? { endDate: formatLocalIsoDate(partial.endDate) } : {}),
      ...(partial.quantity !== undefined
        ? { quantity: Math.max(1, Number(partial.quantity) || 1) }
        : {}),
      ...(partial.numAdults !== undefined
        ? { numAdults: Math.max(1, Number(partial.numAdults) || 1) }
        : {}),
      ...(partial.numChildren !== undefined
        ? { numChildren: Math.max(0, Number(partial.numChildren) || 0) }
        : {}),
      ...(partial.hasPets !== undefined ? { hasPets: Boolean(partial.hasPets) } : {}),
      ...(partial.group !== undefined ? { group: String(partial.group || "") } : {}),
    }));
  }, []);

  const resetSearchFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const value = useMemo(
    () => ({
      searchFilters: filters,
      updateSearchFilters,
      resetSearchFilters,
    }),
    [filters, updateSearchFilters, resetSearchFilters],
  );

  return <SearchFilterContext.Provider value={value}>{children}</SearchFilterContext.Provider>;
}

export function useSearchFilters() {
  const ctx = useContext(SearchFilterContext);
  if (!ctx) {
    return {
      searchFilters: DEFAULT_FILTERS,
      updateSearchFilters: () => {},
      resetSearchFilters: () => {},
    };
  }
  return ctx;
}
