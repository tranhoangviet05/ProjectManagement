import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Compass,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  Clock,
} from "lucide-react";
import ProviderLayout from "../layouts/ProviderLayout";
import Typography from "../../../components/ui/Typography";
import ServiceFormStepper from "../components/ServiceFormStepper";
import providerServiceApi from "../services/providerServiceApi";
import {
  SERVICE_STATUS_CONFIG,
  SERVICE_TYPE_OPTIONS,
  formatCurrencyVnd,
} from "../models/serviceFormModel";

export default function ServiceManagementPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState("list");
  const [editingService, setEditingService] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await providerServiceApi.listServices({
        status: statusFilter,
        type: typeFilter,
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
  }, [statusFilter, typeFilter, searchQuery]);

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
    setViewMode("create");
  };

  const handleOpenEdit = async (serviceSummary) => {
    setFeedback(null);
    setIsSubmitting(true);
    try {
      const res = await providerServiceApi.getService(serviceSummary.id);
      setEditingService(res?.data || serviceSummary);
      setViewMode("edit");
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.message || "Không thể tải chi tiết dịch vụ.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      setViewMode("list");
      setEditingService(null);
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
    <ProviderLayout
      title="Quản lý Tour & Dịch vụ"
      subtitle="Đăng bán dịch vụ mới, quản lý album ảnh và theo dõi trạng thái kiểm duyệt từ Admin."
    >
      <div className="space-y-6">
        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-2.5 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
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

        {viewMode !== "list" ? (
          <ServiceFormStepper
            initialService={editingService}
            categories={categories}
            locations={locations}
            isSubmitting={isSubmitting}
            onSaveService={handleSaveService}
            onUploadMedia={handleUploadMedia}
            onSetExistingCover={handleSetExistingCover}
            onDeleteExistingMedia={handleDeleteExistingMedia}
            onCancel={() => {
              setViewMode("list");
              setEditingService(null);
            }}
          />
        ) : (
          <>
            {/* Toolbar */}
            <div className="bg-surface-card border border-border-default rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-card">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên dịch vụ..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-default bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-border-default bg-white text-sm"
                >
                  <option value="all">Tất cả loại hình</option>
                  {SERVICE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-border-default bg-white text-sm"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="draft">Bản nháp</option>
                  <option value="pending_review">Chờ Admin duyệt</option>
                  <option value="active">Đang mở bán</option>
                  <option value="rejected">Bị từ chối</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:opacity-95 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Tạo dịch vụ mới
              </button>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="bg-surface-card border border-border-default rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-brand-primary animate-spin" />
                <Typography variant="body-sm" className="text-ink-subtle">
                  Đang tải danh sách dịch vụ...
                </Typography>
              </div>
            ) : services.length === 0 ? (
              <div className="bg-surface-card border border-border-default rounded-2xl p-12 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Compass className="w-7 h-7" />
                </div>
                <Typography variant="heading-sm" className="text-ink-primary">
                  Chưa có dịch vụ nào
                </Typography>
                <Typography variant="body-sm" className="text-ink-subtle max-w-md mx-auto">
                  Hãy tạo dịch vụ đầu tiên (Tour, Khách sạn, Homestay hoặc Xe) để gửi duyệt và mở
                  bán tới hàng ngàn du khách.
                </Typography>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Tạo dịch vụ ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {services.map((service) => {
                  const statusInfo =
                    SERVICE_STATUS_CONFIG[service.status] || SERVICE_STATUS_CONFIG.draft;
                  return (
                    <div
                      key={service.id}
                      className="bg-surface-card border border-border-default rounded-2xl overflow-hidden shadow-card flex flex-col"
                    >
                      <div className="relative aspect-[16/9] bg-surface-subtle">
                        {service.cover_image ? (
                          <img
                            src={service.cover_image}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-ink-subtle gap-1.5">
                            <ImageIcon className="w-8 h-8 opacity-50" />
                            <span className="text-xs">Chưa có ảnh bìa</span>
                          </div>
                        )}
                        <span
                          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-slate-900/75 text-white text-xs">
                          {service.media_count || 0} ảnh
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-brand-primary uppercase tracking-wide">
                            {service.type}{" "}
                            {service.location?.name ? `· ${service.location.name}` : ""}
                          </div>
                          <Typography
                            variant="body-md"
                            className="font-bold text-ink-primary line-clamp-2"
                          >
                            {service.name}
                          </Typography>

                          <div className="flex items-center gap-4 text-xs text-ink-subtle">
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              Tối đa {service.max_guests} khách
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {service.duration_days}N{service.duration_nights}Đ
                            </span>
                          </div>

                          {service.status === "rejected" && service.rejection_reason && (
                            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                              <strong>Lý do từ chối:</strong> {service.rejection_reason}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-border-default flex items-center justify-between gap-2">
                          <div>
                            <div className="text-base font-bold text-ink-primary">
                              {formatCurrencyVnd(service.base_price)}
                            </div>
                            <div className="text-[11px] text-ink-subtle">
                              / {service.price_unit}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(service)}
                              className="p-2 rounded-xl border border-border-default text-ink-primary hover:bg-surface-subtle"
                              title="Chỉnh sửa dịch vụ"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(service)}
                              className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                              title="Xóa dịch vụ"
                            >
                              <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <Typography variant="heading-sm" className="text-ink-primary">
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
                className="px-4 py-2 rounded-xl border border-border-default text-sm font-medium text-ink-primary hover:bg-surface-subtle"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-60"
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
