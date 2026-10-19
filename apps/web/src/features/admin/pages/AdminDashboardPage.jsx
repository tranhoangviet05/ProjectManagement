import React, { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldAlert,
  TicketPercent,
  CheckCircle2,
  Clock,
} from "lucide-react";
import PortalShell from "../../../layouts/PortalShell";
import Typography from "../../../components/ui/Typography";
import { useAuth } from "../../../hooks/useAuth";

const ADMIN_NAV = [
  { id: "overview", label: "Tổng quan vận hành", icon: LayoutDashboard },
  { id: "providers", label: "Kiểm duyệt Nhà cung cấp", icon: Building2, badge: "4" },
  { id: "users", label: "Quản lý tài khoản", icon: Users },
  { id: "coupons", label: "Mã ưu đãi toàn sàn", icon: TicketPercent },
  { id: "reports", label: "Báo cáo cộng đồng", icon: ShieldAlert, badge: "2" },
];

const PENDING_PROVIDERS = [
  {
    id: 1,
    businessName: "Hội An Heritage Boat & Homestay",
    owner: "Nguyễn Minh Tâm",
    type: "Tour sông Hoài & Lưu trú",
    submittedAt: "Hôm nay, 09:40",
    status: "Chờ kiểm duyệt",
  },
  {
    id: 2,
    businessName: "Phú Quốc Coral Diving Center",
    owner: "Lê Quốc Bảo",
    type: "Tour lặn biển & Cano",
    submittedAt: "Hôm qua, 16:15",
    status: "Chờ kiểm duyệt",
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <PortalShell
      portalTitle="Trung tâm Quản trị"
      portalBadge="Quản trị viên (Admin)"
      navItems={ADMIN_NAV}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
    >
      <div className="mb-8">
        <Typography variant="h1">Chào mừng trở lại, {user?.name || "Quản trị viên"}</Typography>
        <Typography variant="body-sm" className="text-ink-subtle mt-1">
          Giám sát hoạt động đặt dịch vụ, kiểm duyệt đối tác lữ hành và điều tiết nội dung mạng xã
          hội.
        </Typography>
      </div>

      {/* Chỉ số vận hành cấu trúc phẳng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-border-subtle rounded-xl bg-surface-elevated divide-y sm:divide-y-0 sm:divide-x divide-border-subtle mb-8">
        <div className="p-5">
          <Typography variant="caption" className="block mb-1">
            Đối tác chờ duyệt
          </Typography>
          <Typography variant="h1" className="text-brand-primary">
            04
          </Typography>
          <Typography variant="caption" className="text-amber-600 mt-1 block">
            2 hồ sơ gửi mới trong ngày
          </Typography>
        </div>

        <div className="p-5">
          <Typography variant="caption" className="block mb-1">
            Tổng đơn đặt chỗ tuần này
          </Typography>
          <Typography variant="h1">128</Typography>
          <Typography variant="caption" className="text-status-success mt-1 block">
            94% đã đối soát SePay
          </Typography>
        </div>

        <div className="p-5">
          <Typography variant="caption" className="block mb-1">
            Bài viết trải nghiệm mới
          </Typography>
          <Typography variant="h1">342</Typography>
          <Typography variant="caption" className="mt-1 block">
            68 bài gắn liên kết Affiliate
          </Typography>
        </div>

        <div className="p-5">
          <Typography variant="caption" className="block mb-1">
            Báo cáo vi phạm cần xử lý
          </Typography>
          <Typography variant="h1" className="text-status-danger">
            02
          </Typography>
          <Typography variant="caption" className="mt-1 block">
            Thuộc phân hệ bình luận MXH
          </Typography>
        </div>
      </div>

      {/* Danh sách đối tác chờ phê duyệt */}
      <section className="bg-surface-elevated border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <Typography variant="h3">Hồ sơ Nhà cung cấp chờ phê duyệt</Typography>
            <Typography variant="caption">
              Xác minh giấy phép lữ hành trước khi cho phép mở bán dịch vụ
            </Typography>
          </div>
        </div>

        <div className="divide-y divide-border-subtle">
          {PENDING_PROVIDERS.map((item) => (
            <div
              key={item.id}
              className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <Typography variant="body" className="font-semibold text-ink-primary">
                  {item.businessName}
                </Typography>
                <Typography variant="caption" className="block mt-0.5">
                  Đại diện: {item.owner} · Loại hình: {item.type} · Gửi lúc: {item.submittedAt}
                </Typography>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.status}</span>
                </span>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Phê duyệt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
