import React from "react";
import { X, Loader2 } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";
import { formatCurrencyVnd } from "../../provider/models/serviceFormModel";

const ROLE_LABELS = {
  provider: "Nhà cung cấp",
  tourist: "Khách du lịch",
};

const USER_STATUS_BADGE = {
  active: {
    label: "Hoạt động",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  banned: { label: "Đã khóa", className: "bg-rose-50 text-rose-700 border border-rose-200" },
  pending: { label: "Chờ xử lý", className: "bg-amber-50 text-amber-700 border border-amber-200" },
};

/**
 * Modal Xem chi tiết Tài khoản Người dùng (đồng bộ chuẩn UI với KycDetailModal & ServiceDetailReviewModal).
 */
export default function UserDetailModal({
  user,
  isLoadingDetail = false,
  isSubmitting = false,
  onClose,
  onOpenBan,
  onUnban,
}) {
  if (!user && !isLoadingDetail) return null;

  const statusMeta = USER_STATUS_BADGE[user?.status] || USER_STATUS_BADGE.active;
  const roleLabel = ROLE_LABELS[user?.role] || user?.role;
  const createdDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-surface-elevated rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Typography variant="h3" className="text-lg font-bold text-ink-primary truncate">
              Hồ sơ tài khoản: {user?.name || "Đang tải..."}
            </Typography>
            {user?.status && (
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
              <Skeleton className="h-5 w-36" rounded="rounded-md" />
              <Skeleton className="h-4 w-56" rounded="rounded-md" />
              <Skeleton className="h-4 w-44" rounded="rounded-md" />
              <Skeleton className="h-16 w-full" rounded="rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-36" rounded="rounded-md" />
              <Skeleton className="h-24 w-full" rounded="rounded-xl" />
              <Skeleton className="h-24 w-full" rounded="rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
            {/* Cột trái: Thông tin định danh */}
            <div className="md:col-span-6 p-6 space-y-4 bg-surface-elevated">
              <div>
                <span className="text-xs text-ink-subtle font-semibold block mb-1">
                  Tên hiển thị & Vai trò
                </span>
                <div className="text-base font-bold text-ink-primary">{user.name}</div>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-slate-100 text-ink-body text-xs font-medium">
                  {roleLabel}
                </span>
              </div>

              <div className="pt-4 border-t border-border-subtle space-y-2.5 text-sm">
                <div>
                  <span className="text-xs text-ink-subtle block">Email đăng nhập</span>
                  <span className="font-medium text-ink-primary">{user.email}</span>
                </div>
                <div>
                  <span className="text-xs text-ink-subtle block">Số điện thoại</span>
                  <span className="font-mono text-ink-primary">
                    {user.phone || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-xs text-ink-subtle block">Ngày tham gia</span>
                    <span className="font-medium text-ink-primary">{createdDate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-ink-subtle block">Firebase Auth</span>
                    <span className="font-medium text-ink-primary">
                      {user.firebase_linked ? "Đã đồng bộ" : "Chưa liên kết"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Ví điện tử & Hồ sơ chuyên biệt */}
            <div className="md:col-span-6 p-6 space-y-5 bg-slate-50/40">
              <div className="p-4 rounded-xl border border-border-subtle bg-surface-elevated space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink-subtle">Ví điện tử</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      user.wallet_activated
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-ink-subtle border border-border-subtle"
                    }`}
                  >
                    {user.wallet_status_label ||
                      (user.wallet_activated ? "Đã kích hoạt" : "Chưa kích hoạt")}
                  </span>
                </div>

                {user.wallet_activated && user.wallet ? (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-xs text-ink-subtle block">Số dư khả dụng</span>
                      <span className="text-base font-bold text-brand-primary">
                        {formatCurrencyVnd(user.wallet.balance)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-ink-subtle block">Đang tạm giữ</span>
                      <span className="text-sm font-semibold text-ink-primary">
                        {formatCurrencyVnd(user.wallet.locked_balance)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-ink-subtle">
                    Người dùng chưa phát sinh bản ghi ví trong hệ thống.
                  </p>
                )}
              </div>

              {user.role === "provider" && user.provider_profile && (
                <div className="p-4 rounded-xl border border-border-subtle bg-surface-elevated space-y-2">
                  <span className="text-xs font-semibold text-ink-subtle block">
                    Hồ sơ Nhà cung cấp
                  </span>
                  <div className="text-sm font-bold text-ink-primary">
                    {user.provider_profile.business_name}
                  </div>
                  <div className="text-xs text-ink-body">
                    Người đại diện: {user.provider_profile.representative_name || "--"}
                  </div>
                  <div className="text-xs text-ink-subtle">
                    Loại hình: {user.provider_profile.business_type || "Chưa cập nhật"}
                  </div>
                  {user.provider_profile.address && (
                    <div className="text-xs text-ink-subtle">
                      Địa chỉ: {user.provider_profile.address}
                    </div>
                  )}
                  <div className="text-xs text-ink-primary font-medium pt-1">
                    Tổng dịch vụ đã tạo: {user.services_count ?? 0}
                  </div>
                </div>
              )}

              {user.role === "tourist" && (
                <div className="p-4 rounded-xl border border-border-subtle bg-surface-elevated space-y-2">
                  <span className="text-xs font-semibold text-ink-subtle block">
                    Hồ sơ Khách du lịch
                  </span>
                  <div className="text-xs text-ink-body">
                    Giới tính: {user.tourist_profile?.gender || "Chưa cập nhật"}
                  </div>
                  <div className="text-xs text-ink-body">
                    Ngày sinh: {user.tourist_profile?.date_of_birth || "Chưa cập nhật"}
                  </div>
                  <div className="text-xs text-ink-primary font-medium pt-1">
                    Tổng đơn đặt chỗ: {user.bookings_count ?? 0}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {!isLoadingDetail && user && (
          <div className="px-6 py-4 border-t border-border-subtle bg-slate-50 flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-body text-sm font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {user.status !== "banned" ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenBan?.(user)}
                className="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-status-danger border border-rose-200 text-sm font-semibold transition-colors cursor-pointer"
              >
                Khóa tài khoản
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onUnban?.(user.id)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Mở khóa tài khoản
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
