import React from "react";
import { Search } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";
import { formatCurrencyVnd } from "../../provider/models/serviceFormModel";

const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang hiệu lực" },
  { id: "upcoming", label: "Sắp diễn ra" },
  { id: "expired", label: "Hết hạn / Hết lượt" },
];

const STATUS_BADGE = {
  active: {
    label: "Đang hiệu lực",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  upcoming: { label: "Sắp diễn ra", className: "bg-sky-50 text-sky-700 border border-sky-200" },
  expired: {
    label: "Hết hiệu lực",
    className: "bg-slate-100 text-ink-subtle border border-border-subtle",
  },
};

function formatDateShort(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Bảng quản lý Mã ưu đãi toàn sàn — đồng bộ chuẩn UI Admin.
 */
export default function AdminCouponsTable({
  coupons = [],
  isLoading = false,
  statusFilter = "all",
  onStatusFilterChange,
  searchQuery = "",
  onSearchChange,
  counts = { all: 0, active: 0, upcoming: 0, expired: 0 },
  onEdit,
  onDelete,
  onOpenGrant,
}) {
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
                {tabCount > 0 && (
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

        <div className="relative w-full lg:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Tìm theo mã ưu đãi..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors"
          />
          <Search className="w-4 h-4 text-ink-subtle absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[880px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
              <th className="py-3 px-4 sm:px-6">Mã ưu đãi</th>
              <th className="py-3 px-4">Mức giảm & Điều kiện</th>
              <th className="py-3 px-4">Lượt dùng / Đã tặng</th>
              <th className="py-3 px-4">Thời gian áp dụng</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 sm:px-6 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-4 sm:px-6">
                    <Skeleton className="h-5 w-28" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-32 mb-1.5" rounded="rounded-md" />
                    <Skeleton className="h-3 w-40" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-24 mb-1.5" rounded="rounded-md" />
                    <Skeleton className="h-3 w-20" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-32" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-6 w-24" rounded="rounded-full" />
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <Skeleton className="h-8 w-36 ml-auto" rounded="rounded-lg" />
                  </td>
                </tr>
              ))
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-ink-subtle">
                  <div className="max-w-xs mx-auto space-y-1">
                    <Typography variant="body" className="font-semibold text-ink-primary">
                      Chưa có mã ưu đãi nào
                    </Typography>
                    <Typography variant="caption" className="text-ink-subtle">
                      Tạo mã ưu đãi mới hoặc thay đổi bộ lọc để xem dữ liệu.
                    </Typography>
                  </div>
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const statusMeta = STATUS_BADGE[coupon.computed_status] || STATUS_BADGE.active;
                const discountText =
                  coupon.type === "percent"
                    ? `Giảm ${coupon.discount_value}%`
                    : `Giảm ${formatCurrencyVnd(coupon.discount_value)}`;

                return (
                  <tr key={coupon.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Mã ưu đãi */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-mono font-bold text-ink-primary bg-slate-100 px-2.5 py-1 rounded border border-border-subtle text-xs sm:text-sm inline-block">
                        {coupon.code}
                      </span>
                      <span
                        className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ml-2 ${
                          coupon.visibility === "private"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                        }`}
                      >
                        {coupon.visibility === "private" ? "Riêng tư" : "Công khai"}
                      </span>
                    </td>

                    {/* Mức giảm & Điều kiện */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-brand-primary block">{discountText}</span>
                      <span className="text-xs text-ink-subtle block mt-0.5">
                        Đơn tối thiểu:{" "}
                        {coupon.min_order_amount
                          ? formatCurrencyVnd(coupon.min_order_amount)
                          : "Không giới hạn"}{" "}
                        (tối đa {coupon.per_user_limit} lượt/khách)
                      </span>
                    </td>

                    {/* Lượt dùng / Đã tặng */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-ink-primary block">
                        {coupon.used_count} / {coupon.usage_limit ?? "∞"} lượt
                      </span>
                      <span className="text-xs text-ink-subtle block mt-0.5">
                        Đã tặng: {coupon.grants_count || 0} khách
                      </span>
                    </td>

                    {/* Thời gian áp dụng */}
                    <td className="py-4 px-4 text-xs text-ink-body">
                      <div>Từ: {formatDateShort(coupon.valid_from)}</div>
                      <div className="mt-0.5 text-ink-subtle">
                        Đến: {formatDateShort(coupon.valid_until)}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-4 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                      {coupon.computed_status !== "expired" && (
                        <button
                          type="button"
                          onClick={() => onOpenGrant?.(coupon)}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Tặng mã
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit?.(coupon)}
                        className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-primary font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Sửa
                      </button>
                      {coupon.used_count === 0 && (
                        <button
                          type="button"
                          onClick={() => onDelete?.(coupon)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-status-danger border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
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
      {!isLoading && coupons.length > 0 && (
        <div className="px-5 py-3 border-t border-border-subtle bg-slate-50/60 flex items-center justify-between text-xs text-ink-subtle">
          <span>
            Hiển thị <strong>{coupons.length}</strong> mã ưu đãi
          </span>
          <span>Có thể tặng trực tiếp mã cho Khách du lịch (Tourist)</span>
        </div>
      )}
    </div>
  );
}
