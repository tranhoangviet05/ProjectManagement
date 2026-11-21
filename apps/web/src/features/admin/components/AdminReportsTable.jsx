import React from "react";
import { Search } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";

const STATUS_TABS = [
  { id: "pending", label: "Chờ xử lý" },
  { id: "resolved_hidden", label: "Đã ẩn nội dung" },
  { id: "dismissed", label: "Đã bỏ qua" },
  { id: "all", label: "Tất cả" },
];

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

const TYPE_LABELS = {
  post: "Bài viết",
  comment: "Bình luận",
};

/**
 * Bảng kiểm duyệt Nội dung & Báo cáo Cộng đồng — đồng bộ chuẩn UI Admin.
 */
export default function AdminReportsTable({
  reports = [],
  isLoading = false,
  statusFilter = "pending",
  onStatusFilterChange,
  typeFilter = "all",
  onTypeFilterChange,
  searchQuery = "",
  onSearchChange,
  counts = { all: 0, pending: 0, resolved_hidden: 0, dismissed: 0 },
  onViewDetail,
}) {
  const pendingCount = counts?.pending || 0;

  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-xs overflow-hidden">
      {/* Thanh công cụ */}
      <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.id;
            const tabCount = counts?.[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusFilterChange?.(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-ink-body hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === "pending" && pendingCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/25 text-white" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
                {tab.id !== "pending" && tabCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      isActive ? "bg-white/25 text-white" : "bg-slate-100 text-ink-subtle"
                    }`}
                  >
                    {tabCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Tìm lý do, người báo cáo..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors"
            />
            <Search className="w-4 h-4 text-ink-subtle absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange?.(e.target.value)}
            aria-label="Lọc theo loại nội dung"
            className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors cursor-pointer"
          >
            <option value="all">Tất cả loại nội dung</option>
            <option value="post">Bài viết</option>
            <option value="comment">Bình luận</option>
          </select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[840px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
              <th className="py-3 px-4 sm:px-6">Nội dung bị báo cáo</th>
              <th className="py-3 px-4">Loại</th>
              <th className="py-3 px-4">Lý do báo cáo</th>
              <th className="py-3 px-4">Người báo cáo</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 sm:px-6 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle text-sm">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-4 sm:px-6">
                    <Skeleton className="h-4 w-48 mb-1.5" rounded="rounded-md" />
                    <Skeleton className="h-3 w-32" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-5 w-20" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-40" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-28" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-6 w-24" rounded="rounded-full" />
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <Skeleton className="h-8 w-24 ml-auto" rounded="rounded-lg" />
                  </td>
                </tr>
              ))
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-ink-subtle">
                  <div className="max-w-xs mx-auto space-y-1">
                    <Typography variant="body" className="font-semibold text-ink-primary">
                      Không có báo cáo vi phạm nào
                    </Typography>
                    <Typography variant="caption" className="text-ink-subtle">
                      Cộng đồng hiện đang ổn định hoặc thử thay đổi bộ lọc để xem lịch sử xử lý.
                    </Typography>
                  </div>
                </td>
              </tr>
            ) : (
              reports.map((report) => {
                const statusMeta = STATUS_BADGE[report.status] || STATUS_BADGE.pending;
                const typeLabel = TYPE_LABELS[report.reportable_type] || report.reportable_type;

                return (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-medium text-ink-primary block line-clamp-1 max-w-xs">
                        {report.target?.content || "Nội dung đã bị xóa"}
                      </span>
                      <span className="text-xs text-ink-subtle block mt-0.5">
                        Tác giả: {report.target?.author?.name || "--"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="bg-slate-100 text-ink-body px-2.5 py-0.5 rounded text-xs font-medium">
                        {typeLabel}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-xs text-ink-body line-clamp-2 max-w-xs">
                        {report.reason}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-ink-primary block">
                        {report.reporter?.name || "--"}
                      </span>
                      <span className="text-xs text-ink-subtle">{report.reporter?.email}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewDetail?.(report)}
                        className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-primary font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Xem & Xử lý
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && reports.length > 0 && (
        <div className="px-5 py-3 border-t border-border-subtle bg-slate-50/60 flex items-center justify-between text-xs text-ink-subtle">
          <span>
            Hiển thị <strong>{reports.length}</strong> báo cáo vi phạm
          </span>
          <span>Nội dung bị ẩn sẽ tự động ngừng hiển thị trên bảng tin</span>
        </div>
      )}
    </div>
  );
}
