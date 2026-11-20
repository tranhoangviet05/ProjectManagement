import apiClient from "../../../lib/apiClient";

export const providerServiceApi = {
  async listServices(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.type && params.type !== "all") query.set("type", params.type);
    if (params.q) query.set("q", params.q.trim());
    if (params.page) query.set("page", String(params.page));

    const queryString = query.toString();
    return apiClient.get(`/provider/services${queryString ? `?${queryString}` : ""}`);
  },

  async getService(serviceId) {
    return apiClient.get(`/provider/services/${serviceId}`);
  },

  async createService(payload) {
    return apiClient.post("/provider/services", payload);
  },

  async updateService(serviceId, payload) {
    return apiClient.put(`/provider/services/${serviceId}`, payload);
  },

  async deleteService(serviceId) {
    return apiClient.delete(`/provider/services/${serviceId}`);
  },

  async uploadMedia(serviceId, files, coverIndex = null) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files[]", file);
    });
    if (coverIndex !== null && coverIndex !== undefined) {
      formData.append("cover_index", String(coverIndex));
    }

    return apiClient.post(`/provider/services/${serviceId}/media`, formData);
  },

  async setCoverMedia(serviceId, mediaId) {
    return apiClient.patch(`/provider/services/${serviceId}/media/${mediaId}/cover`);
  },

  async deleteMedia(serviceId, mediaId) {
    return apiClient.delete(`/provider/services/${serviceId}/media/${mediaId}`);
  },

  async fetchCategories() {
    return apiClient.get("/public/categories");
  },

  async fetchLocations() {
    return apiClient.get("/public/locations");
  },
};

export default providerServiceApi;
