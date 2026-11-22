import React from "react";
import Typography from "../../../components/ui/Typography";

const SERVICE_TYPES = [
  { key: "tour", label: "Tour du lịch & Trải nghiệm", barClass: "bg-brand-primary" },
  { key: "hotel", label: "Khách sạn & Khu nghỉ dưỡng", barClass: "bg-teal-600" },
  { key: "homestay", label: "Homestay & Villa", barClass: "bg-amber-500" },
  { key: "vehicle", label: "Phương tiện di chuyển", barClass: "bg-indigo-600" },
];

/**
 * Thẻ phân tích cơ cấu loại hình dịch vụ & tỷ trọng trạng thái đơn đặt chỗ trên sàn.
 */
export default function AdminPlatformBreakdownCard({ serviceBreakdown = {}, kpis = {} }) {
  const totalServices =
    (serviceBreakdown.tour || 0) +
    (serviceBreakdown.hotel || 0) +
    (serviceBreakdown.homestay || 0) +
    (serviceBreakdown.vehicle || 0);

  const totalBookings = Number(kpis.total_bookings_count || 0);
  const bookingSegments = [
    {
      label: "Đã xác nhận / Hoàn thành",
      count: Number(kpis.confirmed_bookings_count || 0),
      barClass: "bg-emerald-600",
    },
    {
      label: "Đang chờ thanh toán",
      count: Number(kpis.pending_bookings_count || 0),
      barClass: "bg-amber-500",
    },
    {
      label: "Đã hủy / Hoàn tiền",
      count: Number(kpis.cancelled_bookings_count || 0),
      barClass: "bg-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cơ cấu loại hình dịch vụ */}
      <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <Typography variant="h3" className="text-base font-bold text-ink-primary">
              Cơ cấu Dịch vụ theo Loại hình
            </Typography>
            <p className="text-xs text-ink-subtle mt-0.5">
              Phân bổ toàn bộ dịch vụ đã đăng ký trên hệ thống
            </p>
          </div>
          <span className="text-xs font-semibold text-ink-primary bg-slate-100 px-2.5 py-1 rounded-full">
            Tổng: {totalServices} dịch vụ
          </span>
        </div>

        <div className="space-y-3">
          {SERVICE_TYPES.map((item) => {
            const count = Number(serviceBreakdown[item.key] || 0);
            const pct = totalServices > 0 ? Math.round((count / totalServices) * 100) : 0;

            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-primary">{item.label}</span>
                  <span className="text-ink-subtle">
                    <strong className="text-ink-primary">{count}</strong> ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full ${item.barClass} transition-all`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tỷ trọng trạng thái đơn đặt chỗ */}
      <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <Typography variant="h3" className="text-base font-bold text-ink-primary">
              Tỷ trọng Trạng thái Đơn đặt chỗ
            </Typography>
            <p className="text-xs text-ink-subtle mt-0.5">
              Tình trạng chuyển đổi và hoàn tất đơn hàng toàn sàn
            </p>
          </div>
          <span className="text-xs font-semibold text-ink-primary bg-slate-100 px-2.5 py-1 rounded-full">
            Tổng: {totalBookings} đơn
          </span>
        </div>

        <div className="space-y-3">
          {bookingSegments.map((seg, idx) => {
            const pct = totalBookings > 0 ? Math.round((seg.count / totalBookings) * 100) : 0;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-primary">{seg.label}</span>
                  <span className="text-ink-subtle">
                    <strong className="text-ink-primary">{seg.count}</strong> ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full ${seg.barClass} transition-all`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
