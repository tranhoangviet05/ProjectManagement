import React from "react";
import { X, Loader2 } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";
import { formatCurrencyVnd, SERVICE_STATUS_CONFIG } from "../../provider/models/serviceFormModel";

const SERVICE_TYPE_LABELS = {
  tour: "Tour du lịch",
  hotel: "Khách sạn",
  homestay: "Homestay / Villa",
  vehicle: "Phương tiện",
};

/**
 * Modal Xem chi tiết & Thẩm định Dịch vụ (đồng bộ chuẩn UI với KycDetailModal).
 */
export default function ServiceDetailReviewModal({
  service,
  isLoadingDetail = false,
  isSubmitting = false,
  onClose,
  onApprove,
  onOpenReject,
}) {
  if (!service && !isLoadingDetail) return null;

  const statusInfo = SERVICE_STATUS_CONFIG[service?.status] || SERVICE_STATUS_CONFIG.pending_review;
  const mediaList = Array.isArray(service?.media) ? service.media : [];
  const roomTypes = Array.isArray(service?.room_types) ? service.room_types : [];
  const schedules = Array.isArray(service?.schedules) ? service.schedules : [];
  const includesList = Array.isArray(service?.includes) ? service.includes : [];
  const excludesList = Array.isArray(service?.excludes) ? service.excludes : [];
  const typeLabel = SERVICE_TYPE_LABELS[service?.type] || service?.type || "Dịch vụ";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-surface-elevated rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-border-subtle bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Typography variant="h3" className="text-lg font-bold text-ink-primary truncate">
              Thẩm định dịch vụ: {service?.name || "Đang tải..."}
            </Typography>
            {service?.status && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${statusInfo.badgeClass}`}
              >
                {statusInfo.label}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-1.5 rounded-lg text-ink-subtle hover:text-ink-primary hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung 2 cột */}
        {isLoadingDetail ? (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">
            <div className="lg:col-span-5 p-6 space-y-5">
              <Skeleton className="h-5 w-36" rounded="rounded-md" />
              <Skeleton className="h-6 w-3/4" rounded="rounded-md" />
              <Skeleton className="h-4 w-1/2" rounded="rounded-md" />
              <div className="pt-4 border-t border-border-subtle space-y-3">
                <Skeleton className="h-4 w-28" rounded="rounded-md" />
                <Skeleton className="h-5 w-2/3" rounded="rounded-md" />
                <Skeleton className="h-4 w-full" rounded="rounded-md" />
              </div>
              <div className="pt-4 border-t border-border-subtle space-y-3">
                <Skeleton className="h-4 w-24" rounded="rounded-md" />
                <Skeleton className="h-7 w-40" rounded="rounded-md" />
              </div>
            </div>
            <div className="lg:col-span-7 p-6 space-y-5 bg-slate-50/40">
              <Skeleton className="h-5 w-40" rounded="rounded-md" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Skeleton className="aspect-[4/3]" rounded="rounded-xl" />
                <Skeleton className="aspect-[4/3]" rounded="rounded-xl" />
                <Skeleton className="aspect-[4/3]" rounded="rounded-xl" />
              </div>
              <Skeleton className="h-5 w-32" rounded="rounded-md" />
              <Skeleton className="h-24 w-full" rounded="rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">
            {/* Cột Trái: Thông tin tổng quan & Chính sách */}
            <div className="lg:col-span-5 p-6 space-y-5 bg-surface-elevated">
              {service?.status === "rejected" && service?.rejection_reason && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <span className="font-bold block text-rose-900">Lý do từ chối trước đó</span>
                  <p className="leading-relaxed">{service.rejection_reason}</p>
                </div>
              )}

              <div>
                <span className="text-xs text-ink-subtle font-semibold block mb-1">
                  Nhà cung cấp
                </span>
                <div className="font-bold text-ink-primary text-base">
                  {service.provider?.business_name || "Đối tác"}
                </div>
                <div className="text-xs text-ink-subtle mt-0.5">
                  {service.provider?.business_type?.name || typeLabel}
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle space-y-3">
                <div>
                  <span className="text-xs text-ink-subtle font-semibold block mb-1">
                    Loại hình & Giá cơ sở
                  </span>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="bg-slate-100 text-ink-body px-2.5 py-0.5 rounded text-xs font-medium">
                      {typeLabel}
                    </span>
                    <span className="text-lg font-bold text-brand-primary">
                      {formatCurrencyVnd(service.base_price)}
                    </span>
                    <span className="text-xs text-ink-subtle">/ {service.price_unit}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-ink-subtle font-semibold block mb-1">
                    Địa điểm & Địa chỉ
                  </span>
                  <div className="text-sm font-semibold text-ink-primary">
                    {service.location?.name || "Chưa gắn địa điểm"}
                  </div>
                  {service.address && (
                    <div className="text-xs text-ink-subtle mt-0.5">{service.address}</div>
                  )}
                </div>
              </div>

              {(includesList.length > 0 || excludesList.length > 0) && (
                <div className="pt-4 border-t border-border-subtle space-y-3">
                  {includesList.length > 0 && (
                    <div>
                      <span className="text-xs text-ink-subtle font-semibold block mb-1.5">
                        Dịch vụ bao gồm
                      </span>
                      <ul className="list-disc list-inside text-xs text-ink-body space-y-1">
                        {includesList.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {excludesList.length > 0 && (
                    <div>
                      <span className="text-xs text-ink-subtle font-semibold block mb-1.5">
                        Không bao gồm
                      </span>
                      <ul className="list-disc list-inside text-xs text-ink-subtle space-y-1">
                        {excludesList.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cột Phải: Hình ảnh, Mô tả & Chi tiết chuyên biệt */}
            <div className="lg:col-span-7 p-6 space-y-5 bg-slate-50/40">
              {mediaList.length > 0 && (
                <div className="space-y-2.5">
                  <Typography variant="body-md" className="font-semibold text-ink-primary">
                    Album hình ảnh ({mediaList.length})
                  </Typography>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {mediaList.map((m) => (
                      <div
                        key={m.id}
                        className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border ${
                          m.is_cover
                            ? "border-brand-primary ring-2 ring-brand-primary/25"
                            : "border-border-subtle"
                        }`}
                      >
                        <img
                          src={m.url}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                        {m.is_cover && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-semibold">
                            Ảnh bìa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Typography variant="body-md" className="font-semibold text-ink-primary">
                  Mô tả dịch vụ
                </Typography>
                <div className="p-4 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-ink-body whitespace-pre-line leading-relaxed">
                  {service.description || "Chưa có mô tả chi tiết."}
                </div>
              </div>

              {roomTypes.length > 0 && (
                <div className="space-y-2.5">
                  <Typography variant="body-md" className="font-semibold text-ink-primary">
                    Các hạng phòng ({roomTypes.length})
                  </Typography>
                  <div className="space-y-3">
                    {roomTypes.map((room) => {
                      const roomImages = Array.isArray(room.images)
                        ? room.images
                            .map((img) => (typeof img === "string" ? img : img?.url))
                            .filter(Boolean)
                        : [];
                      const roomAmenities = Array.isArray(room.amenities) ? room.amenities : [];

                      return (
                        <div
                          key={room.id}
                          className="p-4 rounded-xl border border-border-subtle bg-surface-elevated space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-ink-primary">
                                {room.name}
                              </div>
                              <div className="text-xs text-ink-subtle mt-0.5">
                                Sức chứa: {room.capacity_adults} người lớn, {room.capacity_children}{" "}
                                trẻ em
                              </div>
                            </div>
                            <div className="sm:text-right shrink-0">
                              <div className="text-sm font-bold text-brand-primary">
                                {formatCurrencyVnd(room.base_price)} / đêm
                              </div>
                              <div className="text-xs text-ink-subtle">
                                {room.total_rooms} phòng
                              </div>
                            </div>
                          </div>

                          {room.description && (
                            <p className="text-xs text-ink-body leading-relaxed">
                              {room.description}
                            </p>
                          )}

                          {roomAmenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {roomAmenities.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded bg-slate-100 text-ink-body text-[11px] font-medium"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}

                          {roomImages.length > 0 ? (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-xs font-semibold text-ink-subtle block">
                                Ảnh hạng phòng ({roomImages.length})
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {roomImages.map((imgUrl, idx) => (
                                  <a
                                    key={idx}
                                    href={imgUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 border border-border-subtle hover:opacity-90 transition-opacity"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`${room.name} - ảnh ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-ink-subtle italic pt-1">
                              Chưa có ảnh riêng cho hạng phòng này.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {schedules.length > 0 && (
                <div className="space-y-2.5">
                  <Typography variant="body-md" className="font-semibold text-ink-primary">
                    Lịch trình chi tiết ({schedules.length} ngày)
                  </Typography>
                  <div className="space-y-2.5">
                    {schedules.map((day) => (
                      <div
                        key={day.id}
                        className="p-3.5 rounded-xl border border-border-subtle bg-surface-elevated space-y-1.5"
                      >
                        <div className="text-sm font-semibold text-ink-primary">
                          Ngày {day.day_number}: {day.title}
                        </div>
                        {day.description && (
                          <p className="text-xs text-ink-body">{day.description}</p>
                        )}
                        {Array.isArray(day.activities) && day.activities.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-ink-subtle space-y-0.5">
                            {day.activities.map((act, idx) => (
                              <li key={idx}>{act}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!isLoadingDetail && service && (
          <div className="px-6 py-4 border-t border-border-subtle bg-slate-50 flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-body text-sm font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {service.status !== "rejected" && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenReject?.(service)}
                className="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-status-danger border border-rose-200 text-sm font-semibold transition-colors cursor-pointer"
              >
                Từ chối
              </button>
            )}

            {service.status === "pending_review" && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onApprove?.(service.id)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Phê duyệt lên sàn
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
