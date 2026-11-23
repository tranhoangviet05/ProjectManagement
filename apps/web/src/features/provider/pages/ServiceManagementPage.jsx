import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Edit3,
  Eye,
  Trash2,
  Compass,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  BedDouble,
  ShoppingBag,
  MapPin,
} from "lucide-react";
import ProviderLayout from "../layouts/ProviderLayout";
import Typography from "../../../components/ui/Typography";
import { useDebouncedUrlSearch } from "../../../hooks/useDebouncedUrlSearch";
import { ServiceGridSkeleton } from "../../../components/ui/Skeleton";
import ServiceFormStepper from "../components/ServiceFormStepper";
import ProviderServiceDetailView from "../components/ProviderServiceDetailView";
import providerServiceApi from "../services/providerServiceApi";
import { SERVICE_STATUS_CONFIG, formatCurrencyVnd } from "../models/serviceFormModel";

export default function ServiceManagementPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filters & Mode đồng bộ với URL
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";
  const [searchInput, setSearchInput, searchQuery] = useDebouncedUrlSearch(
    searchParams,
    setSearchParams,
  );
  const modeParam = searchParams.get("mode");
  const editIdParam = searchParams.get("id");
  const viewMode =
    modeParam === "create"
      ? "create"
      : modeParam === "edit" && editIdParam
        ? "edit"
        : modeParam === "detail" && editIdParam
          ? "detail"
          : "list";

  const [editingService, setEditingService] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (viewMode === "list" && !searchParams.has("status")) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("status", "all");
          return next;
        },
        { replace: true },
      );
    }
  }, [viewMode, searchParams, setSearchParams]);

  useEffect(() => {
    if (
      (viewMode === "edit" || viewMode === "detail") &&
      editIdParam &&
      String(editingService?.id) !== String(editIdParam)
    ) {
      let mounted = true;
      setIsSubmitting(true);
      providerServiceApi
        .getService(editIdParam)
        .then((res) => {
          if (mounted && res?.data) setEditingService(res.data);
        })
        .catch((err) => {
          if (mounted) {
            setFeedback({
              type: "error",
              message: err?.message || "Không thể tải chi tiết dịch vụ.",
            });
          }
        })
        .finally(() => {
          if (mounted) setIsSubmitting(false);
        });
      return () => {
        mounted = false;
      };
    }
  }, [viewMode, editIdParam, editingService?.id]);

  const handleStatusFilterChange = (nextStatus) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("status", nextStatus || "all");
      return next;
    });
  };

  const returnToListUrl = () => {
    setEditingService(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("mode");
      next.delete("id");
      if (!next.has("status")) next.set("status", "all");
      return next;
    });
  };

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await providerServiceApi.listServices({
        status: statusFilter,
        q: searchQuery,
      });
      setServices(res?.data || []);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.message || "Không thể tải danh sách dịch vụ.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    Promise.all([
      providerServiceApi.fetchCategories().catch(() => ({ data: [] })),
      providerServiceApi.fetchLocations().catch(() => ({ data: [] })),
    ]).then(([catRes, locRes]) => {
      setCategories(catRes?.data || []);
      setLocations(locRes?.data || []);
    });
  }, []);

  const handleOpenCreate = () => {
    setFeedback(null);
    setEditingService(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("mode", "create");
      next.delete("id");
      return next;
    });
  };

  const openServiceMode = async (mode, serviceSummary) => {
    setFeedback(null);
    setEditingService(serviceSummary);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("mode", mode);
      next.set("id", String(serviceSummary.id));
      return next;
    });
    setIsSubmitting(true);
    try {
      const res = await providerServiceApi.getService(serviceSummary.id);
      if (res?.data) setEditingService(res.data);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.message || "Không thể tải chi tiết dịch vụ.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetail = (serviceSummary) => openServiceMode("detail", serviceSummary);

  const handleOpenEdit = (serviceSummary) => openServiceMode("edit", serviceSummary);

  const handleSaveService = async (payload, pendingFiles, pendingCoverIndex) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      let res;
      if (viewMode === "edit" && editingService?.id) {
        res = await providerServiceApi.updateService(editingService.id, payload);
      } else {
        res = await providerServiceApi.createService(payload);
      }

      const savedService = res?.data;

      if (savedService?.id && pendingFiles.length > 0) {
        await providerServiceApi.uploadMedia(
          savedService.id,
          pendingFiles.map((p) => p.file),
          pendingCoverIndex,
        );
      }

      setFeedback({
        type: "success",
        message:
          payload.status === "pending_review"
            ? "Đã lưu dịch vụ và gửi Admin kiểm duyệt thành công."
            : "Đã lưu bản nháp dịch vụ thành công.",
      });
      returnToListUrl();
      await loadServices();
      return savedService;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadMedia = async (serviceId, files, coverIndex) => {
    setIsSubmitting(true);
    try {
      const res = await providerServiceApi.uploadMedia(serviceId, files, coverIndex);
      setFeedback({ type: "success", message: "Tải lên album ảnh thành công." });
      return res?.data || [];
    } catch (err) {
      setFeedback({ type: "error", message: err?.message || "Không thể tải lên tệp media." });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetExistingCover = async (serviceId, mediaId) => {
    try {
      const res = await providerServiceApi.setCoverMedia(serviceId, mediaId);
      setFeedback({ type: "success", message: "Đã cập nhật ảnh bìa dịch vụ." });
      return res?.data;
    } catch (err) {
      setFeedback({ type: "error", message: err?.message || "Không thể đặt ảnh bìa." });
      return null;
    }
  };

  const handleDeleteExistingMedia = async (serviceId, mediaId) => {
    try {
      await providerServiceApi.deleteMedia(serviceId, mediaId);
      setFeedback({ type: "success", message: "Đã xóa tệp khỏi album." });
    } catch (err) {
      setFeedback({ type: "error", message: err?.message || "Không thể xóa tệp media." });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await providerServiceApi.deleteService(deleteTarget.id);
      setFeedback({ type: "success", message: "Đã xóa dịch vụ thành công." });
      setDeleteTarget(null);
      await loadServices();
    } catch (err) {
      setFeedback({ type: "error", message: err?.message || "Không thể xóa dịch vụ." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProviderLayout serviceBadge={String(services.length)}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Typography variant="h1">Quản lý dịch vụ</Typography>
            <Typography variant="body-sm" className="text-ink-subtle mt-1">
              Đăng bán dịch vụ theo ngành nghề kinh doanh, cấu hình lịch phục vụ hoặc loại phòng và
              theo dõi duyệt bài.
            </Typography>
          </div>

          {viewMode === "list" && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-primary text-white text-sm font-semibold hover:bg-brand-hover shadow-sm transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Tạo dịch vụ mới
            </button>
          )}
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-2.5 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-status-success-bg text-status-success"
                : "bg-status-danger-bg text-status-danger"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {viewMode === "detail" ? (
          <ProviderServiceDetailView
            service={editingService}
            onBack={returnToListUrl}
            onEdit={handleOpenEdit}
          />
        ) : viewMode !== "list" ? (
          <ServiceFormStepper
            initialService={editingService}
            categories={categories}
            locations={locations}
            isSubmitting={isSubmitting}
            onSaveService={handleSaveService}
            onUploadMedia={handleUploadMedia}
            onSetExistingCover={handleSetExistingCover}
            onDeleteExistingMedia={handleDeleteExistingMedia}
            onCancel={returnToListUrl}
          />
        ) : (
          <>
            {/* Borderless Filter Bar */}
            <div className="bg-surface-elevated rounded-2xl p-3 sm:p-4 flex flex-wrap items-center gap-3 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm theo tên dịch vụ..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-muted/70 text-ink-primary text-sm placeholder:text-ink-subtle focus:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-surface-muted/70 text-ink-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Bản nháp</option>
                <option value="pending_review">Chờ Admin duyệt</option>
                <option value="active">Đang mở bán</option>
                <option value="rejected">Bị từ chối</option>
              </select>
            </div>

            {/* Service Grid */}
            {isLoading ? (
              <ServiceGridSkeleton count={6} />
            ) : services.length === 0 ? (
              <div className="bg-surface-elevated rounded-3xl p-12 text-center space-y-4 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-subtle text-brand-primary flex items-center justify-center">
                  <Compass className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <Typography variant="h3" className="text-ink-primary">
                    Chưa có dịch vụ nào được đăng bán
                  </Typography>
                  <Typography variant="body-sm" className="text-ink-subtle max-w-md mx-auto">
                    Bắt đầu hành trình kinh doanh bằng cách tạo dịch vụ đầu tiên theo đúng ngành
                    nghề doanh nghiệp của bạn.
                  </Typography>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary-warm text-white text-sm font-semibold hover:bg-secondary-warm-hover shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tạo dịch vụ ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((service) => {
                  const statusInfo =
                    SERVICE_STATUS_CONFIG[service.status] || SERVICE_STATUS_CONFIG.draft;
                  const isAccommodation = service.type === "hotel" || service.type === "homestay";

                  return (
                    <div
                      key={service.id}
                      className="group bg-surface-elevated rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.09)] transition-all duration-300 flex flex-col"
                    >
                      <div className="relative aspect-[16/10] bg-surface-muted overflow-hidden">
                        {service.cover_image ? (
                          <img
                            src={service.cover_image}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-ink-subtle gap-1.5 bg-gradient-to-br from-brand-subtle to-surface-muted">
                            <ImageIcon className="w-8 h-8 opacity-45" />
                            <span className="text-xs font-medium">Chưa có ảnh bìa</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />

                        <span
                          className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>

                        <span className="absolute bottom-3 right-3.5 px-2.5 py-1 rounded-full bg-slate-950/65 backdrop-blur-xs text-white text-xs font-medium">
                          {service.media_count || 0} ảnh
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-secondary-lagoon uppercase tracking-wide">
                            <span>{service.type}</span>
                            {service.location?.name && (
                              <span className="inline-flex items-center gap-1 text-ink-subtle font-medium normal-case">
                                <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                                {service.location.name}
                              </span>
                            )}
                          </div>

                          <Typography
                            variant="h3"
                            className="text-ink-primary line-clamp-2 leading-snug"
                          >
                            {service.name}
                          </Typography>

                          <div className="flex items-center gap-4 text-xs text-ink-subtle">
                            {isAccommodation ? (
                              <span className="inline-flex items-center gap-1">
                                <BedDouble className="w-3.5 h-3.5 text-brand-primary" />
                                {service.room_types_count || 0} loại phòng
                              </span>
                            ) : null}
                            <span className="inline-flex items-center gap-1">
                              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                              Đã bán: {service.sold_quantity ?? 0}
                            </span>
                          </div>

                          {service.status === "rejected" && service.rejection_reason && (
                            <div className="p-3 rounded-xl bg-status-danger-bg text-xs text-status-danger">
                              <strong>Lý do từ chối:</strong> {service.rejection_reason}
                            </div>
                          )}
                        </div>

                        <div className="pt-3.5 flex items-center justify-between gap-2 bg-surface-muted/40 -mx-5 -mb-5 px-5 py-3.5">
                          <div>
                            <div className="text-lg font-bold text-brand-primary leading-tight">
                              {formatCurrencyVnd(service.base_price)}
                            </div>
                            <div className="text-[11px] text-ink-subtle">
                              / {service.price_unit}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(service)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-subtle text-brand-primary text-xs font-semibold hover:bg-brand-primary hover:text-white shadow-xs transition-colors"
                              title="Xem chi tiết & doanh số bán"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(service)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-elevated text-ink-primary text-xs font-semibold hover:bg-brand-light hover:text-brand-primary shadow-xs transition-colors"
                              title="Chỉnh sửa dịch vụ"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(service)}
                              className="p-2 rounded-full bg-surface-elevated text-status-danger hover:bg-status-danger-bg shadow-xs transition-colors"
                              title="Xóa dịch vụ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-elevated rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <Typography variant="h3" className="text-ink-primary">
              Xác nhận xóa dịch vụ?
            </Typography>
            <Typography variant="body-sm" className="text-ink-subtle">
              Bạn có chắc muốn xóa dịch vụ <strong>{deleteTarget.name}</strong>? Dữ liệu lịch sử đơn
              đặt cũ vẫn được hệ thống bảo toàn.
            </Typography>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-full bg-surface-muted text-sm font-semibold text-ink-primary hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-full bg-status-danger text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </ProviderLayout>
  );
}
