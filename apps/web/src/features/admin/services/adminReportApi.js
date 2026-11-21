import apiClient from "../../../lib/apiClient";

const adminReportApi = {
  async listReports({ status = "pending", type = "all", q = "", page = 1, per_page = 15 } = {}) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (q && q.trim()) params.set("q", q.trim());
    params.set("page", String(page));
    params.set("per_page", String(per_page));
    return apiClient.get(`/admin/reports?${params.toString()}`);
  },

  async getReportDetail(reportId) {
    return apiClient.get(`/admin/reports/${reportId}`);
  },

  async resolveReport(reportId, payload) {
    return apiClient.post(`/admin/reports/${reportId}/resolve`, payload);
  },
};

export default adminReportApi;
