import { useState, useEffect } from "react";

/**
 * Hook kết hợp useState (cho bộ gõ tiếng Việt IME/Unikey mượt mà)
 * và useSearchParams (đồng bộ từ khóa tìm kiếm lên URL sau 300ms ngừng gõ).
 */
export function useDebouncedUrlSearch(searchParams, setSearchParams, paramKey = "q", delay = 300) {
  const urlQuery = searchParams.get(paramKey) || "";
  const [searchInput, setSearchInput] = useState(urlQuery);

  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (searchInput === urlQuery) return undefined;

    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!searchInput.trim()) next.delete(paramKey);
          else next.set(paramKey, searchInput);
          return next;
        },
        { replace: true },
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [searchInput, urlQuery, paramKey, delay, setSearchParams]);

  return [searchInput, setSearchInput, urlQuery];
}
