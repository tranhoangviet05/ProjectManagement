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

export const ROOM_RANK_OPTIONS = [
  { value: "standard", label: "Standard (Tiêu chuẩn)" },
  { value: "superior", label: "Superior (Cao cấp)" },
  { value: "deluxe", label: "Deluxe (Sang trọng)" },
  { value: "suite", label: "Suite (Thượng hạng)" },
  { value: "vip", label: "VIP / Villa" },
];

export function resolveProviderServiceConfig(businessType) {
  const slug = businessType?.slug || "";
  const groupName = businessType?.type || "";

  if (slug === "khach-san" || slug === "homestay" || slug === "homestay-villa") {
    return {
      group: "accommodation",
      fixedPriceUnit: "phòng/đêm",
      businessLabel: businessType?.name || "Khách sạn / Homestay",
    };
  }

  if (slug === "villa" || slug === "resort") {
    return {
      group: "accommodation",
      fixedPriceUnit: "đêm",
      businessLabel: businessType?.name || "Villa / Resort",
    };
  }

  if (groupName === "Chỗ ở") {
    return {
      group: "accommodation",
      fixedPriceUnit: "phòng/đêm",
      businessLabel: businessType?.name || "Chỗ ở",
    };
  }

  if (slug === "ve-tau" || slug === "phuong-tien-di-chuyen" || groupName === "Phương tiện") {
    return {
      group: "vehicle",
      fixedPriceUnit: slug === "ve-tau" ? "vé" : "ngày",
      businessLabel: businessType?.name || "Phương tiện",
    };
  }

  return {
    group: "tour",
    fixedPriceUnit: "người",
    businessLabel: businessType?.name || "Tour du lịch & Trải nghiệm",
  };
}

export function createEmptyRoomType() {
  return {
    name: "",
    rank: "standard",
    description: "",
    base_price: "",
    total_rooms: "1",
    inventory: "1",
    capacity_adults: "2",
    capacity_children: "0",
    amenities: [],
    status: "active",
  };
}

export function createInitialServiceForm(service = null, group = "tour") {
  const existingRooms =
    Array.isArray(service?.room_types) && service.room_types.length > 0
      ? service.room_types.map((room) => ({
          id: room.id,
          name: room.name || "",
          rank: room.rank || "standard",
          description: room.description || "",
          base_price: room.base_price ? String(Number(room.base_price)) : "",
          total_rooms: String(room.total_rooms ?? 1),
          inventory: String(room.inventory ?? room.total_rooms ?? 1),
          capacity_adults: String(room.capacity_adults ?? 2),
          capacity_children: String(room.capacity_children ?? 0),
          amenities: Array.isArray(room.amenities) ? room.amenities : [],
          status: room.status || "active",
        }))
      : group === "accommodation"
        ? [createEmptyRoomType()]
        : [];

  return {
    name: service?.name || "",
    category_id: service?.category_id ? String(service.category_id) : "",
    location_id: service?.location_id ? String(service.location_id) : "",
    description: service?.description || "",
    base_price: service?.base_price ? String(Number(service.base_price)) : "",
    address: service?.address || "",
    amenities: Array.isArray(service?.amenities) ? service.amenities : [],
    includes: Array.isArray(service?.includes) ? service.includes : [],
    excludes: Array.isArray(service?.excludes) ? service.excludes : [],
    room_types: existingRooms,
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
