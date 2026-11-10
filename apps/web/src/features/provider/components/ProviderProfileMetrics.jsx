import React from "react";
import { Wallet, Building2, ShieldCheck } from "lucide-react";
import Typography from "../../../components/ui/Typography";

/**
 * Component hiển thị hàng chỉ số tổng quan hồ sơ đối tác (Metrics Cards)
 * - Số dư ví Travel (hoặc trạng thái chưa kích hoạt)
 * - Mã đối tác hệ thống (STB-PRV-xxx)
 * - Email đăng nhập và trạng thái bảo mật
 */
export default function ProviderProfileMetrics({ user, onNavigateWalletTab }) {
  const isWalletActive = Boolean(user?.wallet);
  const walletBalance = Number(user?.wallet?.balance || 0);
  const providerCode = `STB-PRV-${user?.provider_profile?.id || user?.id || "8821"}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 border border-border-subtle rounded-xl bg-surface-elevated divide-y sm:divide-y-0 sm:divide-x divide-border-subtle mb-8 shadow-2xs">
      {/* 1. Số dư ví hoặc trạng thái kích hoạt ví */}
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
            {isWalletActive ? "Số dư khả dụng trong ví" : "Ví Travel đối tác"}
          </Typography>

          {isWalletActive ? (
            <Typography variant="h2" className="text-status-success font-bold truncate">
              {walletBalance.toLocaleString("vi-VN")} ₫
            </Typography>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-amber-600">Chưa kích hoạt ví</span>
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

          <Typography variant="caption" className="mt-1 block text-ink-subtle">
            {isWalletActive
              ? "Ví nội bộ SePay · Tự động giải ngân"
              : "Cần kích hoạt để nhận thanh toán SePay"}
          </Typography>
        </div>
      </div>

      {/* 2. Mã đối tác hệ thống */}
      <div className="p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-blue-50 text-brand-primary shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <Typography variant="caption" className="block mb-0.5">
            Mã đối tác hệ thống
          </Typography>
          <Typography variant="h2" className="font-mono text-ink-primary font-bold">
            {providerCode}
          </Typography>
          <Typography variant="caption" className="mt-1 block text-ink-subtle truncate">
            Vai trò: Nhà cung cấp dịch vụ
          </Typography>
        </div>
      </div>

      {/* 3. Email tài khoản đăng nhập */}
      <div className="p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-slate-100 text-ink-body shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <Typography variant="caption" className="block mb-0.5">
            Email tài khoản đăng nhập
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
