import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CalendarRange,
  CheckCircle2,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useDebouncedUrlSearch } from "../../../hooks/useDebouncedUrlSearch";
import adminCampaignApi from "../services/adminCampaignApi";
import CampaignFormModal from "../components/CampaignFormModal";

const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang mở" },
  { id: "draft", label: "Bản nháp" },
  { id: "ended", label: "Đã kết thúc" },
];

const STATUS_BADGES = {
  active: { label: "Đang mở", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  draft: { label: "Bản nháp", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  ended: { label: "Đã kết thúc", cls: "bg-slate-100 text-ink-subtle border-border-subtle" },
};

function formatDateTime(iso) {
  if (!iso) return "--";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDiscount(c) {
  if (c.discount_type === "fixed") {
    return `${Number(c.discount_value || 0).toLocaleString("vi-VN")} ₫`;
  }
  return `${c.discount_value}%${
    c.max_discount ? ` (tối đa ${Number(c.max_discount).toLocaleString("vi-VN")} ₫)` : ""
  }`;
}

export default function AdminCampaignsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";
  const [searchInput, setSearchInput, searchQuery] = useDebouncedUrlSearch(
    searchParams,
    setSearchParams,
  );

  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState(null); // { mode: 'create'|'edit'|'reopen', campaign }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminCampaignApi.list({ status: statusFilter, q: searchQuery });
      setCampaigns(res?.data || []);
    } catch (err) {
      showToast("error", err?.message || "Không thể tải danh sách chương trình khuyến mãi.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleStatusChange = (nextStatus) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextStatus === "all") next.delete("status");
      else next.set("status", nextStatus);
      return next;
    });
  };

  const handleSave = async (payload, id) => {
    setIsSubmitting(true);
    try {
      let res;
      if (modalState?.mode === "reopen" && id) {
        res = await adminCampaignApi.reopen(id, payload);
      } else if (id) {
        res = await adminCampaignApi.update(id, payload);
      } else {
        res = await adminCampaignApi.create(payload);
      }
      showToast("success", res?.message || "Đã lưu chương trình khuyến mãi.");
      setModalState(null);
      await loadCampaigns();
    } catch (err) {
      showToast("error", err?.message || "Không thể lưu chương trình khuyến mãi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (campaign) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chiến dịch "${campaign.name}"?`)) return;
    try {
      const res = await adminCampaignApi.remove(campaign.id);
      showToast("success", res?.message || "Đã xóa chương trình khuyến mãi.");
      await loadCampaigns();
    } catch (err) {
      showToast("error", err?.message || "Không thể xóa chiến dịch này.");
    }
  };

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
              Chương trình khuyến mãi
            </Typography>
            <Typography variant="body-sm" className="text-ink-subtle mt-1">
              Tạo các chiến dịch ưu đãi ngày lễ (Black Friday, Cuối tuần, Lễ Tết...) để Nhà cung cấp
              đăng ký tham gia và ưu tiên hiển thị trên Trang chủ.
            </Typography>
          </div>

          <button
            type="button"
            onClick={() => setModalState({ mode: "create", campaign: null })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-colors cursor-pointer self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo chương trình mới</span>
          </button>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUS_TABS.map((tab) => {
                const active = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleStatusChange(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? "bg-brand-primary text-white shadow-xs"
                        : "text-ink-body hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm tên chiến dịch, nhãn..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
              <Search className="w-4 h-4 text-ink-subtle absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                  <th className="py-3 px-4 sm:px-6">Chiến dịch</th>
                  <th className="py-3 px-4">Mức giảm tối thiểu</th>
                  <th className="py-3 px-4">Thời gian áp dụng</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-sm">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="py-4 px-4 sm:px-6">
                        <Skeleton className="h-4 w-48" rounded="rounded-md" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-28" rounded="rounded-md" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-40" rounded="rounded-md" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-6 w-20" rounded="rounded-full" />
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Skeleton className="h-8 w-28 ml-auto" rounded="rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-ink-subtle">
                      Chưa có chương trình khuyến mãi nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => {
                    const badge = STATUS_BADGES[c.status] || STATUS_BADGES.draft;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-start gap-3">
                            {c.banner_url ? (
                              <img
                                src={c.banner_url}
                                alt={c.name}
                                className="w-14 h-10 rounded-lg object-cover border border-border-subtle shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-10 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-ink-primary">{c.name}</div>
                              {c.badge_text && (
                                <span className="inline-flex mt-1 px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold">
                                  {c.badge_text}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-brand-primary">
                          {formatDiscount(c)}
                        </td>
                        <td className="py-4 px-4 text-xs text-ink-body">
                          <div className="flex items-center gap-1.5">
                            <CalendarRange className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                            <span>
                              {formatDateTime(c.starts_at)} → {formatDateTime(c.ends_at)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-semibold ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                          {c.status === "ended" && (
                            <button
                              type="button"
                              onClick={() => setModalState({ mode: "reopen", campaign: c })}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Mở lại</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setModalState({ mode: "edit", campaign: c })}
                            className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-primary font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-status-danger border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CampaignFormModal
        key={`${modalState?.mode || "closed"}-${modalState?.campaign?.id || "new"}`}
        campaign={modalState?.campaign}
        mode={modalState?.mode || "create"}
        isOpen={Boolean(modalState)}
        isSubmitting={isSubmitting}
        onClose={() => setModalState(null)}
        onSubmit={handleSave}
      />
    </AdminLayout>
  );
}
