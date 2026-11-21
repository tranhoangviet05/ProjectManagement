import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import Typography from "../../../components/ui/Typography";

function toDateInputValue(isoString) {
  if (!isoString) return "";
  return String(isoString).slice(0, 10);
}

/**
 * Modal Tạo mới / Cập nhật Mã ưu đãi toàn sàn.
 */
export default function CouponFormModal({
  coupon,
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(coupon?.id);

  const [form, setForm] = useState({
    code: coupon?.code || "",
    type: coupon?.type || "percent",
    discount_value: coupon?.discount_value ?? "",
    min_order_amount: coupon?.min_order_amount ?? "",
    usage_limit: coupon?.usage_limit ?? "",
    per_user_limit: coupon?.per_user_limit ?? 1,
    valid_from: toDateInputValue(coupon?.valid_from),
    valid_until: toDateInputValue(coupon?.valid_until),
  });
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedCode = form.code.trim().toUpperCase();
    if (!trimmedCode) {
      setError("Vui lòng nhập mã ưu đãi.");
      return;
    }
    const discountNum = Number(form.discount_value);
    if (!discountNum || discountNum <= 0) {
      setError("Giá trị giảm phải lớn hơn 0.");
      return;
    }
    if (form.type === "percent" && discountNum > 100) {
      setError("Mức giảm theo phần trăm không được vượt quá 100%.");
      return;
    }
    if (form.valid_from && form.valid_until && form.valid_until < form.valid_from) {
      setError("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }

    const payload = {
      code: trimmedCode,
      type: form.type,
      discount_value: discountNum,
      min_order_amount: form.min_order_amount === "" ? null : Number(form.min_order_amount),
      usage_limit: form.usage_limit === "" ? null : Number(form.usage_limit),
      per_user_limit: Number(form.per_user_limit) || 1,
      valid_from: form.valid_from ? `${form.valid_from}T00:00:00` : null,
      valid_until: form.valid_until ? `${form.valid_until}T23:59:59` : null,
    };

    onSubmit?.(payload, coupon?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-surface-elevated rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-border-subtle bg-slate-50 flex items-center justify-between">
          <Typography variant="h3" className="text-lg font-bold text-ink-primary">
            {isEditing ? `Cập nhật mã ${coupon.code}` : "Tạo mã ưu đãi mới"}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Mã ưu đãi <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                placeholder="VD: SUMMER2026"
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base font-mono text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Loại giảm giá <span className="text-status-danger">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Giá trị giảm ({form.type === "percent" ? "%" : "VNĐ"}){" "}
                <span className="text-status-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={form.type === "percent" ? 100 : undefined}
                value={form.discount_value}
                onChange={(e) => handleChange("discount_value", e.target.value)}
                placeholder={form.type === "percent" ? "VD: 15" : "VD: 100000"}
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                value={form.min_order_amount}
                onChange={(e) => handleChange("min_order_amount", e.target.value)}
                placeholder="Để trống nếu không yêu cầu"
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Tổng lượt sử dụng tối đa
              </label>
              <input
                type="number"
                min="1"
                value={form.usage_limit}
                onChange={(e) => handleChange("usage_limit", e.target.value)}
                placeholder="Để trống nếu không giới hạn"
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Giới hạn mỗi khách hàng <span className="text-status-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.per_user_limit}
                onChange={(e) => handleChange("per_user_limit", e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Hiệu lực từ ngày
              </label>
              <input
                type="date"
                value={form.valid_from}
                onChange={(e) => handleChange("valid_from", e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Hết hạn vào ngày
              </label>
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) => handleChange("valid_until", e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

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
              {isEditing ? "Lưu thay đổi" : "Tạo mã ưu đãi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
