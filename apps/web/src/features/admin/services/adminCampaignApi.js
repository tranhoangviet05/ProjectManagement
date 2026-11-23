import apiClient from "../../../lib/apiClient";

const adminCampaignApi = {
  async list({ status = "", q = "" } = {}) {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (q && q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    return apiClient.get(`/admin/campaigns${qs ? `?${qs}` : ""}`);
  },

  async create(payload) {
    return apiClient.post("/admin/campaigns", payload);
  },

  async update(id, payload) {
    return apiClient.put(`/admin/campaigns/${id}`, payload);
  },

  async reopen(id, payload) {
    return apiClient.post(`/admin/campaigns/${id}/reopen`, payload);
  },

  async remove(id) {
    return apiClient.delete(`/admin/campaigns/${id}`);
  },
};

export default adminCampaignApi;
