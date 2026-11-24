import apiClient from "../../../lib/apiClient";

/**
 * Service giao tiếp API quản lý đơn đặt chỗ cho Du khách & Khách vãng lai.
 */
export const bookingService = {
  async getBookings({ status = "all", page = 1, perPage = 15 } = {}) {
    const params = new URLSearchParams();
    if (status && status !== "all") {
      params.append("status", status);
    }
    params.append("page", String(page));
    params.append("per_page", String(perPage));

    const response = await apiClient.get(`/tourist/bookings?${params.toString()}`);
    return {
      items: Array.isArray(response?.data) ? response.data : [],
      meta: response?.meta || {
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: 0,
      },
    };
  },

  async getBookingDetail(bookingId) {
    const response = await apiClient.get(`/tourist/bookings/${bookingId}`);
    return response?.data || null;
  },

  async lookupGuestBooking(bookingCode, contactPhone) {
    const code = encodeURIComponent(
      String(bookingCode || "")
        .trim()
        .toUpperCase(),
    );
    const params = new URLSearchParams();
    if (contactPhone) {
      params.append("contact_phone", String(contactPhone).trim());
    }
    const query = params.toString();
    const response = await apiClient.get(`/public/bookings/${code}${query ? `?${query}` : ""}`);
    return response?.data || null;
  },

  async cancelBooking(bookingId, cancelReason = "") {
    const response = await apiClient.post(`/tourist/bookings/${bookingId}/cancel`, {
      cancel_reason: cancelReason.trim() || undefined,
    });
    return {
      data: response?.data || null,
      message: response?.message || "Đã hủy đơn đặt chỗ thành công.",
    };
  },

  async getAvailableCoupons(isAuthenticated = false) {
    const endpoint = isAuthenticated ? "/tourist/coupons" : "/public/coupons";
    const response = await apiClient.get(endpoint);
    return Array.isArray(response?.data) ? response.data : [];
  },
};

export default bookingService;
