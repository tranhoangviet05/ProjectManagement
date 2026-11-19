import React from "react";
import { Wallet, Building2, ShieldCheck, CheckCircle2 } from "lucide-react";
import Typography from "../../../components/ui/Typography";

/**
 * Component hiển thị hàng chỉ số tổng quan hồ sơ đối tác
 * Sử dụng từ ngữ trang nhã, chuẩn mực, phù hợp giao diện người dùng
 */
export default function ProviderProfileMetrics({ user, onNavigateWalletTab }) {
  const isWalletActive = Boolean(
    user?.wallet &&
    user.wallet.is_activated !== false &&
    (user.wallet.wallet_id || user.wallet.id || user.wallet.balance !== undefined),
  );

  const providerCode = `STB-PRV-${user?.provider_profile?.id || user?.id || "8821"}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 border border-border-subtle rounded-xl bg-surface-elevated divide-y sm:divide-y-0 sm:divide-x divide-border-subtle mb-8 shadow-2xs">
      {/* 1. Trạng thái ví thanh toán nội bộ */}
      <div className="p-5 flex items-start gap-4">
        <div
          className={`p-2.5 rounded-lg shrink-0 ${
            isWalletActive ? "bg-emerald-50 text-status-success" : "bg-amber-50 text-amber-600"
          }`}
        >
          <Wallet className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <Typography variant="caption" className="block mb-0.5">
            Ví thanh toán nội bộ
          </Typography>

          {isWalletActive ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
              <Typography variant="body" className="font-bold text-status-success">
                Đang hoạt động
              </Typography>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-amber-600">Chưa kích hoạt</span>
              {onNavigateWalletTab && (
                <button
                  type="button"
                  onClick={onNavigateWalletTab}
                  className="text-xs text-brand-primary hover:underline font-semibold cursor-pointer"
                >
                  Kích hoạt ngay →
                </button>
              )}
            </div>
          )}

          <Typography variant="caption" className="mt-1.5 block text-ink-subtle">
            {isWalletActive
              ? "Sẵn sàng tiếp nhận doanh thu SePay"
              : "Cần kích hoạt để nhận thanh toán trực tuyến"}
          </Typography>
        </div>
      </div>

      {/* 2. Mã định danh đối tác */}
      <div className="p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-blue-50 text-brand-primary shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <Typography variant="caption" className="block mb-0.5">
            Mã định danh đối tác
          </Typography>
          <Typography variant="h2" className="font-mono text-ink-primary font-bold">
            {providerCode}
          </Typography>
          <Typography variant="caption" className="mt-1 block text-ink-subtle truncate">
            Đối tác cung cấp dịch vụ chính thức
          </Typography>
        </div>
      </div>

      {/* 3. Hộp thư tài khoản */}
      <div className="p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-slate-100 text-ink-body shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <Typography variant="caption" className="block mb-0.5">
            Hộp thư tài khoản
          </Typography>
          <Typography
            variant="body"
            className="font-semibold text-ink-primary truncate"
            title={user?.email}
          >
            {user?.email || "partner@socialtravel.vn"}
          </Typography>
          <span className="inline-block mt-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Đã xác thực định danh
          </span>
        </div>
      </div>
    </div>
  );
}
