import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../../../lib/firebase.config";
import apiClient, { tokenStorage } from "../../../lib/apiClient";

/**
 * Dịch vụ Xác thực hợp nhất (Web Portal):
 * - Đăng nhập / Đăng ký qua Backend API (với kiểm duyệt Middleware & FormRequest)
 * - Hỗ trợ Đăng nhập Google OAuth qua Firebase + Đồng bộ Postgres (/auth/sync)
 */
export const authService = {
  /**
   * Đăng nhập bằng Email & Mật khẩu
   */
  async login(email, password) {
    const response = await apiClient.post("/auth/login", { email, password });

    if (response?.token) {
      tokenStorage.setToken(response.token);
    }
    if (response?.data) {
      tokenStorage.setUser(response.data);
    }

    return response;
  },

  /**
   * Đăng ký tài khoản mới (Tourist hoặc Provider)
   */
  async register(payload) {
    const response = await apiClient.post("/auth/register", payload);

    if (response?.token) {
      tokenStorage.setToken(response.token);
    }
    if (response?.data) {
      tokenStorage.setUser(response.data);
    }

    return response;
  },

  /**
   * Đăng nhập nhanh bằng tài khoản Google (Firebase OAuth -> Backend Sync)
   */
  async loginWithGoogle(role = "provider") {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const firebaseUser = credential.user;
    const idToken = await firebaseUser.getIdToken();

    const response = await apiClient.post(
      "/auth/sync",
      {
        displayName: firebaseUser.displayName,
        avatarUrl: firebaseUser.photoURL,
        role,
      },
      { token: idToken },
    );

    if (response?.token) {
      tokenStorage.setToken(response.token);
    }
    if (response?.data) {
      tokenStorage.setUser(response.data);
    }

    return response;
  },

  /**
   * Lấy thông tin người dùng hiện tại từ Server (/auth/me)
   */
  async fetchCurrentUser() {
    const response = await apiClient.get("/auth/me");
    if (response?.data) {
      tokenStorage.setUser(response.data);
    }
    return response?.data;
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Bỏ qua nếu token đã hết hạn trên server
    }

    try {
      await firebaseSignOut(auth);
    } catch {
      // Bỏ qua nếu không đăng nhập qua Firebase
    }

    tokenStorage.clearAll();
  },
};

export default authService;
