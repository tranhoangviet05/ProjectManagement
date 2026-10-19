import React, { useState } from "react";
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  QrCode,
  Wallet,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import PortalShell from "../../../layouts/PortalShell";
import Typography from "../../../components/ui/Typography";
import { useAuth } from "../../../hooks/useAuth";

const PROVIDER_NAV = [
  { id: "overview", label: "Bảng điều hành đối tác", icon: LayoutDashboard },
  { id: "services", label: "Tour & Hạng phòng", icon: Compass, badge: "6" },
  { id: "bookings", label: "Đơn đặt chỗ của khách", icon: CalendarCheck, badge: "12" },
  { id: "qr-checkin", label: "Đối soát vé QR Check-in", icon: QrCode },
  { id: "wallet", label: "Ví doanh thu & Quyết toán", icon: Wallet },
  { id: "reviews", label: "Đánh giá từ du khách", icon: MessageSquare },
];

const UPCOMING_BOOKINGS = [
  {
    code: "STB-20261019-8492",
    guestName: "Lê Hoàng Nam",
    serviceName: "Tour Lặn Ngắm San Hô Bán Đảo Sơn Trà (1 Ngày)",
    checkInDate: "20/10/2026",
    guests: "4 người lớn",
    totalAmount: "3.200.000 ₫",
    status: "Đã thanh toán (Chờ quét QR)",
  },
  {
    code: "STB-20261019-9104",
    guestName: "Phạm Minh Anh",
    serviceName: "Phòng Deluxe Ocean View - 2 Đêm",
    checkInDate: "21/10/2026",
    guests: "2 người lớn, 1 trẻ em",
    totalAmount: "4.500.000 ₫",
    status: "Đã xác nhận",
  },
];

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [qrTokenInput, setQrTokenInput] = useState("");
  const [qrFeedback, setQrFeedback] = useState("");

  const businessName = user?.provider_profile?.business_name || `${user?.name} Travel`;

  const handleSimulateQrVerify = (e) => {
    e.preventDefault();
    if (!qrTokenInput.trim()) return;
    setQrFeedback(
      `Đã xác thực mã check-in "${qrTokenInput.trim()}". Trạng thái đơn đã chuyển sang Đang phục vụ (ongoing).`,
    );
    setQrTokenInput("");
  };

  return (
    <PortalShell
      portalTitle="Cổng Đối tác Lữ hành"
      portalBadge="Nhà cung cấp (Provider)"
      navItems={PROVIDER_NAV}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h1">{businessName}</Typography>
          <Typography variant="body-sm" className="text-ink-subtle mt-1">
            Quản lý lịch trình tour, tồn kho hạng phòng khách sạn/homestay và xác thực mã QR của du
            khách.
          </Typography>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-status-success self-start">
          <CheckCircle2 className="w-4 h-4" />
          <span>Đối tác đã xác minh</span>
        </span>
      </div>

      {/* Chỉ số kinh doanh của Provider */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-border-subtle rounded-xl bg-surface-elevated divide-y sm:divide-y-0 sm:divide-x divide-border-subtle mb-8">
        <div className="p-5">
          <Typography variant="caption" className="block mb-1">
            Đơn đặt chờ đón khách hôm nay
          </Typography>
          <Typography variant="h1" className="text-brand-primary">
            12 đơn
          </Typography>
          <Typography variant="caption" className="mt-1 block">
            Sẵn sàng quét mã QR Check-in
          </Typography>
        </div>

        <div className="p-5">
          <Typography variant="caption" className="block mb-1">
            Dịch vụ & Hạng phòng đang mở
          </Typography>
          <Typography variant="h1">06</Typography>
          <Typography variant="caption" className="mt-1 block">
            4 Tour trọn gói · 2 Homestay
          </Typography>
        </div>

        <div className="p-5">
          <Typography variant="caption" className="block mb-1">
            Doanh thu khả dụng trong ví
          </Typography>
          <Typography variant="h1" className="text-status-success">
            {Number(user?.wallet?.balance || 45800000).toLocaleString("vi-VN")} ₫
          </Typography>
          <Typography variant="caption" className="mt-1 block">
            Tự động quyết toán sau khi khách hoàn tất
          </Typography>
        </div>
      </div>

      {/* Trạm kiểm tra nhanh QR Check-in trên Web */}
      <section className="bg-surface-elevated border border-border-subtle rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <QrCode className="w-5 h-5 text-brand-primary" />
          <Typography variant="h3">Tra cứu & Xác thực nhanh Mã QR Check-in</Typography>
        </div>
        <Typography variant="body-sm" className="text-ink-subtle mb-4">
          Nhập mã token vé (`qr_checkin_token`) hoặc dùng camera trên ứng dụng Mobile Provider để
          xác nhận khách đã có mặt tại điểm đón.
        </Typography>

        <form onSubmit={handleSimulateQrVerify} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={qrTokenInput}
            onChange={(e) => setQrTokenInput(e.target.value)}
            placeholder="Nhập mã vé hoặc QR token (ví dụ: STB-20261019-8492)..."
            className="flex-1 px-3.5 py-2.5 rounded-lg border border-border-subtle text-sm text-ink-primary"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold cursor-pointer"
          >
            Xác nhận khách nhận chỗ
          </button>
        </form>

        {qrFeedback && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
            {qrFeedback}
          </div>
        )}
      </section>

      {/* Danh sách đơn đặt chỗ sắp khởi hành */}
      <section className="bg-surface-elevated border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle">
          <Typography variant="h3">Đơn đặt chỗ sắp khởi hành</Typography>
        </div>

        <div className="divide-y divide-border-subtle">
          {UPCOMING_BOOKINGS.map((bk) => (
            <div
              key={bk.code}
              className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-muted border border-border-subtle text-xs font-mono font-semibold text-ink-primary">
                    {bk.code}
                  </span>
                  <Typography variant="body" className="font-semibold text-ink-primary">
                    {bk.serviceName}
                  </Typography>
                </div>
                <Typography variant="caption" className="block mt-1">
                  Khách hàng: {bk.guestName} ({bk.guests}) · Ngày nhận chỗ: {bk.checkInDate}
                </Typography>
              </div>

              <div className="flex items-center gap-3">
                <Typography variant="body-sm" className="font-bold text-ink-primary">
                  {bk.totalAmount}
                </Typography>
                <span className="px-2.5 py-1 rounded-full bg-brand-light text-brand-hover text-xs font-semibold">
                  {bk.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
