import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import Typography from "../../../components/ui/Typography";

const QUICK_REASONS = [
  "Tài khoản có hành vi spam đặt chỗ ảo hoặc hủy đơn bất thường.",
  "Đăng tải nội dung quảng cáo trái phép hoặc ngôn từ không phù hợp.",
  "Cung cấp thông tin giả mạo khi xác minh hồ sơ đối tác.",
  "Vi phạm chính sách thanh toán và điều khoản sử dụng nền tảng.",
];

/**
 * Hộp thoại xác nhận Khóa tài khoản kèm lý do (đồng bộ chuẩn UI với KycRejectDialog & ServiceRejectDialog).
 */
export default function UserBanDialog({ user, isSubmitting = false, onClose, onConfirmBan }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Vui lòng nhập lý do khóa tài khoản.");
      return;
    }
    if (trimmed.length < 10) {
      setError("Lý do khóa tài khoản phải có tối thiểu 10 ký tự.");
      return;
    }
    setError("");
    onConfirmBan?.(user.id, trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface-elevated rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-slate-50 flex items-center justify-between">
          <Typography variant="h3" className="text-lg font-bold text-status-danger">
            Khóa tài khoản người dùng
          </Typography>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-ink-subtle hover:text-ink-primary text-sm font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-ink-body">
            Bạn đang khóa tài khoản{" "}
            <strong className="text-ink-primary font-semibold">{user.name}</strong> ({user.email}).
            Phiên đăng nhập hiện tại của tài khoản này sẽ bị thu hồi ngay lập tức.
          </p>

          <div>
            <label
              htmlFor="user-ban-reason-input"
              className="block text-xs font-semibold text-ink-primary mb-1.5"
            >
              Lý do khóa <span className="text-status-danger">* (tối thiểu 10 ký tự)</span>
            </label>
            <textarea
              id="user-ban-reason-input"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ví dụ: Tài khoản có hành vi spam đặt chỗ ảo nhiều lần..."
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-hidden focus:ring-2 focus:ring-rose-500/20 resize-y ${
                error
                  ? "border-status-danger bg-rose-50/20"
                  : "border-border-subtle bg-surface-elevated focus:border-status-danger"
              }`}
            />
            {error && (
              <span className="text-xs text-status-danger mt-1 block font-medium">{error}</span>
            )}
          </div>

          <div>
            <span className="text-xs font-semibold text-ink-subtle block mb-1.5">
              Gợi ý lý do thường gặp:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((text, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setReason(text);
                    setError("");
                  }}
                  className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-ink-body px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  {text}
                </button>
              ))}
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-status-danger hover:opacity-90 text-white text-sm font-semibold transition-opacity cursor-pointer disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Xác nhận khóa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
