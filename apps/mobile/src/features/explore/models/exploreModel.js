export const HOME_CATEGORIES = [
  { id: "accommodation", label: "Chỗ ở", apiGroup: "accommodation" },
  { id: "entertainment", label: "Giải trí", apiGroup: "entertainment" },
  { id: "vehicle", label: "Thuê xe", apiGroup: "vehicle" },
  { id: "train", label: "Vé tàu", apiGroup: "train" },
];

export const VEHICLE_TYPE_OPTIONS = [
  { id: "motorbike", label: "Xe máy" },
  { id: "car_self", label: "Ô tô tự lái" },
  { id: "car_driver", label: "Xe có tài xế" },
];

export const PRICE_PRESETS = [
  { id: "all", label: "Mọi mức giá", min: "", max: "" },
  { id: "under_1m", label: "Dưới 1 triệu", min: "", max: "1000000" },
  { id: "1m_3m", label: "1 – 3 triệu", min: "1000000", max: "3000000" },
  { id: "over_3m", label: "Trên 3 triệu", min: "3000000", max: "" },
];

export const SORT_OPTIONS = [
  { id: "newest", label: "Mới nhất" },
  { id: "price_asc", label: "Giá thấp đến cao" },
  { id: "price_desc", label: "Giá cao đến thấp" },
  { id: "rating", label: "Đánh giá cao" },
];

export const POPULAR_TRAIN_ROUTES = [
  { id: "hn-dn", from: "Ga Hà Nội", to: "Ga Đà Nẵng", duration: "15 giờ 30 phút", price: 680000 },
  {
    id: "dn-hue",
    from: "Ga Đà Nẵng",
    to: "Ga Huế (Đèo Hải Vân)",
    duration: "3 giờ",
    price: 180000,
  },
  { id: "sg-nt", from: "Ga Sài Gòn", to: "Ga Nha Trang", duration: "7 giờ 45 phút", price: 420000 },
  { id: "hn-lc", from: "Ga Hà Nội", to: "Ga Lào Cai (Sa Pa)", duration: "8 giờ", price: 450000 },
];

export const WHY_CHOOSE_US_ITEMS = [
  {
    id: "escrow",
    title: "Ký quỹ Escrow an toàn 30%",
    desc: "Tiền cọc được giữ bảo vệ và chỉ giải ngân cho đối tác sau khi bạn quét mã QR check-in thành công.",
  },
  {
    id: "kyc",
    title: "100% đối tác xác minh KYC",
    desc: "Mọi khách sạn, villa và đơn vị lữ hành đều được thẩm định giấy phép kinh doanh trước khi mở bán.",
  },
  {
    id: "community",
    title: "Trải nghiệm thật từ cộng đồng",
    desc: "Xem bài review chân thực từ người đi trước và đặt ngay dịch vụ gắn kèm chỉ với một chạm.",
  },
  {
    id: "transparent",
    title: "Giá niêm yết & lịch trống minh bạch",
    desc: "Không phụ phí ẩn, hiển thị chính xác số chỗ trống và giá theo từng ngày khởi hành.",
  },
];

export function formatCurrencyVnd(amount) {
  const num = Number(amount || 0);
  return `${num.toLocaleString("vi-VN")} ₫`;
}

export function getServiceTypeLabel(type) {
  switch (type) {
    case "hotel":
      return "Khách sạn";
    case "homestay":
      return "Homestay / Villa";
    case "tour":
      return "Tour & Trải nghiệm";
    case "vehicle":
      return "Thuê xe";
    default:
      return "Dịch vụ";
  }
}

export function formatRelativeTime(isoDate) {
  if (!isoDate) return "Vừa xong";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}p`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}g`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}ng`;
  return new Date(isoDate).toLocaleDateString("vi-VN");
}

export function formatShortDate(dateObj) {
  const d = String(dateObj.getDate()).padStart(2, "0");
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}`;
}

export function getRatingVerdict(rating) {
  const score = Number(rating || 0);
  if (score >= 4.7) return "Tuyệt hảo";
  if (score >= 4.3) return "Rất tốt";
  if (score >= 3.8) return "Tốt";
  if (score > 0) return "Khá ổn";
  return "Mới mở bán";
}

export function formatPriceUnit(unit, type) {
  const normalized = String(unit || "")
    .toLowerCase()
    .trim();
  if (normalized === "night" || normalized === "đêm") return "đêm";
  if (normalized === "person" || normalized === "khách" || normalized === "người") return "khách";
  if (normalized === "day" || normalized === "ngày") return "ngày";
  if (normalized === "trip" || normalized === "chuyến") return "chuyến";
  if (normalized) return normalized;

  if (type === "hotel" || type === "homestay") return "đêm";
  if (type === "tour") return "khách";
  if (type === "vehicle") return "ngày";
  return "lượt";
}
