import React, { useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import apiClient from "../../../lib/apiClient";
import { AMENITY_ICON_OPTIONS, AmenityIcon, SERVICE_TYPE_OPTIONS } from "../utils/amenityIcons";

async function optimizeLocationImage(file) {
  if (file.size <= 1.5 * 1024 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxWidth = 1920;
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(new File([blob], `${baseName}.jpg`, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.88,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

const BUSINESS_GROUP_OPTIONS = ["Chỗ ở", "Giải trí", "Phương tiện", "Ăn uống"];

const TAB_TITLES = {
  locations: { create: "Thêm điểm đến mới", edit: "Cập nhật điểm đến" },
  categories: { create: "Thêm danh mục dịch vụ", edit: "Cập nhật danh mục dịch vụ" },
  businessTypes: { create: "Thêm loại hình kinh doanh", edit: "Cập nhật loại hình kinh doanh" },
  serviceAmenities: { create: "Thêm tiện nghi dịch vụ", edit: "Cập nhật tiện nghi dịch vụ" },
  roomAmenities: { create: "Thêm tiện nghi phòng", edit: "Cập nhật tiện nghi phòng" },
  includes: { create: "Thêm mục bao gồm", edit: "Cập nhật mục bao gồm" },
  excludes: { create: "Thêm mục không bao gồm", edit: "Cập nhật mục không bao gồm" },
  policies: { create: "Thêm chính sách dịch vụ", edit: "Cập nhật chính sách dịch vụ" },
};

const POLICY_CATEGORIES = [
  { id: "payment", label: "Thanh toán" },
  { id: "cancellation", label: "Hủy & Đổi lịch" },
  { id: "checkin", label: "Nhận & Trả chỗ" },
  { id: "rules", label: "Quy định sử dụng" },
];

/**
 * Modal Form Tạo / Cập nhật đầy đủ các trường DB cho Locations, Categories & BusinessTypes.
 */
export default function CatalogFormModal({
  activeTab,
  item,
  allLocations = [],
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(item?.id);

  const [form, setForm] = useState({
    name: item?.name || "",
    slug: item?.slug || "",
    // Locations
    parent_id: item?.parent_id ? String(item.parent_id) : "",
    country_code: item?.country_code || "VN",
    image_url: item?.image_url || "",
    is_popular: Boolean(item?.is_popular),
    // Categories, Amenities & Policies
    icon:
      item?.icon ||
      (activeTab === "policies"
        ? "shield-check"
        : activeTab === "serviceAmenities" || activeTab === "roomAmenities"
          ? "sparkles"
          : ""),
    icon_url: item?.icon_url || "",
    category: item?.category || "rules",
    // Shared description
    description: item?.description || "",
    // BusinessTypes
    type: item?.type || "Chỗ ở",
    // Amenities & Inclusions
    applicable_types: Array.isArray(item?.applicable_types)
      ? item.applicable_types
      : activeTab === "roomAmenities"
        ? ["hotel", "homestay"]
        : ["hotel", "homestay", "tour"],
    is_active: item?.is_active !== undefined ? Boolean(item.is_active) : true,
  });
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleLocationImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setImageError("Chỉ hỗ trợ ảnh định dạng JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setImageError("Dung lượng ảnh điểm đến tối đa 20MB.");
      return;
    }

    setImageError("");
    setIsUploadingImage(true);
    try {
      const uploadFile = await optimizeLocationImage(file);
      const fd = new FormData();
      fd.append("type", "location");
      fd.append("file", uploadFile);

      const res = await apiClient.post("/media/upload", fd);
      const uploadedUrl = res?.data?.url;
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, image_url: uploadedUrl }));
      } else {
        setImageError("Không nhận được đường dẫn ảnh từ máy chủ.");
      }
    } catch (err) {
      setImageError(err?.message || "Tải ảnh điểm đến lên kho lưu trữ thất bại.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const titles = TAB_TITLES[activeTab] || TAB_TITLES.locations;
  const parentOptions = allLocations.filter((loc) => loc.id !== item?.id);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleToggleType = (typeId) => {
    setForm((prev) => {
      const exists = prev.applicable_types.includes(typeId);
      const next = exists
        ? prev.applicable_types.filter((t) => t !== typeId)
        : [...prev.applicable_types, typeId];
      return { ...prev, applicable_types: next };
    });
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Vui lòng nhập tên hiển thị.");
      return;
    }

    let payload = {};
    if (activeTab === "locations") {
      payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        country_code: (form.country_code || "VN").trim().toUpperCase(),
        image_url: form.image_url.trim() || null,
        description: form.description.trim() || null,
        is_popular: Boolean(form.is_popular),
      };
    } else if (activeTab === "categories") {
      if (form.applicable_types.length === 0) {
        setError("Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.");
        return;
      }
      payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        applicable_types: form.applicable_types,
        icon: form.icon.trim() || null,
        icon_url: form.icon_url.trim() || null,
        description: form.description.trim() || null,
      };
    } else if (activeTab === "serviceAmenities" || activeTab === "roomAmenities") {
      if (form.applicable_types.length === 0) {
        setError("Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.");
        return;
      }
      payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        scope: activeTab === "roomAmenities" ? "room" : "service",
        applicable_types: form.applicable_types,
        icon: form.icon.trim() || "sparkles",
        description: form.description.trim() || null,
        is_active: Boolean(form.is_active),
      };
    } else if (activeTab === "includes" || activeTab === "excludes") {
      if (form.applicable_types.length === 0) {
        setError("Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.");
        return;
      }
      payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        kind: activeTab === "excludes" ? "exclude" : "include",
        applicable_types: form.applicable_types,
        description: form.description.trim() || null,
        is_active: Boolean(form.is_active),
      };
    } else if (activeTab === "policies") {
      if (form.applicable_types.length === 0) {
        setError("Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.");
        return;
      }
      payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        category: form.category || "rules",
        applicable_types: form.applicable_types,
        icon: form.icon.trim() || "shield-check",
        description: form.description.trim() || null,
        is_active: Boolean(form.is_active),
      };
    } else {
      if (!form.type.trim()) {
        setError("Vui lòng chọn nhóm phân loại lớn.");
        return;
      }
      payload = {
        type: form.type.trim(),
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
      };
    }

    onSubmit?.(payload, item?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-surface-elevated rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-border-subtle bg-slate-50 flex items-center justify-between">
          <Typography variant="h3" className="text-lg font-bold text-ink-primary">
            {isEditing ? titles.edit : titles.create}
          </Typography>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
            className="p-1.5 rounded-lg text-ink-subtle hover:text-ink-primary hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-status-danger">
              {error}
            </div>
          )}

          {activeTab === "businessTypes" && (
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Nhóm phân loại lớn <span className="text-status-danger">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              >
                {BUSINESS_GROUP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Tên hiển thị <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={
                  activeTab === "locations"
                    ? "VD: Đà Nẵng"
                    : activeTab === "categories"
                      ? "VD: Tour Biển Đảo"
                      : "VD: Khách sạn"
                }
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Đường dẫn tĩnh
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="Để trống để tự tạo từ tên"
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base font-mono text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          {activeTab === "locations" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Khu vực trực thuộc
                  </label>
                  <select
                    value={form.parent_id}
                    onChange={(e) => handleChange("parent_id", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  >
                    <option value="">-- Không có (Cấp cao nhất) --</option>
                    {parentOptions.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Mã quốc gia
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={form.country_code}
                    onChange={(e) => handleChange("country_code", e.target.value.toUpperCase())}
                    placeholder="VN"
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base font-mono text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                  Ảnh đại diện điểm đến (tải từ máy lên kho lưu trữ)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLocationImageChange}
                  className="hidden"
                />

                {form.image_url ? (
                  <div className="relative rounded-xl overflow-hidden border border-border-subtle bg-slate-100">
                    <img
                      src={form.image_url}
                      alt="Ảnh điểm đến"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>Đổi ảnh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange("image_url", "")}
                        className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white cursor-pointer"
                        title="Xóa ảnh điểm đến"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 px-4 rounded-xl border-2 border-dashed border-border-subtle hover:border-brand-primary bg-surface-base hover:bg-brand-subtle/40 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
                        <span className="text-xs font-semibold text-brand-primary">
                          Đang tải ảnh lên máy chủ...
                        </span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-6 h-6 text-ink-subtle" />
                        <span className="text-xs font-semibold text-ink-primary">
                          Nhấn để chọn ảnh Điểm đến từ máy tính
                        </span>
                        <span className="text-[11px] text-ink-subtle">
                          Hỗ trợ JPG, PNG, WEBP · Tối đa 20MB
                        </span>
                      </>
                    )}
                  </button>
                )}

                {imageError && (
                  <p className="mt-1.5 text-xs font-medium text-status-danger">{imageError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Mô tả điểm đến
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Giới thiệu ngắn gọn về điểm đến..."
                  className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              {activeTab === "policies" && (
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Mô tả chi tiết chính sách
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Giải thích rõ điều kiện áp dụng cho khách hàng và đối tác..."
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              )}

              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_popular}
                  onChange={(e) => handleChange("is_popular", e.target.checked)}
                  className="w-4 h-4 rounded border-border-subtle text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm font-medium text-ink-primary">
                  Đánh dấu là điểm đến phổ biến
                </span>
              </label>
            </>
          )}

          {activeTab === "categories" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                  Loại hình dịch vụ áp dụng *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_TYPE_OPTIONS.map((opt) => {
                    const checked = form.applicable_types.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleType(opt.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          checked
                            ? "bg-brand-subtle border-brand-primary text-brand-primary"
                            : "bg-surface-base border-border-subtle text-ink-body hover:bg-slate-100"
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5" />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Mã biểu tượng
                  </label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => handleChange("icon", e.target.value)}
                    placeholder="VD: compass, trees, utensils"
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base font-mono text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Đường dẫn ảnh biểu tượng
                  </label>
                  <input
                    type="url"
                    value={form.icon_url}
                    onChange={(e) => handleChange("icon_url", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Mô tả danh mục
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Mô tả chi tiết loại hình trải nghiệm..."
                  className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </>
          )}

          {(activeTab === "serviceAmenities" ||
            activeTab === "roomAmenities" ||
            activeTab === "includes" ||
            activeTab === "excludes" ||
            activeTab === "policies") && (
            <>
              {activeTab === "policies" && (
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Nhóm chính sách *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  >
                    {POLICY_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                  Loại hình dịch vụ áp dụng *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_TYPE_OPTIONS.map((opt) => {
                    const checked = form.applicable_types.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleType(opt.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          checked
                            ? "bg-brand-subtle border-brand-primary text-brand-primary"
                            : "bg-surface-base border-border-subtle text-ink-body hover:bg-slate-100"
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5" />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(activeTab === "serviceAmenities" ||
                activeTab === "roomAmenities" ||
                activeTab === "policies") && (
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                    Chọn biểu tượng hiển thị ({form.icon || "sparkles"})
                  </label>
                  <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 p-2.5 rounded-xl border border-border-subtle bg-surface-base max-h-36 overflow-y-auto">
                    {AMENITY_ICON_OPTIONS.map((iconKey) => {
                      const selected = form.icon === iconKey;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          title={iconKey}
                          onClick={() => handleChange("icon", iconKey)}
                          className={`h-8 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                            selected
                              ? "bg-brand-primary text-white border-brand-primary"
                              : "bg-surface-elevated text-ink-body border-border-subtle hover:bg-slate-100"
                          }`}
                        >
                          <AmenityIcon name={iconKey} className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(activeTab === "includes" || activeTab === "excludes") && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-border-subtle text-xs text-ink-body">
                  {activeTab === "includes" ? (
                    <>
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span>
                        Mục <strong>Bao gồm</strong> sẽ hiển thị biểu tượng dấu tick xanh trên giao
                        diện người dùng.
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </span>
                      <span>
                        Mục <strong>Không bao gồm</strong> sẽ hiển thị biểu tượng dấu X đỏ trên giao
                        diện người dùng.
                      </span>
                    </>
                  )}
                </div>
              )}

              {activeTab === "policies" && (
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Mô tả chi tiết chính sách
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Giải thích rõ điều kiện áp dụng cho khách hàng và đối tác..."
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              )}

              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => handleChange("is_active", e.target.checked)}
                  className="w-4 h-4 rounded border-border-subtle text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm font-medium text-ink-primary">
                  Kích hoạt hiển thị cho Nhà cung cấp chọn
                </span>
              </label>
            </>
          )}

          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-body text-sm font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? "Lưu thay đổi" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
