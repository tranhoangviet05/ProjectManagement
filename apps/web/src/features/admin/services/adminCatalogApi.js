import apiClient from "../../../lib/apiClient";

const ENDPOINTS = {
  locations: "/admin/locations",
  categories: "/admin/categories",
  businessTypes: "/admin/business-types",
  policies: "/admin/policies",
};

const adminCatalogApi = {
  async list(resource, q = "") {
    const base = ENDPOINTS[resource];
    const qs = q && q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    return apiClient.get(`${base}${qs}`);
  },

  async create(resource, payload) {
    return apiClient.post(ENDPOINTS[resource], payload);
  },

  async update(resource, id, payload) {
    return apiClient.put(`${ENDPOINTS[resource]}/${id}`, payload);
  },

  async remove(resource, id) {
    return apiClient.delete(`${ENDPOINTS[resource]}/${id}`);
  },
};

export default adminCatalogApi;
