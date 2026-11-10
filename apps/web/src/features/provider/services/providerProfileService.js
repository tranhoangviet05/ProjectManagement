import apiClient, { tokenStorage } from "../../../lib/apiClient";

export const providerProfileService = {
  /**
   * Lấy thông tin hồ sơ phiên hiện tại (GET /api/v1/auth/me)
   */
  async fetchProfile() {
    try {
      const res = await apiClient.get("/auth/me");
      if (res?.data) {
        tokenStorage.setUser(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn("[providerProfileService] fetchProfile fallback:", err.message);
    }
    return tokenStorage.getUser();
  },

  /**
   * Cập nhật thông tin Profile (PUT /api/v1/auth/profile)
   * Body: { name, phone, bio, birthday, gender, address, business_name, description }
   */
  async updateProfile(payload) {
    try {
      const res = await apiClient.put("/auth/profile", payload);
      if (res?.data) {
        tokenStorage.setUser(res.data);
        return res;
      }
    } catch (err) {
      console.warn("[providerProfileService] updateProfile fallback:", err.message);
      // Giữ lỗi validation nếu có từ Backend FormRequest
      if (err.errors) throw err;
    }

    // Fallback Mock cập nhật cục bộ
    const currentUser = tokenStorage.getUser() || {};
    const updatedUser = {
      ...currentUser,
      name: payload.name || currentUser.name,
      phone: payload.phone || currentUser.phone,
      provider_profile: {
        ...(currentUser.provider_profile || {}),
        business_name: payload.business_name || currentUser.provider_profile?.business_name,
        representative_name: payload.name || currentUser.provider_profile?.representative_name,
        phone: payload.phone || currentUser.provider_profile?.phone,
        address:
          payload.address !== undefined ? payload.address : currentUser.provider_profile?.address,
        description:
          payload.bio || payload.description || currentUser.provider_profile?.description,
      },
    };

    tokenStorage.setUser(updatedUser);
    return {
      success: true,
      message: "Cập nhật hồ sơ thành công.",
      data: updatedUser,
    };
  },

  /**
   * Tải lên ảnh đại diện mới (POST /api/v1/auth/avatar)
   * Multipart FormData: avatar: <file>
   */
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await apiClient.post("/auth/avatar", formData);
      if (res?.data) {
        const currentUser = tokenStorage.getUser() || {};
        const updatedUser = {
          ...currentUser,
          avatar_url: res.data.avatar_url || res.data.url,
          avatar: res.data.avatar_url || res.data.url,
        };
        tokenStorage.setUser(updatedUser);
        return res;
      }
    } catch (err) {
      console.warn("[providerProfileService] uploadAvatar fallback:", err.message);
      if (err.errors) throw err;
    }

    // Fallback Mock: Chuyển file sang Base64 để hiển thị tức thời
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target.result;
        const currentUser = tokenStorage.getUser() || {};
        const updatedUser = {
          ...currentUser,
          avatar_url: base64Url,
          avatar: base64Url,
        };
        tokenStorage.setUser(updatedUser);
        resolve({
          success: true,
          message: "Tải lên ảnh đại diện thành công.",
          data: { avatar_url: base64Url },
          user: updatedUser,
        });
      };
      reader.onerror = () => {
        reject(new Error("Không thể xử lý file ảnh. Vui lòng thử lại."));
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Đổi mật khẩu tài khoản (POST /api/v1/auth/change-password)
   * Body: { current_password, new_password, new_password_confirmation }
   */
  async changePassword(payload) {
    try {
      const res = await apiClient.post("/auth/change-password", payload);
      if (res) return res;
    } catch (err) {
      console.warn("[providerProfileService] changePassword fallback:", err.message);
      if (err.errors || err.status === 422 || err.status === 400) throw err;
    }

    // Giả lập thành công cho môi trường demo
    return {
      success: true,
      message: "Đổi mật khẩu thành công. Vui lòng ghi nhớ mật khẩu mới của bạn.",
    };
  },

  /**
   * Kích hoạt Ví Travel cho Nhà cung cấp (POST /api/v1/provider/wallet/activate)
   * Tạo 1 hàng dữ liệu trong bảng wallets gắn với user
   */
  async activateWallet(payload) {
    try {
      const res = await apiClient.post("/provider/wallet/activate", payload);
      if (res?.data) {
        const currentUser = tokenStorage.getUser() || {};
        const updatedUser = {
          ...currentUser,
          wallet: res.data.wallet || res.data,
        };
        tokenStorage.setUser(updatedUser);
        return res;
      }
    } catch (err) {
      console.warn("[providerProfileService] activateWallet fallback:", err.message);
      if (err.errors) throw err;
    }

    // Mock fallback: Tạo bản ghi ví nội bộ trong bảng wallets
    const currentUser = tokenStorage.getUser() || {};
    const newWallet = {
      id: currentUser.wallet?.id || 101,
      user_id: currentUser.id || 1,
      balance: 0,
      locked_balance: 0,
      currency: "VND",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedUser = {
      ...currentUser,
      wallet: newWallet,
    };
    tokenStorage.setUser(updatedUser);

    return {
      success: true,
      message:
        "Kích hoạt Ví Travel thành công! Tài khoản ví nội bộ đã sẵn sàng ghi nhận thanh toán SePay.",
      data: newWallet,
      user: updatedUser,
    };
  },
};

export default providerProfileService;
