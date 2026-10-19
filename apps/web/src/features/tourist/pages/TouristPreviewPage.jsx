import React, { useState } from "react";
import { Compass, Ticket, Users, User } from "lucide-react";
import PortalShell from "../../../layouts/PortalShell";
import Typography from "../../../components/ui/Typography";
import { useAuth } from "../../../hooks/useAuth";

const TOURIST_NAV = [
  { id: "explore", label: "Khám phá điểm đến", icon: Compass },
  { id: "bookings", label: "Vé & Lịch trình của tôi", icon: Ticket },
  { id: "social", label: "Bảng tin cộng đồng", icon: Users },
  { id: "profile", label: "Hồ sơ cá nhân", icon: User },
];

export default function TouristPreviewPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("explore");

  return (
    <PortalShell
      portalTitle="Không gian Du khách"
      portalBadge="Khách du lịch (Tourist)"
      navItems={TOURIST_NAV}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
    >
      <div className="bg-surface-elevated border border-border-subtle rounded-xl p-6 lg:p-8">
        <Typography variant="h1" className="mb-2">
          Xin chào, {user?.name || "Du khách"}!
        </Typography>
        <Typography variant="body" className="text-ink-subtle max-w-2xl mb-6">
          Tài khoản Khách du lịch của bạn đã được xác thực và đồng bộ thành công với cơ sở dữ liệu.
          Trải nghiệm đầy đủ gồm lướt bảng Feed, đặt tour, ví điện tử và hiển thị mã QR Check-in
          hiện đã sẵn sàng trên ứng dụng di động (`@stb/mobile`), và không gian Web này sẽ tiếp tục
          được mở rộng.
        </Typography>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-subtle pt-6">
          <div className="p-4 rounded-lg bg-surface-base border border-border-subtle">
            <Typography variant="caption" className="block mb-1">
              Định danh Mạng xã hội
            </Typography>
            <Typography variant="body-sm" className="font-semibold text-ink-primary">
              @{user?.social_profile?.username || "traveler"}
            </Typography>
          </div>

          <div className="p-4 rounded-lg bg-surface-base border border-border-subtle">
            <Typography variant="caption" className="block mb-1">
              Số dư Ví du lịch
            </Typography>
            <Typography variant="body-sm" className="font-semibold text-status-success">
              {Number(user?.wallet?.balance || 0).toLocaleString("vi-VN")}{" "}
              {user?.wallet?.currency || "VND"}
            </Typography>
          </div>

          <div className="p-4 rounded-lg bg-surface-base border border-border-subtle">
            <Typography variant="caption" className="block mb-1">
              Trạng thái tài khoản
            </Typography>
            <Typography variant="body-sm" className="font-semibold text-brand-primary">
              Đang hoạt động ({user?.role})
            </Typography>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
