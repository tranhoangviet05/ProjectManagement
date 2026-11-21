import apiClient from "../../../lib/apiClient";

const adminUserApi = {
  async listUsers({ role = "all", status = "all", q = "", page = 1, per_page = 15 } = {}) {
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    if (q && q.trim()) params.set("q", q.trim());
    params.set("page", String(page));
    params.set("per_page", String(per_page));
    return apiClient.get(`/admin/users?${params.toString()}`);
  },

  async getUserDetail(userId) {
    return apiClient.get(`/admin/users/${userId}`);
  },

  async updateUserStatus(userId, payload) {
    return apiClient.patch(`/admin/users/${userId}/status`, payload);
  },
};

export default adminUserApi;
