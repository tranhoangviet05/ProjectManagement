import React, { useState } from "react";
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  CheckCheck,
  CreditCard,
} from "lucide-react";
import Typography from "../../../components/ui/Typography";

/**
 * Component Tab "Ví Travel" (Ví nội bộ ứng dụng)
 * - Cơ chế thanh toán SePay: Tourist thanh toán online vào tài khoản Admin
 * - Doanh thu hiển thị ở trạng thái "Số dư bị khóa" (locked_balance)
 * - Khi Tourist nhận phòng/trải nghiệm xong (QR check-in), tiền tự động chuyển sang "Số dư khả dụng" (balance)
 * - Kích hoạt ví tạo 1 hàng dữ liệu trong bảng wallets mà không cần liên kết ngân hàng thực tế.
 */
export default function ProviderWalletActivation({
  user,
  isActivating,
  onActivateWallet,
  feedback,
}) {
  const wallet = user?.wallet;
  const isActivated = Boolean(wallet && wallet.status === "active");

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleActivateSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!agreeTerms) {
      setLocalError("Vui lòng đánh dấu đồng ý với điều khoản sử dụng Ví Travel nội bộ.");
      return;
    }

    onActivateWallet?.({
      currency: "VND",
    });
  };

  const activeError = localError || (feedback?.type === "error" ? feedback.message : null);

  return (
    <div className="space-y-6">
      {/* Thông báo kết quả thao tác */}
      {feedback?.type === "success" && (
        <div className="p-4 rounded-lg text-sm font-medium flex items-start gap-3 bg-emerald-50 text-status-success border border-emerald-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{feedback.message}</span>
        </div>
      )}

      {activeError && (
        <div className="p-4 rounded-lg text-sm font-medium flex items-start gap-3 bg-rose-50 text-status-danger border border-rose-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{activeError}</span>
        </div>
      )}

      {/* TRƯỜNG HỢP 1: VÍ TRAVEL ĐÃ ĐƯỢC KÍCH HOẠT */}
      {isActivated ? (
        <div className="space-y-6">
          {/* Thẻ Ví Nội Bộ Doanh Nghiệp */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
                  <Wallet className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <Typography variant="body-sm" className="font-semibold text-white">
                    Ví Travel Nội Bộ (SePay Escrow)
                  </Typography>
                  <Typography variant="caption" className="text-slate-400 font-mono">
                    WAL-{wallet.id || "2026-PRV"}
                  </Typography>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ví đang hoạt động</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <Typography variant="caption" className="text-slate-300">
                    Số dư khả dụng (Đã hoàn tất phục vụ)
                  </Typography>
                </div>
                <Typography variant="display" className="text-emerald-400 font-bold">
                  {Number(wallet.balance || 0).toLocaleString("vi-VN")} ₫
                </Typography>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <Typography variant="caption" className="text-slate-300">
                    Số dư bị khóa (Chờ khách check-in)
                  </Typography>
                </div>
                <Typography variant="h2" className="text-amber-300 font-bold">
                  {Number(wallet.locked_balance || 0).toLocaleString("vi-VN")} ₫
                </Typography>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="text-slate-400">
                Chủ sở hữu:{" "}
                <strong className="text-white">
                  {user?.provider_profile?.representative_name || user?.name || "Nhà cung cấp"}
                </strong>
              </span>
              <span className="font-mono text-slate-400">Tiền tệ: {wallet.currency || "VND"}</span>
            </div>
          </div>

          {/* Sơ đồ quy trình thanh toán SePay & Giải ngân 3 bước */}
          <div className="p-5 rounded-xl border border-border-subtle bg-surface-elevated">
            <Typography variant="label" className="text-ink-primary block mb-3">
              Quy trình ghi nhận và giải ngân dòng tiền qua SePay
            </Typography>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-brand-primary block mb-1">
                  Bước 1: Thanh toán SePay
                </span>
                <p className="text-xs text-ink-body leading-relaxed">
                  Du khách quét mã QR SePay thanh toán online. Tiền được đối soát tự động vào tài
                  khoản quản trị hệ thống (Admin).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200/80">
                <span className="text-xs font-bold text-amber-700 block mb-1">
                  Bước 2: Ghi nhận số dư bị khóa
                </span>
                <p className="text-xs text-ink-body leading-relaxed">
                  Doanh thu đơn hàng lập tức được cộng vào <strong>Số dư bị khóa</strong> (
                  <code>locked_balance</code>) của Provider để đảm bảo giao dịch.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-xs font-bold text-status-success block mb-1">
                  Bước 3: Mở khóa khả dụng
                </span>
                <p className="text-xs text-ink-body leading-relaxed">
                  Khi khách nhận phòng hoặc xác thực QR check-in dịch vụ thành công, tiền tự động
                  chuyển sang <strong>Số dư khả dụng</strong> (<code>balance</code>).
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TRƯỜNG HỢP 2: VÍ CHƯA KÍCH HOẠT */
        <div className="space-y-6">
          {/* 1. Phần giới thiệu về Ví Travel nội bộ */}
          <div className="p-6 rounded-xl border border-border-subtle bg-surface-elevated space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <Typography variant="h2" className="text-ink-primary">
                  Giới thiệu về Ví Travel Đối Tác
                </Typography>
                <Typography variant="body-sm" className="text-ink-subtle mt-1 leading-relaxed">
                  Ví Travel là ví thanh toán nội bộ của nền tảng Social Travel Booking, được thiết
                  kế để đồng bộ tự động với cổng thanh toán online <strong>SePay</strong>.
                </Typography>
              </div>
            </div>

            {/* Các điểm cốt lõi của Ví Travel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-slate-50 border border-border-subtle">
                <CreditCard className="w-5 h-5 text-brand-primary mb-2" />
                <Typography variant="label" className="block text-ink-primary mb-1">
                  Thanh toán Online SePay
                </Typography>
                <Typography variant="caption" className="text-ink-subtle leading-relaxed">
                  Tiền du khách thanh toán chuyển thẳng về tài khoản Admin để bảo chứng giao dịch.
                </Typography>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-border-subtle">
                <Clock className="w-5 h-5 text-amber-600 mb-2" />
                <Typography variant="label" className="block text-ink-primary mb-1">
                  Số dư bị khóa ký quỹ
                </Typography>
                <Typography variant="caption" className="text-ink-subtle leading-relaxed">
                  Khi có đơn mới, tiền hiển thị ở trạng thái khóa để Provider chuẩn bị phòng/tour.
                </Typography>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-border-subtle">
                <ShieldCheck className="w-5 h-5 text-status-success mb-2" />
                <Typography variant="label" className="block text-ink-primary mb-1">
                  Mở khóa sau Check-in
                </Typography>
                <Typography variant="caption" className="text-ink-subtle leading-relaxed">
                  Chỉ khi du khách nhận phòng hoặc hoàn thành tour, tiền mới chuyển thành số dư khả
                  dụng.
                </Typography>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900 leading-relaxed">
              <strong>Lưu ý:</strong> Ví Travel hoạt động hoàn toàn nội bộ trong hệ thống để quản lý
              dòng tiền ký quỹ và đối soát booking, không yêu cầu liên kết tài khoản ngân hàng thực
              tế.
            </div>
          </div>

          {/* 2. Điều khoản và Nút Kích hoạt Ví */}
          <form
            onSubmit={handleActivateSubmit}
            className="p-6 rounded-xl border border-border-subtle bg-surface-elevated space-y-5"
          >
            <Typography variant="h3">Xác nhận kích hoạt Ví Travel</Typography>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border-subtle hover:bg-slate-50/70 transition-colors">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (localError) setLocalError("");
                }}
                className="w-4 h-4 mt-0.5 rounded border-border-subtle text-brand-primary focus:ring-brand-primary/20 cursor-pointer shrink-0"
              />
              <span className="text-xs text-ink-body leading-relaxed">
                Tôi đã hiểu cơ chế thanh toán SePay và đồng ý khởi tạo Ví Travel nội bộ để theo dõi
                số dư bị khóa và số dư khả dụng khi du khách đặt dịch vụ của cơ sở kinh doanh.
              </span>
            </label>

            <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-ink-subtle">
                Đơn vị tiền tệ mặc định: <strong>VNĐ (VND)</strong> · Miễn phí khởi tạo
              </span>

              <button
                type="submit"
                disabled={isActivating}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang kích hoạt ví...</span>
                  </>
                ) : (
                  <span>Kích hoạt Ví Travel</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
