import apiClient from "../../../lib/apiClient";

const adminCouponApi = {
  async listCoupons({ status = "all", q = "", page = 1, per_page = 15 } = {}) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q && q.trim()) params.set("q", q.trim());
    params.set("page", String(page));
    params.set("per_page", String(per_page));
    return apiClient.get(`/admin/coupons?${params.toString()}`);
  },

  async createCoupon(payload) {
    return apiClient.post("/admin/coupons", payload);
  },

  async updateCoupon(couponId, payload) {
    return apiClient.put(`/admin/coupons/${couponId}`, payload);
  },

  async deleteCoupon(couponId) {
    return apiClient.delete(`/admin/coupons/${couponId}`);
  },

  async listCouponGrants(couponId) {
    return apiClient.get(`/admin/coupons/${couponId}/grants`);
  },

  async grantCouponToTourists(couponId, payload) {
    return apiClient.post(`/admin/coupons/${couponId}/grant`, payload);
  },
};

export default adminCouponApi;
