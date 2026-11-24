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
    if (params.has_pets) query.set("has_pets", "1");
    if (Array.isArray(params.amenity_ids) && params.amenity_ids.length > 0) {
      query.set("amenity_ids", params.amenity_ids.join(","));
    }
    if (Array.isArray(params.inclusion_ids) && params.inclusion_ids.length > 0) {
      query.set("inclusion_ids", params.inclusion_ids.join(","));
    }
    if (Array.isArray(params.policy_ids) && params.policy_ids.length > 0) {
      query.set("policy_ids", params.policy_ids.join(","));
    }
    if (params.start_date) query.set("start_date", String(params.start_date));
    if (params.end_date) query.set("end_date", String(params.end_date));
    if (params.quantity) query.set("quantity", String(params.quantity));
    if (params.sort) query.set("sort", params.sort);
    if (params.per_page) query.set("per_page", String(params.per_page));

    const qs = query.toString();
    return apiClient.get(`/public/services${qs ? `?${qs}` : ""}`);
  },

  async fetchAmenities({ type = "" } = {}) {
    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    return apiClient.get(`/public/amenities${qs}`);
  },

  async fetchInclusions({ type = "" } = {}) {
    const qs = type ? `?kind=include&type=${encodeURIComponent(type)}` : "?kind=include";
    return apiClient.get(`/public/inclusions${qs}`);
  },

  async fetchPolicies({ type = "" } = {}) {
    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    return apiClient.get(`/public/policies${qs}`);
  },

  async fetchServiceDetail(id) {
    return apiClient.get(`/public/services/${id}`);
  },

  async fetchFeaturedPosts(limit = 12) {
    return apiClient.get(`/public/posts/featured?limit=${limit}`);
  },

  async fetchActiveCampaigns() {
    return apiClient.get("/public/campaigns");
  },
};

export default exploreService;
