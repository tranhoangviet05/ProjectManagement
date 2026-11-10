import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  QrCode,
  Wallet,
  MessageSquare,
  LogOut,
  Menu,
  X,
  BadgeCheck,
  Settings,
} from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { useAuth } from "../../../hooks/useAuth";

/**
 * Danh mục điều hướng chuẩn cho toàn bộ phân hệ Nhà cung cấp dịch vụ (Provider)
 */
const PROVIDER_NAV_LINKS = [
  {
    id: "dashboard",
    label: "Bảng điều hành đối tác",
    path: "/provider/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "services",
    label: "Tour & Hạng phòng",
    path: "/provider/services",
    icon: Compass,
    badge: "6",
  },
  {
    id: "bookings",
    label: "Đơn đặt chỗ của khách",
    path: "/provider/bookings",
    icon: CalendarCheck,
    badge: "12",
  },
  {
    id: "qr-checkin",
    label: "Đối soát vé QR Check-in",
    path: "/provider/qr-checkin",
    icon: QrCode,
  },
  {
    id: "wallet",
    label: "Ví doanh thu & Quyết toán",
    path: "/provider/wallet",
    icon: Wallet,
  },
  {
    id: "reviews",
    label: "Đánh giá từ du khách",
    path: "/provider/reviews",
    icon: MessageSquare,
  },
  {
    id: "profile",
    label: "Cài đặt hồ sơ",
    path: "/provider/profile",
    icon: Settings,
  },
];

/**
 * Component Thanh điều hướng bên trái (Sidebar) dùng chung cho toàn bộ phân hệ Provider:
 * - Tự động nhận diện và kích hoạt trạng thái Active theo URL pathname
 * - Hiển thị tên thương mại của Cơ sở du lịch và huy hiệu xác minh
 * - Hỗ trợ Responsive Drawer trên thiết bị di động / tablet
 * - Tích hợp thông tin tài khoản đối tác và nút Đăng xuất an toàn
 */
export default function ProviderSidebar({
  activeTab,
  onSelectTab,
  bookingBadge = "12",
  serviceBadge = "6",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Đóng mobile drawer khi thay đổi đường dẫn URL
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/auth", { replace: true });
    }
  };

  const businessName = user?.provider_profile?.business_name || user?.name || "Cơ sở Đối tác";

  const isLinkActive = (item) => {
    const current = location.pathname;
    // Hỗ trợ cả trường hợp dùng tab nội bộ (activeTab) hoặc route thực tế
    if (activeTab) {
      if (item.id === "dashboard" && activeTab === "overview") return true;
      if (item.id === activeTab) return true;
    }
    if (item.id === "dashboard") {
      return (
        current === "/provider" || current === "/provider/" || current === "/provider/dashboard"
      );
    }
    return current.startsWith(item.path);
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* 1. Header Thương hiệu cơ sở & Vai trò */}
        <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
          <Link to="/provider/dashboard" className="flex items-center gap-3 group min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-brand-hover transition-colors">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <Typography
                variant="h3"
                className="text-sm sm:text-base font-bold text-ink-primary truncate leading-tight group-hover:text-brand-primary transition-colors"
                title={businessName}
              >
                {businessName}
              </Typography>
              <div className="flex items-center gap-1 mt-0.5">
                <BadgeCheck className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span className="text-[11px] font-semibold text-brand-hover truncate">
                  Đối tác lữ hành
                </span>
              </div>
            </div>
          </Link>

          {/* Nút đóng drawer trên mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-ink-subtle hover:text-ink-primary hover:bg-slate-100"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Danh mục Menu điều hướng */}
        <nav className="p-3 space-y-1">
          <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-ink-subtle block mb-1">
            Quản trị dịch vụ
          </span>

          {PROVIDER_NAV_LINKS.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item);

            let dynamicBadge = item.badge;
            if (item.id === "bookings" && bookingBadge !== undefined) {
              dynamicBadge = bookingBadge;
            } else if (item.id === "services" && serviceBadge !== undefined) {
              dynamicBadge = serviceBadge;
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (onSelectTab) {
                    onSelectTab(item.id === "dashboard" ? "overview" : item.id);
                  }
                  if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-sm transition-all cursor-pointer text-left ${
                  active
                    ? "bg-brand-light/70 text-brand-hover font-bold shadow-xs border border-brand-primary/20"
                    : "text-ink-body hover:bg-slate-100/80 hover:text-ink-primary font-medium"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? "text-brand-primary" : "text-ink-subtle"
                    }`}
                  />
                  <span>{item.label}</span>
                </span>

                {/* Badge số lượng thông báo */}
                {Boolean(dynamicBadge && Number(dynamicBadge) > 0) && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                      active
                        ? "bg-brand-primary text-white"
                        : "bg-surface-elevated border border-border-subtle text-ink-primary"
                    }`}
                  >
                    {dynamicBadge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Footer: Thông tin đối tác & Đăng xuất */}
      <div className="p-4 border-t border-border-subtle bg-slate-50/70">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatar_url || user?.avatar ? (
            <img
              src={user.avatar_url || user.avatar}
              alt={businessName}
              className="w-9 h-9 rounded-full object-cover border border-brand-primary/25 shrink-0 shadow-2xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/20 flex items-center justify-center font-bold text-sm shrink-0">
              {(businessName || "P").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Typography variant="body-sm" className="font-semibold text-ink-primary truncate">
              {businessName}
            </Typography>
            <Typography variant="caption" className="text-xs text-ink-subtle truncate block">
              {user?.email || "partner@socialtravel.vn"}
            </Typography>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-rose-50 hover:text-status-danger hover:border-rose-200 text-xs font-semibold text-ink-body flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất khỏi phiên</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Nút Hamburger bật Sidebar trên Mobile */}
      <div className="lg:hidden w-full bg-surface-elevated border-b border-border-subtle px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-brand-primary text-white flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-ink-primary truncate max-w-[200px]">
            {businessName}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 rounded-lg border border-border-subtle text-ink-primary hover:bg-slate-100 cursor-pointer"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Overlay Mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-surface-elevated border-r border-border-subtle transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent()}
      </aside>

      {/* Sidebar Cố định trên Desktop */}
      <aside className="hidden lg:flex w-64 bg-surface-elevated border-r border-border-subtle flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        {renderNavContent()}
      </aside>
    </>
  );
}
