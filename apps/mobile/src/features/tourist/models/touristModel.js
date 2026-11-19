import { UserRole, UserStatus } from "@stb/shared-types";

export { UserRole, UserStatus };

export const GENDER_OPTIONS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

export const VN_PHONE_REGEX = /^0[35789][0-9]{8}$/;

/**
 * Chuẩn hóa chuỗi ngày về định dạng YYYY-MM-DD (hỗ trợ ISO-8601 từ Laravel)
 */
export function normalizeDateOnly(rawDate) {
  if (!rawDate || typeof rawDate !== "string") return "";
  const match = rawDate.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

/**
 * Chuyển đổi YYYY-MM-DD sang DD/MM/YYYY để hiển thị trên giao diện Mobile
 */
export function formatDateDisplay(isoDate) {
  const normalized = normalizeDateOnly(isoDate);
  if (!normalized) return "";
  const [year, month, day] = normalized.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Kiểm tra ngày YYYY-MM-DD có hợp lệ và nhỏ hơn ngày hôm nay hay không
 */
export function isValidDateBeforeToday(isoDate) {
  const normalized = normalizeDateOnly(isoDate);
  if (!normalized) return false;

  const [yearStr, monthStr, dayStr] = normalized.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today;
}

/**
 * Kiểm tra dữ liệu cập nhật hồ sơ cá nhân Du khách phía Client
 */
export function validateTouristProfileInput({ name, phone_number, gender, date_of_birth } = {}) {
  const errors = {};

  const trimmedName = String(name || "").trim();
  if (!trimmedName) {
    errors.name = "Vui lòng nhập họ và tên.";
  } else if (trimmedName.length < 2) {
    errors.name = "Họ và tên cần có ít nhất 2 ký tự.";
  } else if (trimmedName.length > 255) {
    errors.name = "Họ và tên không được vượt quá 255 ký tự.";
  }

  const cleanPhone = String(phone_number || "").replace(/\s+/g, "");
  if (!cleanPhone) {
    errors.phone_number = "Vui lòng nhập số điện thoại.";
  } else if (!VN_PHONE_REGEX.test(cleanPhone)) {
    errors.phone_number =
      "Số điện thoại Việt Nam phải gồm 10 chữ số (bắt đầu bằng 03, 05, 07, 08 hoặc 09).";
  }

  if (!["male", "female", "other"].includes(gender)) {
    errors.gender = "Vui lòng chọn giới tính.";
  }

  const normalizedDob = normalizeDateOnly(date_of_birth);
  if (!normalizedDob) {
    errors.date_of_birth = "Vui lòng chọn ngày sinh.";
  } else if (!isValidDateBeforeToday(normalizedDob)) {
    errors.date_of_birth = "Ngày sinh phải hợp lệ và nhỏ hơn ngày hôm nay.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Chuẩn hóa dữ liệu người dùng Du khách nhận từ API Backend
 * @param {Object} rawUser - Payload người dùng từ /auth/me, /auth/login hoặc /tourist/profile
 * @returns {Object} Đối tượng Tourist Model chuẩn hóa cho giao diện
 */
export function transformTouristData(rawUser = {}) {
  const wallet = rawUser?.wallet || {};
  const touristProfile = rawUser?.tourist_profile || rawUser || {};
  const socialProfile = rawUser?.social_profile || {};

  return {
    id: rawUser?.user_id || rawUser?.id || null,
    name: touristProfile?.name || rawUser?.name || "Du khách",
    email: rawUser?.email || touristProfile?.email || "",
    avatarUrl:
      rawUser?.avatar_url || touristProfile?.avatar_url || socialProfile?.avatar_url || null,
    role: rawUser?.role || UserRole.Tourist,
    status: rawUser?.status || UserStatus.Active,
    phoneNumber: touristProfile?.phone_number || "",
    gender: touristProfile?.gender || "",
    dateOfBirth: normalizeDateOnly(touristProfile?.date_of_birth),

    // Thông tin ví & tài chính
    wallet: {
      balance: Number(wallet?.balance || 0),
      lockedBalance: Number(wallet?.locked_balance || 0),
      currency: wallet?.currency || "VND",
      formattedBalance: formatCurrency(wallet?.balance || 0, wallet?.currency || "VND"),
    },

    // Thông tin mạng xã hội
    social: {
      username: socialProfile?.username || "traveler",
      bio: socialProfile?.bio || "",
      isVerified: Boolean(socialProfile?.is_verified),
      followersCount: Number(socialProfile?.followers_count || 0),
      followingCount: Number(socialProfile?.following_count || 0),
    },
  };
}

/**
 * Định dạng số tiền sang chuẩn hiển thị tiếng Việt (VND)
 */
export function formatCurrency(amount = 0, currency = "VND") {
  return `${Number(amount).toLocaleString("vi-VN")} ${currency}`;
}

/**
 * Kiểm tra xem du khách có đủ số dư ví để thanh toán đơn hàng hay không
 */
export function hasSufficientBalance(touristModel, requiredAmount) {
  if (!touristModel?.wallet?.balance) return false;
  return touristModel.wallet.balance >= Number(requiredAmount);
}
