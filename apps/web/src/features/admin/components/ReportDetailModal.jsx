import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";

const STATUS_BADGE = {
  pending: { label: "Chờ xử lý", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  resolved_hidden: {
    label: "Đã ẩn nội dung",
    className: "bg-rose-50 text-rose-700 border border-rose-200",
  },
  dismissed: {
    label: "Đã bỏ qua",
    className: "bg-slate-100 text-ink-subtle border border-border-subtle",
  },
};

/**
 * Modal Xem chi tiết & Xử lý Báo cáo vi phạm cộng đồng — đồng bộ chuẩn UI Admin.
 */
export default function ReportDetailModal({
  report,
  isLoadingDetail = false,
  isSubmitting = false,
  onClose,
  onResolve,
}) {
  const [resolutionNote, setResolutionNote] = useState(report?.resolution_note || "");

  if (!report && !isLoadingDetail) return null;

  const statusMeta = STATUS_BADGE[report?.status] || STATUS_BADGE.pending;
  const mediaList = Array.isArray(report?.target?.media) ? report.target.media : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-surface-elevated rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Typography variant="h3" className="text-lg font-bold text-ink-primary truncate">
              Chi tiết báo cáo #{report?.id}
            </Typography>
            {report?.status && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${statusMeta.className}`}
              >
                {statusMeta.label}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-1.5 rounded-lg text-ink-subtle hover:text-ink-primary hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {isLoadingDetail ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" rounded="rounded-md" />
              <Skeleton className="h-20 w-full" rounded="rounded-xl" />
              <Skeleton className="h-16 w-full" rounded="rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-36" rounded="rounded-md" />
              <Skeleton className="h-32 w-full" rounded="rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
            {/* Cột trái: Thông tin báo cáo */}
            <div className="md:col-span-5 p-6 space-y-4 bg-surface-elevated">
              <div>
                <span className="text-xs text-ink-subtle font-semibold block mb-1">
                  Lý do báo cáo
                </span>
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-sm text-ink-primary leading-relaxed">
                  {report.reason}
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle space-y-2 text-xs">
                <div>
                  <span className="text-ink-subtle block">Người báo cáo</span>
                  <span className="font-semibold text-ink-primary text-sm">
                    {report.reporter?.name} ({report.reporter?.email})
                  </span>
                </div>
                {report.resolved_by && (
                  <div className="pt-2">
                    <span className="text-ink-subtle block">Người xử lý</span>
                    <span className="font-semibold text-ink-primary">
                      {report.resolved_by.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border-subtle">
                <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                  Ghi chú xử lý của Quản trị viên
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  disabled={report.status !== "pending"}
                  placeholder="Nhập ghi chú lưu lịch sử kiểm duyệt..."
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-70"
                />
              </div>
            </div>

            {/* Cột phải: Nội dung bị báo cáo */}
            <div className="md:col-span-7 p-6 space-y-4 bg-slate-50/40">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink-subtle">
                  Nội dung {report.reportable_type === "post" ? "Bài viết" : "Bình luận"}
                </span>
                {report.target?.is_hidden && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                    Đang bị ẩn
                  </span>
                )}
              </div>

              {report.target ? (
                <div className="p-4 rounded-xl border border-border-subtle bg-surface-elevated space-y-3">
                  <div className="text-xs text-ink-subtle">
                    Tác giả:{" "}
                    <strong className="text-ink-primary">{report.target.author?.name}</strong> (
                    {report.target.author?.email})
                  </div>

                  {report.target.location_name && (
                    <div className="text-xs text-brand-primary font-medium">
                      Địa điểm gắn thẻ: {report.target.location_name}
                    </div>
                  )}

                  <p className="text-sm text-ink-body whitespace-pre-line leading-relaxed">
                    {report.target.content || "Không có nội dung văn bản."}
                  </p>

                  {report.target.service && (
                    <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg text-ink-body">
                      Dịch vụ đính kèm: <strong>{report.target.service.name}</strong>
                    </div>
                  )}

                  {mediaList.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {mediaList.map((m) => (
                        <div
                          key={m.id}
                          className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 border border-border-subtle"
                        >
                          <img src={m.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-border-subtle bg-surface-elevated text-xs text-ink-subtle">
                  Nội dung gốc đã bị xóa khỏi hệ thống.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {!isLoadingDetail && report && (
          <div className="px-6 py-4 border-t border-border-subtle bg-slate-50 flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-body text-sm font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {report.status === "pending" && (
              <>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onResolve?.(report.id, "dismiss", resolutionNote)}
                  className="px-4 py-2 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-primary text-sm font-semibold transition-colors cursor-pointer"
                >
                  Bỏ qua báo cáo
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onResolve?.(report.id, "hide", resolutionNote)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-status-danger hover:opacity-90 text-white text-sm font-semibold transition-opacity cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Ẩn nội dung vi phạm
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
