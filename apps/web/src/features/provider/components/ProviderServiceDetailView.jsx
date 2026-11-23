import React from "react";
import {
  ArrowLeft,
  BedDouble,
  Calendar,
  CheckCircle2,
  Edit3,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { SERVICE_STATUS_CONFIG, formatCurrencyVnd } from "../models/serviceFormModel";

const BOOKING_STATUS_LABELS = {
  pending_payment: { label: "Chờ thanh toán", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Đã xác nhận", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  checked_in: { label: "Đã check-in", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  completed: { label: "Hoàn thành", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  cancelled: { label: "Đã hủy", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  refunded: { label: "Đã hoàn tiền", cls: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function ProviderServiceDetailView({ service, onBack, onEdit }) {
  if (!service) return null;

  const statusInfo = SERVICE_STATUS_CONFIG[service.status] || SERVICE_STATUS_CONFIG.draft;
  const stats = service.sales_overview || {};
  const recentBookings = Array.isArray(stats.recent_bookings) ? stats.recent_bookings : [];
  const mediaList = Array.isArray(service.media) ? service.media : [];
  const roomTypes = Array.isArray(service.room_types) ? service.room_types : [];
  const schedules = Array.isArray(service.schedules) ? service.schedules : [];
  const policies = Array.isArray(service.policies) ? service.policies : [];
  const amenities = Array.isArray(service.amenities) ? service.amenities : [];
  const includes = Array.isArray(service.includes) ? service.includes : [];
  const excludes = Array.isArray(service.excludes) ? service.excludes : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-xs">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-surface-muted text-ink-primary hover:bg-brand-light hover:text-brand-primary transition-colors cursor-pointer"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}
              >
                {statusInfo.label}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-secondary-lagoon">
                {service.type}
              </span>
              {service.category?.name && (
                <span className="text-xs text-ink-subtle">· {service.category.name}</span>
              )}
            </div>
            <Typography variant="h2" className="text-ink-primary mt-1">
              {service.name}
            </Typography>
            <div className="flex items-center gap-1.5 text-xs text-ink-subtle mt-1">
              <MapPin className="w-3.5 h-3.5 text-brand-primary" />
              <span>
                {service.address}
                {service.location?.name ? `, ${service.location.name}` : ""}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onEdit(service)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-hover shadow-xs transition-colors cursor-pointer self-start"
        >
          <Edit3 className="w-4 h-4" />
          <span>Chỉnh sửa dịch vụ</span>
        </button>
      </div>

      {/* KPI Số lượng đã bán & Doanh thu */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-subtle">
            <span>Số lượng đã bán</span>
            <ShoppingBag className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-bold text-ink-primary mt-2">
            {stats.total_quantity_sold ?? 0}
          </div>
          <div className="text-xs text-ink-subtle mt-0.5">
            Đơn vị ({service.price_unit}) · {stats.total_orders ?? 0} đơn hợp lệ
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-subtle">
            <span>Doanh thu ghi nhận</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {formatCurrencyVnd(stats.total_revenue ?? 0)}
          </div>
          <div className="text-xs text-ink-subtle mt-0.5">Từ các đơn đã xác nhận / hoàn tất</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-subtle">
            <span>Đã xác nhận / Hoàn thành</span>
            <PackageCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-ink-primary mt-2">
            {(stats.confirmed_count ?? 0) +
              (stats.checked_in_count ?? 0) +
              (stats.completed_count ?? 0)}
          </div>
          <div className="text-xs text-ink-subtle mt-0.5">
            Chờ TT: {stats.pending_payment_count ?? 0} · Đã hủy: {stats.cancelled_count ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-subtle">
            <span>Giá niêm yết cơ sở</span>
            <TrendingUp className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-bold text-brand-primary mt-2">
            {formatCurrencyVnd(service.base_price)}
          </div>
          <div className="text-xs text-ink-subtle mt-0.5">/ {service.price_unit}</div>
        </div>
      </div>

      {/* Tổng quan nội dung dịch vụ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Album ảnh */}
          {mediaList.length > 0 && (
            <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-3">
              <Typography variant="h3" className="text-ink-primary">
                Thư viện hình ảnh ({mediaList.length})
              </Typography>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mediaList.map((m) => (
                  <div
                    key={m.id}
                    className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-border-subtle"
                  >
                    <img src={m.url} alt={service.name} className="w-full h-full object-cover" />
                    {m.is_cover && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-brand-primary text-white text-[10px] font-bold">
                        Ảnh bìa
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mô tả & Tiện ích */}
          <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-4">
            <Typography variant="h3" className="text-ink-primary">
              Mô tả & Tiện ích dịch vụ
            </Typography>
            <p className="text-sm text-ink-body leading-relaxed whitespace-pre-line">
              {service.description}
            </p>

            {amenities.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-ink-subtle uppercase mb-2">
                  Tiện nghi nổi bật
                </div>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a, idx) => (
                    <span
                      key={`${a}-${idx}`}
                      className="px-3 py-1 rounded-full bg-surface-muted text-xs font-medium text-ink-primary"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(includes.length > 0 || excludes.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {includes.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-emerald-700">Bao gồm</div>
                    {includes.map((inc, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-ink-body">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                )}
                {excludes.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-rose-700">Không bao gồm</div>
                    {excludes.map((exc, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-ink-body">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{exc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Danh sách loại phòng (nếu là Chỗ ở) */}
          {roomTypes.length > 0 && (
            <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-4">
              <Typography variant="h3" className="text-ink-primary flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-brand-primary" />
                Loại phòng đang khai thác ({roomTypes.length})
              </Typography>
              <div className="space-y-3">
                {roomTypes.map((room) => (
                  <div
                    key={room.id}
                    className="p-4 rounded-xl bg-surface-muted/60 border border-border-subtle space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-sm text-ink-primary">{room.name}</span>
                        {room.rank && (
                          <span className="ml-2 text-xs text-ink-subtle">({room.rank})</span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-brand-primary">
                        {formatCurrencyVnd(room.base_price)} / đêm
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-ink-subtle">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {room.capacity_adults} người lớn · {room.capacity_children} trẻ em
                      </span>
                      <span>
                        Tổng: {room.total_rooms} phòng · Còn trống: {room.inventory} phòng
                      </span>
                    </div>
                    {Array.isArray(room.images) && room.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {room.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={room.name}
                            className="w-20 h-14 rounded-lg object-cover border border-border-subtle"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lịch trình Tour (nếu có) */}
          {schedules.length > 0 && (
            <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-3">
              <Typography variant="h3" className="text-ink-primary flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-primary" />
                Lịch trình ({schedules.length} ngày)
              </Typography>
              <div className="space-y-2.5">
                {schedules.map((sch) => (
                  <div key={sch.id} className="p-3 rounded-xl bg-surface-muted/60 space-y-1">
                    <div className="text-xs font-bold text-brand-primary">
                      Ngày {sch.day_number}: {sch.title}
                    </div>
                    {sch.description && <p className="text-xs text-ink-body">{sch.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cột phải: Chính sách & Đơn đặt gần đây */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-3">
            <Typography variant="h3" className="text-ink-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Chính sách áp dụng ({policies.length})
            </Typography>
            {policies.length === 0 ? (
              <p className="text-xs text-ink-subtle">Chưa gắn chính sách nào.</p>
            ) : (
              <div className="space-y-2">
                {policies.map((pol) => (
                  <div
                    key={pol.id}
                    className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs font-medium text-emerald-800"
                  >
                    {pol.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-3">
            <Typography variant="h3" className="text-ink-primary">
              Đơn đặt gần đây ({recentBookings.length})
            </Typography>
            {recentBookings.length === 0 ? (
              <p className="text-xs text-ink-subtle">Chưa có đơn đặt chỗ nào cho dịch vụ này.</p>
            ) : (
              <div className="space-y-2.5">
                {recentBookings.map((b) => {
                  const st = BOOKING_STATUS_LABELS[b.status] || BOOKING_STATUS_LABELS.confirmed;
                  return (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-surface-muted/50 border border-border-subtle space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-ink-primary">{b.booking_code}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="text-xs text-ink-body">
                        {b.contact_name} · {b.contact_phone}
                      </div>
                      <div className="flex items-center justify-between text-xs text-ink-subtle">
                        <span>
                          SL: {b.quantity} · {b.start_date}
                          {b.room_type_name ? ` (${b.room_type_name})` : ""}
                        </span>
                        <span className="font-bold text-brand-primary">
                          {formatCurrencyVnd(b.total_amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
