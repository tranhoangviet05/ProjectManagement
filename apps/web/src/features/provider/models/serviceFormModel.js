export const SERVICE_TYPE_OPTIONS = [
  { value: "tour", label: "Tour du lịch & Trải nghiệm", defaultUnit: "người" },
  { value: "hotel", label: "Khách sạn / Resort", defaultUnit: "phòng/đêm" },
  { value: "homestay", label: "Homestay / Villa", defaultUnit: "đêm" },
  { value: "vehicle", label: "Thuê xe & Di chuyển", defaultUnit: "ngày" },
];

export const SERVICE_STATUS_CONFIG = {
  draft: {
    label: "Bản nháp",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  pending_review: {
    label: "Chờ Admin duyệt",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  active: {
    label: "Đang mở bán",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Bị từ chối",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function createInitialServiceForm(service = null) {
  return {
    name: service?.name || "",
    type: service?.type || "tour",
    category_id: service?.category_id ? String(service.category_id) : "",
    location_id: service?.location_id ? String(service.location_id) : "",
    description: service?.description || "",
    base_price: service?.base_price ? String(Number(service.base_price)) : "",
    price_unit: service?.price_unit || "người",
    max_guests: service?.max_guests ? String(service.max_guests) : "10",
    duration_days: service?.duration_days ? String(service.duration_days) : "1",
    duration_nights: service?.duration_nights ? String(service.duration_nights) : "0",
    address: service?.address || "",
    amenities: Array.isArray(service?.amenities) ? service.amenities : [],
    includes: Array.isArray(service?.includes) ? service.includes : [],
    excludes: Array.isArray(service?.excludes) ? service.excludes : [],
    schedules: Array.isArray(service?.schedules)
      ? service.schedules.map((item) => ({
          day_number: item.day_number,
          title: item.title || "",
          description: item.description || "",
          activities: Array.isArray(item.activities) ? item.activities : [],
        }))
      : [],
  };
}

export function formatCurrencyVnd(amount) {
  const numeric = Number(amount || 0);
  return `${numeric.toLocaleString("vi-VN")} ₫`;
}
