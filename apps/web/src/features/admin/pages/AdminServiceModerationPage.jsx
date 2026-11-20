import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Typography from "../../../components/ui/Typography";
import ServiceModerationTable from "../components/ServiceModerationTable";
import ServiceDetailReviewModal from "../components/ServiceDetailReviewModal";
import ServiceRejectDialog from "../components/ServiceRejectDialog";
import adminServiceModerationApi from "../services/adminServiceModerationApi";

/**
 * Screen Orchestrator: Trang Kiểm duyệt Dịch vụ (Route: /admin/services)
 * Đồng bộ cấu trúc & ngôn ngữ thiết kế với AdminProviderKycPage.
 */
export default function AdminServiceModerationPage() {
  const [services, setServices] = useState([]);
  const [counts, setCounts] = useState({ pending_review: 0, active: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [detailService, setDetailService] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminServiceModerationApi.listServices({
        status: statusFilter,
        type: typeFilter,
        q: searchQuery,
      });
      setServices(res?.data || []);
      if (res?.counts) setCounts(res.counts);
    } catch (err) {
      showToast("error", err?.message || "Không thể tải danh sách dịch vụ kiểm duyệt.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleReviewDetail = async (serviceSummary) => {
    setDetailService(serviceSummary);
    setIsLoadingDetail(true);
    try {
      const res = await adminServiceModerationApi.getServiceDetail(serviceSummary.id);
      if (res?.data) setDetailService(res.data);
    } catch (err) {
      showToast("error", err?.message || "Không thể tải chi tiết dịch vụ.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleApprove = async (serviceId) => {
    setIsSubmitting(true);
    try {
      await adminServiceModerationApi.approveService(serviceId);
      showToast("success", "Đã phê duyệt dịch vụ hiển thị công khai trên sàn.");
      setDetailService(null);
      await loadServices();
    } catch (err) {
      showToast("error", err?.message || "Không thể phê duyệt dịch vụ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async (serviceId, reason) => {
    setIsSubmitting(true);
    try {
      await adminServiceModerationApi.rejectService(serviceId, reason);
      showToast("success", "Đã từ chối dịch vụ và gửi phản hồi cho đối tác.");
      setRejectTarget(null);
      setDetailService(null);
      await loadServices();
    } catch (err) {
      showToast("error", err?.message || "Không thể từ chối dịch vụ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = counts?.pending_review || 0;

  return (
    <AdminLayout>
      {/* Toast thông báo nhanh */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-rose-950 text-white border-rose-800"
              : "bg-slate-900 text-white border-slate-700"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Header trang Kiểm duyệt Dịch vụ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Typography variant="h1" className="text-2xl sm:text-3xl font-bold text-ink-primary">
              Kiểm duyệt Dịch vụ
            </Typography>
            <Typography variant="body-sm" className="text-ink-subtle mt-1">
              Kiểm tra nội dung, hình ảnh, lịch trình và phê duyệt dịch vụ trước khi mở bán trên
              sàn.
            </Typography>
          </div>

          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 self-start">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{pendingCount} dịch vụ đang chờ xét duyệt</span>
            </span>
          )}
        </div>

        {/* Bảng danh sách & Bộ lọc tích hợp */}
        <ServiceModerationTable
          services={services}
          isLoading={isLoading}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          counts={counts}
          onReviewDetail={handleReviewDetail}
          onQuickApprove={handleApprove}
          onOpenReject={(svc) => setRejectTarget(svc)}
        />
      </div>

      {/* Modal Xem chi tiết & Thẩm định dịch vụ */}
      <ServiceDetailReviewModal
        service={detailService}
        isLoadingDetail={isLoadingDetail}
        isSubmitting={isSubmitting}
        onClose={() => setDetailService(null)}
        onApprove={handleApprove}
        onOpenReject={(svc) => setRejectTarget(svc)}
      />

      {/* Hộp thoại Nhập lý do Từ chối dịch vụ */}
      <ServiceRejectDialog
        key={rejectTarget?.id || "closed"}
        service={rejectTarget}
        isSubmitting={isSubmitting}
        onClose={() => setRejectTarget(null)}
        onConfirmReject={handleConfirmReject}
      />
    </AdminLayout>
  );
}
