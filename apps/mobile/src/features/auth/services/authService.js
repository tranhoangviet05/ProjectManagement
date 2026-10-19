import apiClient, { mobileSessionStore } from "../../../lib/apiClient";

/**
 * Dịch vụ Xác thực cho Mobile App (@stb/mobile)
 */
export const authService = {
  async login(email, password) {
    const response = await apiClient.post("/auth/login", { email, password });
    if (response?.token) {
      mobileSessionStore.setToken(response.token);
    }
    if (response?.data) {
      mobileSessionStore.setUser(response.data);
    }
    return response;
  },

  async register(payload) {
    const response = await apiClient.post("/auth/register", payload);
    if (response?.token) {
      mobileSessionStore.setToken(response.token);
    }
    if (response?.data) {
      mobileSessionStore.setUser(response.data);
    }
    return response;
  },

  async fetchCurrentUser() {
    const response = await apiClient.get("/auth/me");
    if (response?.data) {
      mobileSessionStore.setUser(response.data);
    }
    return response?.data;
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Bỏ qua lỗi mạng khi đăng xuất
    }
    mobileSessionStore.clearAll();
  },
};

export default authService;
