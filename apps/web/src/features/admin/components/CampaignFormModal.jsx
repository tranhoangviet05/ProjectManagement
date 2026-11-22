import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import apiClient from "../../../lib/apiClient";

function toLocalDateInput(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Tự động tối ưu ảnh banner dung lượng lớn (> 1.5MB) về độ phân giải Full HD (tối đa 1920px)
 * để tải lên nhanh, không bị chặn bởi giới hạn upload_max_filesize của PHP và hiển thị mượt trên Mobile.
 */
async function optimizeBannerFile(file) {
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

export default function CampaignFormModal({
  campaign = null,
  mode = "create", // create | edit | reopen
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
}) {
  const isReopen = mode === "reopen";
  const isEditing = mode === "edit";

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 86400000);

  const [form, setForm] = useState({
    name: campaign?.name || "",
    slug: campaign?.slug || "",
    badge_text: campaign?.badge_text || "",
    banner_url: campaign?.banner_url || "",
    description: campaign?.description || "",
    discount_type: campaign?.discount_type || "percent",
    discount_value: campaign?.discount_value ? String(campaign.discount_value) : "20",
    max_discount: campaign?.max_discount ? String(campaign.max_discount) : "",
    starts_at: isReopen
      ? toLocalDateInput(now)
      : toLocalDateInput(campaign?.starts_at) || toLocalDateInput(now),
    ends_at: isReopen
      ? toLocalDateInput(nextWeek)
      : toLocalDateInput(campaign?.ends_at) || toLocalDateInput(nextWeek),
    priority: campaign?.priority !== undefined ? String(campaign.priority) : "50",
    status: isReopen ? "active" : campaign?.status || "active",
  });
  const [error, setError] = useState("");
  const [bannerError, setBannerError] = useState("");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleBannerFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setBannerError("Chỉ hỗ trợ ảnh định dạng JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setBannerError("Dung lượng ảnh banner tối đa 20MB.");
      return;
    }

    setBannerError("");
    setError("");
    setIsUploadingBanner(true);
    try {
      const uploadFile = await optimizeBannerFile(file);
      const fd = new FormData();
      fd.append("type", "banner");
      fd.append("file", uploadFile);

      const res = await apiClient.post("/media/upload", fd);
      const uploadedUrl = res?.data?.url;
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, banner_url: uploadedUrl }));
      } else {
        setBannerError("Không nhận được đường dẫn ảnh từ máy chủ.");
      }
    } catch (err) {
      setBannerError(err?.message || "Tải ảnh banner lên kho lưu trữ thất bại.");
    } finally {
      setIsUploadingBanner(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.starts_at || !form.ends_at) {
      setError("Vui lòng chọn thời gian bắt đầu và kết thúc.");
      return;
    }
    if (new Date(form.ends_at) <= new Date(form.starts_at)) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }

    if (isReopen) {
      onSubmit?.(
        {
          starts_at: form.starts_at,
          ends_at: form.ends_at,
        },
        campaign?.id,
      );
      return;
    }

    if (!form.name.trim()) {
      setError("Vui lòng nhập tên chương trình khuyến mãi.");
      return;
    }
    if (!form.discount_value || Number(form.discount_value) <= 0) {
      setError("Mức giảm giá phải lớn hơn 0.");
      return;
    }

    onSubmit?.(
      {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        badge_text: form.badge_text.trim() || null,
        banner_url: form.banner_url.trim() || null,
        description: form.description.trim() || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        max_discount: form.max_discount !== "" ? Number(form.max_discount) : null,
        starts_at: form.starts_at,
        ends_at: form.ends_at,
        priority: Number(form.priority || 0),
        status: form.status,
      },
      campaign?.id,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-surface-elevated rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-border-subtle bg-slate-50 flex items-center justify-between">
          <Typography variant="h3" className="text-lg font-bold text-ink-primary">
            {isReopen
              ? `Mở lại chiến dịch: ${campaign?.name}`
              : isEditing
                ? "Cập nhật chương trình khuyến mãi"
                : "Tạo chương trình khuyến mãi mới"}
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

          {!isReopen && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Tên chương trình *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="VD: Black Friday Siêu Sale Du Lịch"
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Nhãn hiển thị (Badge)
                  </label>
                  <input
                    type="text"
                    value={form.badge_text}
                    onChange={(e) => handleChange("badge_text", e.target.value)}
                    placeholder="VD: Black Friday -25%"
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Loại giảm giá *
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => handleChange("discount_type", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Mức giảm tối thiểu *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.discount_value}
                    onChange={(e) => handleChange("discount_value", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Giảm tối đa (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.max_discount}
                    onChange={(e) => handleChange("max_discount", e.target.value)}
                    placeholder="Không giới hạn"
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Thời gian bắt đầu *
              </label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => handleChange("starts_at", e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Thời gian kết thúc *
              </label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => handleChange("ends_at", e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          {!isReopen && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  >
                    <option value="active">Đang mở (Active)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                    <option value="ended">Đã kết thúc (Ended)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Độ ưu tiên hiển thị
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                  Ảnh Banner chương trình (tải từ máy lên kho lưu trữ)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleBannerFileChange}
                  className="hidden"
                />

                {form.banner_url ? (
                  <div className="relative rounded-xl overflow-hidden border border-border-subtle bg-slate-100">
                    <img
                      src={form.banner_url}
                      alt="Xem trước banner"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isUploadingBanner}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>Đổi ảnh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange("banner_url", "")}
                        className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white cursor-pointer"
                        title="Xóa ảnh banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isUploadingBanner}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 px-4 rounded-xl border-2 border-dashed border-border-subtle hover:border-brand-primary bg-surface-base hover:bg-brand-subtle/40 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isUploadingBanner ? (
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
                          Nhấn để chọn ảnh Banner từ máy tính
                        </span>
                        <span className="text-[11px] text-ink-subtle">
                          Khuyên dùng tỷ lệ 16:9 · Hỗ trợ JPG, PNG, WEBP · Tối đa 20MB
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Mô tả chương trình
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Mô tả thể lệ và ưu đãi cho Nhà cung cấp & Khách du lịch..."
                  className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
                {bannerError && (
                  <p className="mt-1.5 text-xs font-medium text-status-danger">{bannerError}</p>
                )}
              </div>
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
              {isReopen ? "Mở lại chiến dịch" : isEditing ? "Lưu thay đổi" : "Tạo chiến dịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
