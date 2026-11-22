import React, { useState } from "react";
import { Loader2, X, Check } from "lucide-react";
import Typography from "../../../components/ui/Typography";

const BUSINESS_GROUP_OPTIONS = ["Chỗ ở", "Giải trí", "Phương tiện", "Ăn uống"];

const TAB_TITLES = {
  locations: { create: "Thêm điểm đến mới", edit: "Cập nhật điểm đến" },
  categories: { create: "Thêm danh mục dịch vụ", edit: "Cập nhật danh mục dịch vụ" },
  businessTypes: { create: "Thêm loại hình kinh doanh", edit: "Cập nhật loại hình kinh doanh" },
  policies: { create: "Thêm chính sách dịch vụ", edit: "Cập nhật chính sách dịch vụ" },
};

const SERVICE_TYPE_OPTIONS = [
  { id: "hotel", label: "Khách sạn" },
  { id: "homestay", label: "Homestay" },
  { id: "tour", label: "Tour" },
  { id: "vehicle", label: "Thuê xe" },
  { id: "train", label: "Tàu hỏa" },
];

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
    // Categories & Policies
    icon: item?.icon || (activeTab === "policies" ? "shield-check" : ""),
    icon_url: item?.icon_url || "",
    category: item?.category || "rules",
    applicable_types:
      Array.isArray(item?.applicable_types) && item.applicable_types.length > 0
        ? item.applicable_types
        : ["hotel", "homestay", "tour", "vehicle", "train"],
    is_active: item?.is_active !== undefined ? Boolean(item.is_active) : true,
    description: item?.description || "",
    // BusinessTypes
    type: item?.type || "Chỗ ở",
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
      const current = prev.applicable_types || [];
      const exists = current.includes(typeId);
      const nextTypes = exists ? current.filter((t) => t !== typeId) : [...current, typeId];
      return { ...prev, applicable_types: nextTypes };
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
    } else if (activeTab === "policies") {
      if (!form.applicable_types || form.applicable_types.length === 0) {
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

          {activeTab === "policies" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Nhóm chính sách <span className="text-status-danger">*</span>
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

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                  Loại hình dịch vụ áp dụng <span className="text-status-danger">*</span>
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
