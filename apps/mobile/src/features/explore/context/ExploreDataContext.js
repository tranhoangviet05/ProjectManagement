import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import exploreService from "../services/exploreService";

const ExploreDataContext = createContext(null);

/**
 * Context nạp trước toàn bộ dữ liệu Trang chủ ngay trong lúc hiển thị SplashScreen.
 * Khi bootstrap hoàn tất (thành công hoặc fallback an toàn), SplashScreen mới ẩn đi.
 */
export function ExploreDataProvider({ children }) {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadInitialData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const [locRes, catRes, svcRes, postRes, campRes] = await Promise.allSettled([
        exploreService.fetchLocations(),
        exploreService.fetchCategories(),
        exploreService.fetchServices({ per_page: 20 }),
        exploreService.fetchFeaturedPosts(12),
        exploreService.fetchActiveCampaigns(),
      ]);

      if (locRes.status === "fulfilled" && Array.isArray(locRes.value?.data)) {
        setLocations(locRes.value.data);
      }
      if (catRes.status === "fulfilled" && Array.isArray(catRes.value?.data)) {
        setCategories(catRes.value.data);
      }
      if (svcRes.status === "fulfilled" && Array.isArray(svcRes.value?.data)) {
        setServices(svcRes.value.data);
      }
      if (postRes.status === "fulfilled" && Array.isArray(postRes.value?.data)) {
        setFeaturedPosts(postRes.value.data);
      }
      if (campRes.status === "fulfilled" && Array.isArray(campRes.value?.data)) {
        setCampaigns(campRes.value.data);
      }
    } finally {
      setIsBootstrapped(true);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData(false);
  }, [loadInitialData]);

  return (
    <ExploreDataContext.Provider
      value={{
        locations,
        categories,
        services,
        featuredPosts,
        campaigns,
        isBootstrapped,
        isRefreshing,
        refreshExploreData: () => loadInitialData(true),
      }}
    >
      {children}
    </ExploreDataContext.Provider>
  );
}

export function useExploreData() {
  const ctx = useContext(ExploreDataContext);
  if (!ctx) {
    throw new Error("useExploreData phải được gọi bên trong ExploreDataProvider");
  }
  return ctx;
}
