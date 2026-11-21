import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Typography from "../../../components/ui/Typography";
import CatalogCrudTable from "../components/CatalogCrudTable";
import CatalogFormModal from "../components/CatalogFormModal";
import adminCatalogApi from "../services/adminCatalogApi";

const ADD_BUTTON_LABELS = {
  locations: "Thêm điểm đến",
  categories: "Thêm danh mục",
  businessTypes: "Thêm loại hình",
};

/**
 * Screen Orchestrator: Trang Cấu hình Hệ thống & Dữ liệu gốc (Route: /admin/settings)
 * Quản lý Locations, Categories và BusinessTypes khớp 100% schema DB.
 */
export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("locations");
  const [items, setItems] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalTarget, setModalTarget] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminCatalogApi.list(activeTab, searchQuery);
      const rows = res?.data || [];
      setItems(rows);
      if (activeTab === "locations" && !searchQuery.trim()) {
        setAllLocations(rows);
      }
    } catch (err) {
      showToast("error", err?.message || "Không thể tải dữ liệu cấu hình.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    setSearchQuery("");
  };

  const handleSave = async (payload, id) => {
    setIsSubmitting(true);
    try {
      const res = id
        ? await adminCatalogApi.update(activeTab, id, payload)
        : await adminCatalogApi.create(activeTab, payload);
      showToast("success", res?.message || "Đã lưu cấu hình thành công.");
      setModalTarget(null);
      await loadData();
    } catch (err) {
      showToast("error", err?.message || "Không thể lưu dữ liệu cấu hình.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${item.name}"?`)) return;
    try {
      const res = await adminCatalogApi.remove(activeTab, item.id);
      showToast("success", res?.message || "Đã xóa bản ghi thành công.");
      await loadData();
    } catch (err) {
      showToast("error", err?.message || "Không thể xóa bản ghi này.");
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
              Cấu hình Hệ thống
            </Typography>
            <Typography variant="body-sm" className="text-ink-subtle mt-1">
              Quản lý Điểm đến, Danh mục dịch vụ và Loại hình kinh doanh dùng chung trên toàn sàn.
            </Typography>
          </div>

          <button
            type="button"
            onClick={() => setModalTarget({})}
            className="px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-colors cursor-pointer self-start"
          >
            {ADD_BUTTON_LABELS[activeTab] || "Thêm mới"}
          </button>
        </div>

        <CatalogCrudTable
          activeTab={activeTab}
          onTabChange={handleTabChange}
          items={items}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEdit={(row) => setModalTarget(row)}
          onDelete={handleDelete}
        />
      </div>

      <CatalogFormModal
        key={`${activeTab}-${modalTarget?.id || (modalTarget ? "create" : "closed")}`}
        activeTab={activeTab}
        item={modalTarget}
        allLocations={allLocations}
        isOpen={Boolean(modalTarget)}
        isSubmitting={isSubmitting}
        onClose={() => setModalTarget(null)}
        onSubmit={handleSave}
      />
    </AdminLayout>
  );
}
