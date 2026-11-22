import React, { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { AMENITY_ICON_OPTIONS, AmenityIcon, SERVICE_TYPE_OPTIONS } from "../utils/amenityIcons";

const BUSINESS_GROUP_OPTIONS = ["Chỗ ở", "Giải trí", "Phương tiện", "Ăn uống"];

const TAB_TITLES = {
  locations: { create: "Thêm điểm đến mới", edit: "Cập nhật điểm đến" },
  categories: { create: "Thêm danh mục dịch vụ", edit: "Cập nhật danh mục dịch vụ" },
  businessTypes: { create: "Thêm loại hình kinh doanh", edit: "Cập nhật loại hình kinh doanh" },
  serviceAmenities: { create: "Thêm tiện nghi dịch vụ", edit: "Cập nhật tiện nghi dịch vụ" },
  roomAmenities: { create: "Thêm tiện nghi phòng", edit: "Cập nhật tiện nghi phòng" },
  includes: { create: "Thêm mục bao gồm", edit: "Cập nhật mục bao gồm" },
  excludes: { create: "Thêm mục không bao gồm", edit: "Cập nhật mục không bao gồm" },
};

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
    // Categories & Amenities
    icon:
      item?.icon ||
      (activeTab === "serviceAmenities" || activeTab === "roomAmenities" ? "sparkles" : ""),
    icon_url: item?.icon_url || "",
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

  if (!isOpen) return null;

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
      payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
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
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Đường dẫn ảnh đại diện
                </label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => handleChange("image_url", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
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
            activeTab === "excludes") && (
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

              {(activeTab === "serviceAmenities" || activeTab === "roomAmenities") && (
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
