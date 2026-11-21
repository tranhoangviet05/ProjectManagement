import apiClient from "../../../lib/apiClient";

const adminBookingApi = {
  async listBookings({
    status = "all",
    payment_status = "all",
    q = "",
    page = 1,
    per_page = 15,
  } = {}) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (payment_status) params.set("payment_status", payment_status);
    if (q && q.trim()) params.set("q", q.trim());
    params.set("page", String(page));
    params.set("per_page", String(per_page));
    return apiClient.get(`/admin/bookings?${params.toString()}`);
  },

  async getBookingDetail(bookingId) {
    return apiClient.get(`/admin/bookings/${bookingId}`);
  },
};

export default adminBookingApi;
