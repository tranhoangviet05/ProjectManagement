import apiClient from "../../../lib/apiClient";

const exploreService = {
  async fetchLocations({ popular = false } = {}) {
    const qs = popular ? "?popular=1" : "";
    return apiClient.get(`/public/locations${qs}`);
  },

  async fetchCategories() {
    return apiClient.get("/public/categories");
  },

  async fetchServices(params = {}) {
    const query = new URLSearchParams();
    if (params.q && params.q.trim()) query.set("q", params.q.trim());
    if (params.location_id) query.set("location_id", String(params.location_id));
    if (params.location_slug) query.set("location_slug", params.location_slug);
    if (params.category_id) query.set("category_id", String(params.category_id));
    if (params.type && params.type !== "all") query.set("type", params.type);
    if (params.group) query.set("group", params.group);
    if (params.min_price !== undefined && params.min_price !== "") {
      query.set("min_price", String(params.min_price));
    }
    if (params.max_price !== undefined && params.max_price !== "") {
      query.set("max_price", String(params.max_price));
    }
    if (params.sort) query.set("sort", params.sort);
    if (params.per_page) query.set("per_page", String(params.per_page));

    const qs = query.toString();
    return apiClient.get(`/public/services${qs ? `?${qs}` : ""}`);
  },

  async fetchServiceDetail(id) {
    return apiClient.get(`/public/services/${id}`);
  },

  async fetchFeaturedPosts(limit = 12) {
    return apiClient.get(`/public/posts/featured?limit=${limit}`);
  },
};

export default exploreService;
