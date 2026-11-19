import React, { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Typography from "../../../components/ui/Typography";

/**
 * Biểu mẫu Đổi mật khẩu tài khoản Đối tác
 * Tuân thủ quy tắc Single Responsibility & Intentional Icon Usage (chỉ dùng Eye/EyeOff chức năng)
 */
export default function ProviderSecurityForm({ isSubmitting, onSubmit, feedback }) {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (localError) setLocalError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!formData.current_password) {
      setLocalError("Vui lòng nhập mật khẩu hiện tại của bạn.");
      return;
    }

    if (!formData.new_password || formData.new_password.length < 8) {
      setLocalError("Mật khẩu mới phải có độ dài tối thiểu 8 ký tự.");
      return;
    }

    if (formData.new_password !== formData.new_password_confirmation) {
      setLocalError("Mật khẩu xác nhận không trùng khớp với mật khẩu mới.");
      return;
    }

    onSubmit?.({
      current_password: formData.current_password,
      new_password: formData.new_password,
      new_password_confirmation: formData.new_password_confirmation,
    });
  };

  const activeError = localError || (feedback?.type === "error" ? feedback.message : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Thông báo kết quả */}
      {feedback?.type === "success" && (
        <div className="p-4 rounded-lg text-sm font-medium flex items-start gap-3 bg-emerald-50 text-status-success border border-emerald-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{feedback.message}</span>
        </div>
      )}

      {activeError && (
        <div className="p-4 rounded-lg text-sm font-medium flex items-start gap-3 bg-rose-50 text-status-danger border border-rose-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{activeError}</span>
        </div>
      )}

      {/* Mật khẩu hiện tại */}
      <div>
        <Typography variant="label" as="label" htmlFor="current_password" className="block mb-1.5">
          Mật khẩu hiện tại <span className="text-status-danger">*</span>
        </Typography>
        <div className="relative">
          <input
            id="current_password"
            name="current_password"
            type={showCurrent ? "text" : "password"}
            value={formData.current_password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu đang sử dụng"
            className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-border-subtle bg-surface-elevated text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-primary cursor-pointer p-1"
            aria-label={showCurrent ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mật khẩu mới */}
      <div>
        <Typography variant="label" as="label" htmlFor="new_password" className="block mb-1.5">
          Mật khẩu mới <span className="text-status-danger">*</span>
        </Typography>
        <div className="relative">
          <input
            id="new_password"
            name="new_password"
            type={showNew ? "text" : "password"}
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Tối thiểu 8 ký tự"
            className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-border-subtle bg-surface-elevated text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
          <button
            type="button"
            onClick={() => setShowNew((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-primary cursor-pointer p-1"
            aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Typography variant="caption" className="block text-ink-subtle mt-1.5">
          Mật khẩu phải dài ít nhất 8 ký tự, nên kết hợp cả chữ cái và chữ số.
        </Typography>
      </div>

      {/* Xác nhận mật khẩu mới */}
      <div>
        <Typography
          variant="label"
          as="label"
          htmlFor="new_password_confirmation"
          className="block mb-1.5"
        >
          Xác nhận mật khẩu mới <span className="text-status-danger">*</span>
        </Typography>
        <div className="relative">
          <input
            id="new_password_confirmation"
            name="new_password_confirmation"
            type={showConfirm ? "text" : "password"}
            value={formData.new_password_confirmation}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu mới"
            className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-border-subtle bg-surface-elevated text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-primary cursor-pointer p-1"
            aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Nút submit */}
      <div className="pt-4 border-t border-border-subtle flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang cập nhật mật khẩu...</span>
            </>
          ) : (
            <span>Cập nhật mật khẩu mới</span>
          )}
        </button>
      </div>
    </form>
  );
}
