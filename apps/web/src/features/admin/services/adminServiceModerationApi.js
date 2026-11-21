import apiClient from "../../../lib/apiClient";

export const adminServiceModerationApi = {
  async listServices(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.type && params.type !== "all") query.set("type", params.type);
    if (params.q) query.set("q", params.q.trim());
    if (params.page) query.set("page", String(params.page));

    const qs = query.toString();
    return apiClient.get(`/admin/services${qs ? `?${qs}` : ""}`);
  },

  async getServiceDetail(serviceId) {
    return apiClient.get(`/admin/services/${serviceId}`);
  },

  async approveService(serviceId) {
    return apiClient.post(`/admin/services/${serviceId}/approve`);
  },

  async rejectService(serviceId, rejectionReason) {
    return apiClient.post(`/admin/services/${serviceId}/reject`, {
      rejection_reason: rejectionReason,
    });
  },
};

export default adminServiceModerationApi;
