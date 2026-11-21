import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useAuth } from "../../../hooks/useAuth";
import adminDashboardApi from "../services/adminDashboardApi";
import AdminMetricChartCard from "../components/AdminMetricChartCard";
import AdminPlatformBreakdownCard from "../components/AdminPlatformBreakdownCard";
import { formatCurrencyVnd } from "../../provider/models/serviceFormModel";

/**
 * Screen Orchestrator: Trang Tổng quan vận hành Admin (Route: /admin/dashboard)
 * Hiển thị KPI tổng thể, 4 biểu đồ biến động có bộ lọc Ngày/Tháng/Năm riêng, cơ cấu sàn và tác vụ gần đây.
 */
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState({
    kpis: {
      pending_providers_count: 0,
      approved_providers_count: 0,
      pending_services_count: 0,
      active_services_count: 0,
      total_users_count: 0,
      tourists_count: 0,
      providers_count: 0,
      total_bookings_count: 0,
      confirmed_bookings_count: 0,
      pending_bookings_count: 0,
      cancelled_bookings_count: 0,
      total_gmv: 0,
      total_posts_count: 0,
      pending_reports_count: 0,
      active_coupons_count: 0,
    },
    service_breakdown: { tour: 0, hotel: 0, homestay: 0, vehicle: 0 },
    charts: { gmv: null, bookings: null, users: null, posts: null },
    recent_pending_providers: [],
    recent_pending_services: [],
    recent_bookings: [],
  });

  useEffect(() => {
    let mounted = true;
    adminDashboardApi
      .getOverview()
      .then((res) => {
        if (mounted && res?.data) {
          setOverview(res.data);
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const kpis = overview.kpis || {};
  const charts = overview.charts || {};

  return (
    <AdminLayout pendingCount={kpis.pending_providers_count}>
      <div className="space-y-8">
        <div>
          <Typography variant="h1">Chào mừng trở lại, Quản Trị Viên</Typography>
          <Typography variant="body-sm" className="text-ink-subtle mt-1">
            Tổng quan toàn diện về doanh thu, tăng trưởng người dùng, lượng đơn đặt chỗ, bài đăng
            cộng đồng và kiểm duyệt trên sàn.
          </Typography>
        </div>

        {/* 1. Lưới 6 chỉ số KPI cốt lõi toàn sàn */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28" rounded="rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-border-subtle rounded-xl bg-surface-elevated divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
            <div
              onClick={() => navigate("/admin/bookings?status=all&payment_status=all")}
              className="p-5 cursor-pointer hover:bg-slate-50/80 transition-colors group border-b border-border-subtle"
            >
              <Typography variant="caption" className="block mb-1 group-hover:text-brand-primary">
                Tổng doanh thu toàn sàn (GMV)
              </Typography>
              <Typography variant="h2" className="text-emerald-700 font-bold">
                {formatCurrencyVnd(kpis.total_gmv || 0)}
              </Typography>
              <Typography variant="caption" className="text-ink-subtle mt-1 block">
                {kpis.confirmed_bookings_count || 0} đơn đã xác nhận / hoàn tất
              </Typography>
            </div>

            <div
              onClick={() => navigate("/admin/bookings?status=all&payment_status=all")}
              className="p-5 cursor-pointer hover:bg-slate-50/80 transition-colors group border-b border-border-subtle"
            >
              <Typography variant="caption" className="block mb-1 group-hover:text-brand-primary">
                Tổng đơn đặt chỗ
              </Typography>
              <Typography variant="h1" className="text-ink-primary">
                {String(kpis.total_bookings_count || 0).padStart(2, "0")}
              </Typography>
              <Typography variant="caption" className="text-ink-subtle mt-1 block">
                {kpis.pending_bookings_count || 0} chờ thanh toán •{" "}
                {kpis.cancelled_bookings_count || 0} đã hủy
              </Typography>
            </div>

            <div
              onClick={() => navigate("/admin/users?role=all&status=all")}
              className="p-5 cursor-pointer hover:bg-slate-50/80 transition-colors group border-b border-border-subtle"
            >
              <Typography variant="caption" className="block mb-1 group-hover:text-brand-primary">
                Tài khoản người dùng
              </Typography>
              <Typography variant="h1" className="text-ink-primary">
                {String(kpis.total_users_count || 0).padStart(2, "0")}
              </Typography>
              <Typography variant="caption" className="text-ink-subtle mt-1 block">
                {kpis.tourists_count || 0} Khách du lịch • {kpis.providers_count || 0} Nhà cung cấp
              </Typography>
            </div>

            <div
              onClick={() => navigate("/admin/services?status=pending_review&type=all")}
              className="p-5 cursor-pointer hover:bg-slate-50/80 transition-colors group"
            >
              <Typography variant="caption" className="block mb-1 group-hover:text-brand-primary">
                Dịch vụ trên sàn
              </Typography>
              <Typography variant="h1" className="text-brand-primary">
                {String(kpis.active_services_count || 0).padStart(2, "0")}
              </Typography>
              <Typography variant="caption" className="text-amber-600 mt-1 block">
                {kpis.pending_services_count || 0} dịch vụ đang chờ kiểm duyệt
              </Typography>
            </div>

            <div
              onClick={() => navigate("/admin/providers?status=pending")}
              className="p-5 cursor-pointer hover:bg-slate-50/80 transition-colors group"
            >
              <Typography variant="caption" className="block mb-1 group-hover:text-brand-primary">
                Hồ sơ KYC Đối tác
              </Typography>
              <Typography variant="h1" className="text-amber-600">
                {String(kpis.pending_providers_count || 0).padStart(2, "0")}
              </Typography>
              <Typography variant="caption" className="text-ink-subtle mt-1 block">
                Chờ thẩm định • {kpis.approved_providers_count || 0} đối tác đã duyệt
              </Typography>
            </div>

            <div
              onClick={() => navigate("/admin/reports?status=pending&type=all")}
              className="p-5 cursor-pointer hover:bg-slate-50/80 transition-colors group"
            >
              <Typography variant="caption" className="block mb-1 group-hover:text-brand-primary">
                Bài đăng & Cộng đồng
              </Typography>
              <Typography variant="h1" className="text-ink-primary">
                {String(kpis.total_posts_count || 0).padStart(2, "0")}
              </Typography>
              <Typography variant="caption" className="text-rose-600 mt-1 block">
                {kpis.pending_reports_count || 0} báo cáo vi phạm chờ xử lý
              </Typography>
            </div>
          </div>
        )}

        {/* 2. Hệ thống 4 Biểu đồ Biến động (Mỗi biểu đồ có bộ lọc Ngày / Tháng / Năm riêng) */}
        <div className="space-y-3">
          <div>
            <Typography variant="h2" className="text-lg sm:text-xl font-bold text-ink-primary">
              Biểu đồ Biến động & Tăng trưởng Toàn sàn
            </Typography>
            <Typography variant="caption" className="text-ink-subtle">
              Tùy chỉnh bộ lọc Ngày, Tháng, Năm trên từng biểu đồ để đối chiếu tốc độ tăng trưởng so
              với kỳ trước.
            </Typography>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AdminMetricChartCard
              metric="gmv"
              title="Biểu đồ Doanh thu toàn sàn (GMV)"
              subtitle="Tổng giá trị đơn đặt chỗ hợp lệ theo thời gian"
              isCurrency={true}
              accentColor="bg-emerald-600"
              accentHover="group-hover:bg-emerald-700"
              initialData={charts.gmv}
            />

            <AdminMetricChartCard
              metric="bookings"
              title="Biểu đồ Lượng đơn đặt chỗ mới"
              subtitle="Số lượng đơn đặt tour và phòng lưu trú phát sinh"
              unit="đơn"
              accentColor="bg-brand-primary"
              accentHover="group-hover:bg-brand-hover"
              initialData={charts.bookings}
            />

            <AdminMetricChartCard
              metric="users"
              title="Biểu đồ Người dùng đăng ký mới"
              subtitle="Số lượng Khách du lịch & Nhà cung cấp gia nhập sàn"
              unit="tài khoản"
              accentColor="bg-teal-600"
              accentHover="group-hover:bg-teal-700"
              initialData={charts.users}
            />

            <AdminMetricChartCard
              metric="posts"
              title="Biểu đồ Bài đăng cộng đồng mới"
              subtitle="Lượng bài viết chia sẻ trải nghiệm du lịch trên bảng tin"
              unit="bài viết"
              accentColor="bg-orange-500"
              accentHover="group-hover:bg-orange-600"
              initialData={charts.posts}
            />
          </div>
        </div>

        {/* 3. Cơ cấu Dịch vụ & Trạng thái Đơn hàng */}
        <AdminPlatformBreakdownCard serviceBreakdown={overview.service_breakdown} kpis={kpis} />

        {/* 4. Danh sách tác vụ cần xử lý & Đơn đặt chỗ gần đây */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
              <Typography variant="h3" className="text-base font-bold text-ink-primary">
                Dịch vụ chờ kiểm duyệt gần đây
              </Typography>
              <button
                type="button"
                onClick={() => navigate("/admin/services?status=pending_review&type=all")}
                className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            <div className="divide-y divide-border-subtle">
              {isLoading ? (
                <div className="p-5 space-y-3">
                  <Skeleton className="h-10 w-full" rounded="rounded-lg" />
                  <Skeleton className="h-10 w-full" rounded="rounded-lg" />
                </div>
              ) : overview.recent_pending_services.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-subtle">
                  Không có dịch vụ nào đang chờ duyệt.
                </div>
              ) : (
                overview.recent_pending_services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => navigate("/admin/services?status=pending_review&type=all")}
                    className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink-primary truncate">
                        {svc.name}
                      </div>
                      <div className="text-xs text-ink-subtle">{svc.provider_name}</div>
                    </div>
                    <div className="text-xs font-semibold text-brand-primary shrink-0">
                      {formatCurrencyVnd(svc.base_price)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
              <Typography variant="h3" className="text-base font-bold text-ink-primary">
                Đơn đặt chỗ gần đây
              </Typography>
              <button
                type="button"
                onClick={() => navigate("/admin/bookings?status=all&payment_status=all")}
                className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
              >
                Xem đối soát
              </button>
            </div>

            <div className="divide-y divide-border-subtle">
              {isLoading ? (
                <div className="p-5 space-y-3">
                  <Skeleton className="h-10 w-full" rounded="rounded-lg" />
                  <Skeleton className="h-10 w-full" rounded="rounded-lg" />
                </div>
              ) : overview.recent_bookings.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-subtle">
                  Chưa phát sinh đơn đặt chỗ nào trên hệ thống.
                </div>
              ) : (
                overview.recent_bookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() =>
                      navigate(`/admin/bookings?status=all&payment_status=all&q=${b.booking_code}`)
                    }
                    className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink-primary truncate">
                        <span className="font-mono">{b.booking_code}</span> - {b.contact_name}
                      </div>
                      <div className="text-xs text-ink-subtle truncate">{b.service_name}</div>
                    </div>
                    <div className="text-xs font-semibold text-emerald-700 shrink-0">
                      {formatCurrencyVnd(b.total_amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
