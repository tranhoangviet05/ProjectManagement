import apiClient from "../../../lib/apiClient";

const adminDashboardApi = {
  async getOverview(params = {}) {
    const query = new URLSearchParams();
    if (params.period) query.set("period", params.period);
    if (params.year) query.set("year", String(params.year));
    if (params.month) query.set("month", String(params.month));
    const qs = query.toString();
    return apiClient.get(`/admin/dashboard${qs ? `?${qs}` : ""}`);
  },

  async getChartData({ metric, period = "12m", year, month } = {}) {
    const query = new URLSearchParams();
    query.set("metric", metric);
    query.set("period", period);
    if (year) query.set("year", String(year));
    if (month) query.set("month", String(month));
    return apiClient.get(`/admin/dashboard/chart?${query.toString()}`);
  },
};

export default adminDashboardApi;
