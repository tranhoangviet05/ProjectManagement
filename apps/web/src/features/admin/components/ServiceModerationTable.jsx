import React from "react";
import { Search, Image as ImageIcon } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";
import { formatCurrencyVnd, SERVICE_STATUS_CONFIG } from "../../provider/models/serviceFormModel";

const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending_review", label: "Chờ duyệt" },
  { id: "active", label: "Đang hoạt động" },
  { id: "rejected", label: "Đã từ chối" },
];

const SERVICE_TYPE_LABELS = {
  tour: "Tour du lịch",
  hotel: "Khách sạn",
  homestay: "Homestay / Villa",
  vehicle: "Phương tiện",
};

/**
 * Bảng danh sách kiểm duyệt Dịch vụ (đồng bộ chuẩn UI với ProviderKycTable).
 */
export default function ServiceModerationTable({
  services = [],
  isLoading = false,
  statusFilter = "pending_review",
  onStatusFilterChange,
  typeFilter = "all",
  onTypeFilterChange,
  searchQuery = "",
  onSearchChange,
  counts = { pending_review: 0, active: 0, rejected: 0 },
  onReviewDetail,
  onQuickApprove,
  onOpenReject,
}) {
  const pendingCount = counts?.pending_review || 0;

  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-xs overflow-hidden">
      {/* Thanh công cụ: Bộ lọc tabs & Ô tìm kiếm + Loại hình */}
      <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Tabs lọc theo trạng thái */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.id;
            const tabCount = tab.id !== "all" ? counts?.[tab.id] : null;
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
                {tab.id === "pending_review" && pendingCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/25 text-white" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
                {tab.id !== "pending_review" && tabCount > 0 && (
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

        {/* Tìm kiếm & Lọc loại hình */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Tìm tên dịch vụ, doanh nghiệp..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors"
            />
            <Search className="w-4 h-4 text-ink-subtle absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange?.(e.target.value)}
            aria-label="Lọc theo loại hình dịch vụ"
            className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors cursor-pointer"
          >
            <option value="all">Tất cả loại hình</option>
            <option value="tour">Tour du lịch</option>
            <option value="hotel">Khách sạn</option>
            <option value="homestay">Homestay / Villa</option>
            <option value="vehicle">Phương tiện</option>
          </select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[860px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
              <th className="py-3 px-4 sm:px-6">Dịch vụ</th>
              <th className="py-3 px-4">Nhà cung cấp</th>
              <th className="py-3 px-4">Loại hình</th>
              <th className="py-3 px-4">Giá cơ sở</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 sm:px-6 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-14 h-10 shrink-0" rounded="rounded-lg" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-44" rounded="rounded-md" />
                        <Skeleton className="h-3 w-24" rounded="rounded-md" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-32 mb-1.5" rounded="rounded-md" />
                    <Skeleton className="h-3 w-20" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-5 w-24" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-24" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-6 w-20" rounded="rounded-full" />
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <Skeleton className="h-8 w-28 ml-auto" rounded="rounded-lg" />
                  </td>
                </tr>
              ))
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-ink-subtle">
                  <div className="max-w-xs mx-auto space-y-1">
                    <Typography variant="body" className="font-semibold text-ink-primary">
                      Không tìm thấy dịch vụ nào
                    </Typography>
                    <Typography variant="caption" className="text-ink-subtle">
                      Thử thay đổi bộ lọc trạng thái, loại hình hoặc từ khóa tìm kiếm.
                    </Typography>
                  </div>
                </td>
              </tr>
            ) : (
              services.map((service) => {
                const statusInfo =
                  SERVICE_STATUS_CONFIG[service.status] || SERVICE_STATUS_CONFIG.pending_review;
                const typeLabel = SERVICE_TYPE_LABELS[service.type] || service.type;

                return (
                  <tr key={service.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Dịch vụ */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 border border-border-subtle shrink-0">
                          {service.cover_image ? (
                            <img
                              src={service.cover_image}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-ink-subtle">
                              <ImageIcon className="w-4 h-4 opacity-50" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-ink-primary block text-sm line-clamp-1">
                            {service.name}
                          </span>
                          <span className="text-xs text-ink-subtle block mt-0.5">
                            {service.location?.name || "Chưa gắn địa điểm"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Nhà cung cấp */}
                    <td className="py-4 px-4">
                      <span className="font-medium text-ink-primary block">
                        {service.provider?.business_name || "Đối tác"}
                      </span>
                      <span className="text-xs text-ink-subtle block">
                        {service.provider?.business_type?.name || "Chưa phân loại"}
                      </span>
                    </td>

                    {/* Loại hình */}
                    <td className="py-4 px-4">
                      <span className="bg-slate-100 text-ink-body px-2.5 py-0.5 rounded text-xs font-medium">
                        {typeLabel}
                      </span>
                    </td>

                    {/* Giá cơ sở */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-semibold text-ink-primary">
                        {formatCurrencyVnd(service.base_price)}
                      </span>
                      <span className="text-xs text-ink-subtle"> / {service.price_unit}</span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-4 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onReviewDetail?.(service)}
                        className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-primary font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Xem chi tiết
                      </button>

                      {service.status === "pending_review" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onQuickApprove?.(service.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReject?.(service)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-status-danger border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bảng */}
      {!isLoading && services.length > 0 && (
        <div className="px-5 py-3 border-t border-border-subtle bg-slate-50/60 flex items-center justify-between text-xs text-ink-subtle">
          <span>
            Hiển thị <strong>{services.length}</strong> dịch vụ
          </span>
          <span>Dữ liệu cập nhật theo bộ lọc hiện tại</span>
        </div>
      )}
    </div>
  );
}
