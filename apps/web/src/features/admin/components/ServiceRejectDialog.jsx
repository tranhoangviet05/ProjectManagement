import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import Typography from "../../../components/ui/Typography";

const QUICK_REASONS = [
  "Hình ảnh album bị mờ, độ phân giải thấp hoặc không đúng thực tế dịch vụ.",
  "Lịch trình chi tiết hoặc mô tả quyền lợi dịch vụ chưa đầy đủ, khó hiểu.",
  "Giá niêm yết chưa minh bạch hoặc không khớp với đơn vị tính đã chọn.",
  "Thông tin dịch vụ chưa phù hợp với loại hình đã đăng ký.",
];

/**
 * Hộp thoại Từ chối dịch vụ kèm lý do gửi cho Provider (đồng bộ chuẩn UI với KycRejectDialog).
 */
export default function ServiceRejectDialog({
  service,
  isSubmitting = false,
  onClose,
  onConfirmReject,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!service) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Vui lòng nhập lý do từ chối dịch vụ.");
      return;
    }
    if (trimmed.length < 10) {
      setError("Lý do từ chối phải có tối thiểu 10 ký tự để đối tác nắm rõ nguyên nhân.");
      return;
    }
    setError("");
    onConfirmReject?.(service.id, trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface-elevated rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-slate-50 flex items-center justify-between">
          <Typography variant="h3" className="text-lg font-bold text-status-danger">
            Từ chối duyệt dịch vụ
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
            Bạn đang từ chối dịch vụ{" "}
            <strong className="text-ink-primary font-semibold">{service.name}</strong>. Vui lòng nêu
            rõ lý do để đối tác điều chỉnh và gửi duyệt lại.
          </p>

          <div>
            <label
              htmlFor="service-reject-reason-input"
              className="block text-xs font-semibold text-ink-primary mb-1.5"
            >
              Lý do từ chối <span className="text-status-danger">* (tối thiểu 10 ký tự)</span>
            </label>
            <textarea
              id="service-reject-reason-input"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ví dụ: Hình ảnh album bị mờ và thiếu lịch trình chi tiết buổi chiều..."
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

          {/* Gợi ý lý do nhanh */}
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

          {/* Action Buttons */}
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
              Xác nhận từ chối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
