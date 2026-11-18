import apiClient from "../../../lib/apiClient";

/**
 * Dịch vụ gọi API quản lý hồ sơ cá nhân Du khách (Tourist Profile)
 */
export const touristProfileService = {
  /**
   * Lấy thông tin hồ sơ cá nhân hiện tại của Du khách
   */
  async getProfile() {
    const response = await apiClient.get("/tourist/profile");
    return {
      success: response?.success ?? true,
      data: response?.data || null,
      message: response?.message || "",
    };
  },

  /**
   * Cập nhật thông tin hồ sơ cá nhân Du khách
   */
  async updateProfile(payload = {}) {
    const requestBody = {
      name: String(payload.name || "").trim(),
      phone_number: String(payload.phone_number || "").replace(/\s+/g, ""),
      gender: payload.gender || "",
      date_of_birth: payload.date_of_birth || "",
    };

    const response = await apiClient.put("/tourist/profile", requestBody);
    return {
      success: response?.success ?? true,
      data: response?.data || requestBody,
      message: response?.message || "Cập nhật hồ sơ cá nhân thành công.",
    };
  },
};

export default touristProfileService;
