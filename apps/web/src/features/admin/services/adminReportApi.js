import apiClient from "../../../lib/apiClient";

export const adminReportApi = {
  listReports: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.target_type) query.set("target_type", params.target_type);
    const qs = query.toString();
    return apiClient.get(`/api/v1/admin/reports${qs ? `?${qs}` : ""}`);
  },
  getReport: (id) => apiClient.get(`/api/v1/admin/reports/${id}`),
  hideContent: (id, adminNote = "") =>
    apiClient.post(`/api/v1/admin/reports/${id}/hide-content`, { admin_note: adminNote }),
  dismissReport: (id, adminNote = "") =>
    apiClient.post(`/api/v1/admin/reports/${id}/dismiss`, { admin_note: adminNote }),
};
