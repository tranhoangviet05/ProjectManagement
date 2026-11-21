import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Typography from "../../../components/ui/Typography";
import { useDebouncedUrlSearch } from "../../../hooks/useDebouncedUrlSearch";
import AdminReportsTable from "../components/AdminReportsTable";
import ReportDetailModal from "../components/ReportDetailModal";
import adminReportApi from "../services/adminReportApi";

/**
 * Screen Orchestrator: Trang Kiểm duyệt Nội dung & Báo cáo Cộng đồng (Route: /admin/reports)
 */
export default function AdminReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "pending";
  const typeFilter = searchParams.get("type") || "all";
  const [searchInput, setSearchInput, searchQuery] = useDebouncedUrlSearch(
    searchParams,
    setSearchParams,
  );

  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    resolved_hidden: 0,
    dismissed: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [detailReport, setDetailReport] = useState(null);

  useEffect(() => {
    if (!searchParams.has("status") || !searchParams.has("type")) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!next.has("status")) next.set("status", "pending");
          if (!next.has("type")) next.set("type", "all");
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      return next;
    });
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminReportApi.listReports({
        status: statusFilter,
        type: typeFilter,
        q: searchQuery,
      });
      setReports(res?.data || []);
      if (res?.counts) setCounts(res.counts);
    } catch (err) {
      showToast("error", err?.message || "Không thể tải danh sách báo cáo cộng đồng.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleViewDetail = async (reportSummary) => {
    setDetailReport(reportSummary);
    setIsLoadingDetail(true);
    try {
      const res = await adminReportApi.getReportDetail(reportSummary.id);
      if (res?.data) setDetailReport(res.data);
    } catch (err) {
      showToast("error", err?.message || "Không thể tải chi tiết báo cáo.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleResolve = async (reportId, action, resolutionNote) => {
    setIsSubmitting(true);
    try {
      const res = await adminReportApi.resolveReport(reportId, {
        action,
        resolution_note: resolutionNote?.trim() || null,
      });
      showToast("success", res?.message || "Đã xử lý báo cáo vi phạm.");
      setDetailReport(null);
      await loadReports();
    } catch (err) {
      showToast("error", err?.message || "Không thể xử lý báo cáo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = counts?.pending || 0;

  return (
    <AdminLayout>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Typography variant="h1" className="text-2xl sm:text-3xl font-bold text-ink-primary">
              Báo cáo cộng đồng
            </Typography>
            <Typography variant="body-sm" className="text-ink-subtle mt-1">
              Kiểm duyệt các bài viết và bình luận bị báo cáo vi phạm trên mạng xã hội du lịch.
            </Typography>
          </div>

          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 self-start">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{pendingCount} báo cáo chờ xử lý</span>
            </span>
          )}
        </div>

        <AdminReportsTable
          reports={reports}
          isLoading={isLoading}
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => updateParam("status", val || "pending")}
          typeFilter={typeFilter}
          onTypeFilterChange={(val) => updateParam("type", val || "all")}
          searchQuery={searchInput}
          onSearchChange={setSearchInput}
          counts={counts}
          onViewDetail={handleViewDetail}
        />
      </div>

      <ReportDetailModal
        key={detailReport?.id || "closed"}
        report={detailReport}
        isLoadingDetail={isLoadingDetail}
        isSubmitting={isSubmitting}
        onClose={() => setDetailReport(null)}
        onResolve={handleResolve}
      />
    </AdminLayout>
  );
}
