import React from "react";
import { Search } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";
import { formatCurrencyVnd } from "../../provider/models/serviceFormModel";

const ROLE_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "provider", label: "Nhà cung cấp" },
  { id: "tourist", label: "Khách du lịch" },
];

const ROLE_LABELS = {
  provider: "Nhà cung cấp",
  tourist: "Khách du lịch",
};

const USER_STATUS_BADGE = {
  active: {
    label: "Hoạt động",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  banned: {
    label: "Đã khóa",
    className: "bg-rose-50 text-rose-700 border border-rose-200",
  },
  pending: {
    label: "Chờ xử lý",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
};

/**
 * Bảng danh sách Tài khoản Người dùng (Provider & Tourist) — đồng bộ chuẩn UI Admin.
 */
export default function AdminUsersTable({
  users = [],
  isLoading = false,
  roleFilter = "all",
  onRoleFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
  searchQuery = "",
  onSearchChange,
  counts = { all: 0, provider: 0, tourist: 0 },
  onViewDetail,
  onOpenBan,
  onUnban,
}) {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-xs overflow-hidden">
      {/* Thanh công cụ: Tabs vai trò, Lọc trạng thái & Tìm kiếm */}
      <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {ROLE_TABS.map((tab) => {
            const isActive = roleFilter === tab.id;
            const tabCount = counts?.[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onRoleFilterChange?.(tab.id)}
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Tìm tên, email, số điện thoại..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors"
            />
            <Search className="w-4 h-4 text-ink-subtle absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange?.(e.target.value)}
            aria-label="Lọc theo trạng thái tài khoản"
            className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="banned">Đã khóa</option>
            <option value="pending">Chờ xử lý</option>
          </select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[840px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
              <th className="py-3 px-4 sm:px-6">Tài khoản</th>
              <th className="py-3 px-4">Vai trò</th>
              <th className="py-3 px-4">Liên hệ</th>
              <th className="py-3 px-4">Ví điện tử</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 sm:px-6 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-4 sm:px-6">
                    <Skeleton className="h-4 w-40 mb-1.5" rounded="rounded-md" />
                    <Skeleton className="h-3 w-48" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-5 w-24" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-24" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-5 w-28" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-6 w-20" rounded="rounded-full" />
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <Skeleton className="h-8 w-28 ml-auto" rounded="rounded-lg" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-ink-subtle">
                  <div className="max-w-xs mx-auto space-y-1">
                    <Typography variant="body" className="font-semibold text-ink-primary">
                      Không tìm thấy tài khoản nào
                    </Typography>
                    <Typography variant="caption" className="text-ink-subtle">
                      Thử thay đổi bộ lọc vai trò, trạng thái hoặc từ khóa tìm kiếm.
                    </Typography>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((item) => {
                const statusMeta = USER_STATUS_BADGE[item.status] || USER_STATUS_BADGE.active;
                const roleLabel = ROLE_LABELS[item.role] || item.role;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Tài khoản */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-semibold text-ink-primary block">{item.name}</span>
                      <span className="text-xs text-ink-subtle block mt-0.5">{item.email}</span>
                    </td>

                    {/* Vai trò */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${
                          item.role === "provider"
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : "bg-slate-100 text-ink-body"
                        }`}
                      >
                        {roleLabel}
                      </span>
                    </td>

                    {/* Liên hệ */}
                    <td className="py-4 px-4 font-mono text-xs sm:text-sm text-ink-primary">
                      {item.phone || "--"}
                    </td>

                    {/* Ví điện tử */}
                    <td className="py-4 px-4">
                      {item.wallet_activated && item.wallet ? (
                        <div>
                          <span className="font-semibold text-ink-primary block">
                            {formatCurrencyVnd(item.wallet.balance)}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-medium">
                            Đã kích hoạt
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-ink-subtle border border-border-subtle">
                          Chưa kích hoạt
                        </span>
                      )}
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
                      <button
                        type="button"
                        onClick={() => onViewDetail?.(item)}
                        className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-primary font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Xem chi tiết
                      </button>

                      {item.status !== "banned" ? (
                        <button
                          type="button"
                          onClick={() => onOpenBan?.(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-status-danger border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Khóa
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onUnban?.(item.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Mở khóa
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
      {!isLoading && users.length > 0 && (
        <div className="px-5 py-3 border-t border-border-subtle bg-slate-50/60 flex items-center justify-between text-xs text-ink-subtle">
          <span>
            Hiển thị <strong>{users.length}</strong> tài khoản
          </span>
          <span>Chỉ hiển thị Nhà cung cấp và Khách du lịch</span>
        </div>
      )}
    </div>
  );
}
