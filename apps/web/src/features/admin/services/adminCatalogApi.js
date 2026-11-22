import apiClient from "../../../lib/apiClient";

const RESOURCE_CONFIG = {
  locations: { base: "/admin/locations", query: {} },
  categories: { base: "/admin/categories", query: {} },
  businessTypes: { base: "/admin/business-types", query: {} },
  serviceAmenities: { base: "/admin/amenities", query: { scope: "service" } },
  roomAmenities: { base: "/admin/amenities", query: { scope: "room" } },
  includes: { base: "/admin/inclusions", query: { kind: "include" } },
  excludes: { base: "/admin/inclusions", query: { kind: "exclude" } },
};

const adminCatalogApi = {
  async list(resource, q = "") {
    const cfg = RESOURCE_CONFIG[resource] || RESOURCE_CONFIG.locations;
    const params = new URLSearchParams(cfg.query);
    if (q && q.trim()) {
      params.set("q", q.trim());
    }
    const qs = params.toString();
    return apiClient.get(`${cfg.base}${qs ? `?${qs}` : ""}`);
  },

  async create(resource, payload) {
    const cfg = RESOURCE_CONFIG[resource] || RESOURCE_CONFIG.locations;
    return apiClient.post(cfg.base, payload);
  },

  async update(resource, id, payload) {
    const cfg = RESOURCE_CONFIG[resource] || RESOURCE_CONFIG.locations;
    return apiClient.put(`${cfg.base}/${id}`, payload);
  },

  async remove(resource, id) {
    const cfg = RESOURCE_CONFIG[resource] || RESOURCE_CONFIG.locations;
    return apiClient.delete(`${cfg.base}/${id}`);
  },
};

export default adminCatalogApi;
