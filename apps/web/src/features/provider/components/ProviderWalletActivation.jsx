import React, { useState } from "react";
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import Typography from "../../../components/ui/Typography";

/**
 * Component Quản lý & Kích hoạt Ví thanh toán nội bộ
 * - Khi chưa kích hoạt: Giới thiệu cơ chế SePay, điều khoản & nút Kích hoạt ví.
 * - Khi đã kích hoạt: Hiển thị trạng thái hoạt động đơn giản trên nền trắng đồng bộ,
 *   kèm thông số vận hành và quy trình dòng tiền.
 */
export default function ProviderWalletActivation({
  user,
  isActivating,
  onActivateWallet,
  feedback,
}) {
  const wallet = user?.wallet;

  // Ví được xác định đã kích hoạt khi có bản ghi wallet và is_activated !== false
  const isActivated = Boolean(
    wallet &&
    wallet.is_activated !== false &&
    (wallet.wallet_id || wallet.id || wallet.balance !== undefined),
  );

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleActivateSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!agreeTerms) {
      setLocalError("Vui lòng đánh dấu đồng ý với quy chế vận hành Ví thanh toán nội bộ.");
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
        <div className="p-4 rounded-lg text-sm font-medium flex items-start gap-3 bg-emerald-50 text-status-success border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{feedback.message}</span>
        </div>
      )}

      {activeError && (
        <div className="p-4 rounded-lg text-sm font-medium flex items-start gap-3 bg-rose-50 text-status-danger border border-rose-200 shadow-2xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{activeError}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TRƯỜNG HỢP 1: VÍ THANH TOÁN ĐÃ ĐƯỢC KÍCH HOẠT THÀNH CÔNG       */}
      {/* ============================================================== */}
      {isActivated ? (
        <div className="space-y-6">
          {/* 1. Thẻ Trạng thái Ví đơn giản trên nền trắng đồng bộ */}
          <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-status-success flex items-center justify-center border border-emerald-200/80 shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <Typography
                  variant="label"
                  className="text-sm font-semibold text-ink-primary block"
                >
                  Ví thanh toán nội bộ
                </Typography>
                <Typography variant="caption" className="text-ink-subtle text-xs block mt-0.5">
                  Tài khoản phục vụ tiếp nhận và điều phối thanh toán trực tuyến qua cổng SePay
                </Typography>
              </div>
            </div>

            <div className="self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-status-success border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đang hoạt động</span>
              </span>
            </div>
          </div>

          {/* 2. Thông số vận hành & Cấu hình tài khoản */}
          <div className="bg-surface-elevated border border-border-subtle rounded-xl p-6 shadow-2xs">
            <Typography variant="h3" className="mb-4">
              Thông số vận hành & Cấu hình tài khoản
            </Typography>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-border-subtle">
                <div className="flex items-center gap-2 text-brand-primary font-semibold mb-1">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Cổng thanh toán tự động</span>
                </div>
                <p className="text-ink-body leading-relaxed text-xs">
                  Tích hợp cổng quét mã QR SePay liên ngân hàng 24/7. Du khách hoàn tất thanh toán
                  sẽ được hệ thống đối soát và tự động ghi nhận ngay lập tức.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-border-subtle">
                <div className="flex items-center gap-2 text-status-success font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Cơ chế bảo chứng dòng tiền</span>
                </div>
                <p className="text-ink-body leading-relaxed text-xs">
                  Doanh thu đặt chỗ được tạm giữ an toàn trong hệ thống và tự động giải ngân cho đơn
                  vị kinh doanh ngay sau khi du khách hoàn tất thủ tục nhận phòng hoặc dịch vụ tour.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-border-subtle">
                <span className="text-ink-subtle block mb-1">Phí dịch vụ nền tảng</span>
                <span className="font-semibold text-ink-primary text-sm">
                  0% (Ưu đãi đối tác tham gia nền tảng)
                </span>
                <p className="text-ink-subtle text-[11px] mt-1 leading-relaxed">
                  Toàn bộ số tiền du khách thanh toán cho dịch vụ được bảo lưu nguyên vẹn để đối tác
                  tiếp nhận.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-border-subtle">
                <span className="text-ink-subtle block mb-1">Phạm vi sử dụng</span>
                <span className="font-semibold text-ink-primary text-sm">
                  Nội bộ hệ thống Social Travel Booking
                </span>
                <p className="text-ink-subtle text-[11px] mt-1 leading-relaxed">
                  Ví được vận hành bảo mật khép kín, phục vụ việc đối soát và điều phối doanh thu
                  dịch vụ giữa khách hàng và đối tác.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Quy trình thanh toán & Luân chuyển dòng tiền */}
          <div className="bg-surface-elevated border border-border-subtle rounded-xl p-6 shadow-2xs">
            <Typography variant="h3" className="mb-2">
              Quy trình thanh toán và quyết toán doanh thu
            </Typography>
            <Typography variant="caption" className="text-ink-subtle block mb-5 leading-relaxed">
              Quy trình bảo vệ quyền lợi thanh toán song phương giữa du khách và đơn vị cung cấp
              dịch vụ được tự động hóa qua 3 bước:
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bước 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-border-subtle flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-full bg-brand-primary text-white font-bold text-xs flex items-center justify-center mb-3">
                    1
                  </div>
                  <Typography variant="label" className="text-ink-primary block mb-1.5">
                    Du khách đặt dịch vụ & Thanh toán
                  </Typography>
                  <p className="text-xs text-ink-body leading-relaxed">
                    Du khách quét mã QR để thanh toán đơn đặt tour hoặc phòng nghỉ. Khoản thanh toán
                    được tiếp nhận và đối soát tự động bởi Ban quản lý nền tảng.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] font-semibold text-brand-primary flex items-center gap-1">
                  <span>Trạng thái: Đã thanh toán</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Bước 2 */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                    2
                  </div>
                  <Typography variant="label" className="text-amber-950 block mb-1.5">
                    Ghi nhận doanh thu bảo chứng
                  </Typography>
                  <p className="text-xs text-amber-950/90 leading-relaxed">
                    Hệ thống ghi nhận khoản tiền vào tài khoản của quý đối tác ở trạng thái tạm giữ
                    an toàn, thông báo để đối tác chuẩn bị phục vụ du khách.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-200 text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                  <span>Trạng thái: Chờ đón khách</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Bước 3 */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-full bg-status-success text-white font-bold text-xs flex items-center justify-center mb-3">
                    3
                  </div>
                  <Typography variant="label" className="text-emerald-950 block mb-1.5">
                    Giải ngân doanh thu khả dụng
                  </Typography>
                  <p className="text-xs text-emerald-950/90 leading-relaxed">
                    Khi du khách có mặt và hoàn tất xác thực mã vé (QR Check-in), doanh thu sẽ tự
                    động được chuyển sang trạng thái khả dụng để đối tác quyết toán.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-200 text-[11px] font-semibold text-status-success flex items-center gap-1">
                  <span>Trạng thái: Sẵn sàng quyết toán</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* TRƯỜNG HỢP 2: VÍ CHƯA KÍCH HOẠT (HIỂN THỊ THIẾT LẬP KÍCH HOẠT)   */
        /* ============================================================== */
        <div className="space-y-6">
          {/* Giới thiệu về Ví thanh toán nội bộ */}
          <div className="p-6 rounded-xl border border-border-subtle bg-surface-elevated space-y-4 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <Typography variant="h2" className="text-ink-primary">
                  Kích hoạt Ví thanh toán dịch vụ
                </Typography>
                <Typography variant="body-sm" className="text-ink-subtle mt-1 leading-relaxed">
                  Ví thanh toán nội bộ là tài khoản chuyên dụng giúp quý đối tác quản lý và ghi nhận
                  doanh thu khi du khách thanh toán trực tuyến qua cổng SePay.
                </Typography>
              </div>
            </div>

            {/* Các điểm nổi bật */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-slate-50 border border-border-subtle">
                <CreditCard className="w-5 h-5 text-brand-primary mb-2" />
                <Typography variant="label" className="block text-ink-primary mb-1">
                  Thanh toán trực tuyến 24/7
                </Typography>
                <Typography variant="caption" className="text-ink-subtle leading-relaxed">
                  Du khách quét mã QR tiện lợi, hệ thống tự động xác nhận đơn đặt phòng/tour ngay
                  lập tức.
                </Typography>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-border-subtle">
                <ShieldCheck className="w-5 h-5 text-amber-600 mb-2" />
                <Typography variant="label" className="block text-ink-primary mb-1">
                  Bảo chứng giao dịch
                </Typography>
                <Typography variant="caption" className="text-ink-subtle leading-relaxed">
                  Dòng tiền được giữ an toàn trong suốt thời gian quý đối tác chuẩn bị đón tiếp
                  khách hàng.
                </Typography>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-border-subtle">
                <CheckCircle2 className="w-5 h-5 text-status-success mb-2" />
                <Typography variant="label" className="block text-ink-primary mb-1">
                  Giải ngân sau phục vụ
                </Typography>
                <Typography variant="caption" className="text-ink-subtle leading-relaxed">
                  Doanh thu tự động sẵn sàng quyết toán ngay khi khách hoàn tất thủ tục nhận phòng
                  hoặc dịch vụ.
                </Typography>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-200/80 text-xs text-sky-950 leading-relaxed">
              <strong>Lưu ý:</strong> Ví thanh toán hoạt động khép kín trong nền tảng Social Travel
              Booking nhằm phục vụ quản lý giao dịch và đối soát đặt chỗ, không yêu cầu thủ tục liên
              kết ngân hàng bên ngoài.
            </div>
          </div>

          {/* Form Cam kết & Kích hoạt */}
          <form
            onSubmit={handleActivateSubmit}
            className="p-6 rounded-xl border border-border-subtle bg-surface-elevated space-y-5 shadow-2xs"
          >
            <Typography variant="h3">Xác nhận kích hoạt Ví thanh toán</Typography>

            <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-lg border border-border-subtle hover:bg-slate-50/70 transition-colors">
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
                Tôi đã hiểu rõ quy trình vận hành và đồng ý kích hoạt Ví thanh toán nội bộ để ghi
                nhận doanh thu từ các dịch vụ du lịch trên nền tảng.
              </span>
            </label>

            <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-ink-subtle">
                Đơn vị tiền tệ: <strong>Việt Nam Đồng (VNĐ)</strong> · Miễn phí khởi tạo
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
                  <span>Kích hoạt Ví thanh toán ngay</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
