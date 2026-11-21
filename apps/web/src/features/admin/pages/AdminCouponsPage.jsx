import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Typography from "../../../components/ui/Typography";
import { useDebouncedUrlSearch } from "../../../hooks/useDebouncedUrlSearch";
import AdminCouponsTable from "../components/AdminCouponsTable";
import CouponFormModal from "../components/CouponFormModal";
import CouponGrantModal from "../components/CouponGrantModal";
import adminCouponApi from "../services/adminCouponApi";

/**
 * Screen Orchestrator: Trang Quản lý Mã ưu đãi toàn sàn & Tặng mã cho Tourist (Route: /admin/coupons)
 */
export default function AdminCouponsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";
  const [searchInput, setSearchInput, searchQuery] = useDebouncedUrlSearch(
    searchParams,
    setSearchParams,
  );

  const [coupons, setCoupons] = useState([]);
  const [counts, setCounts] = useState({ all: 0, active: 0, upcoming: 0, expired: 0 });

  useEffect(() => {
    if (!searchParams.has("status")) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("status", "all");
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  const updateParam = (key, value, emptyWhen = null, replace = false) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (emptyWhen !== null && value === emptyWhen) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace },
    );
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [formTarget, setFormTarget] = useState(null); // null = đóng, {} = tạo mới, {id,...} = sửa
  const [grantTarget, setGrantTarget] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminCouponApi.listCoupons({
        status: statusFilter,
        q: searchQuery,
      });
      setCoupons(res?.data || []);
      if (res?.counts) setCounts(res.counts);
    } catch (err) {
      showToast("error", err?.message || "Không thể tải danh sách mã ưu đãi.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleSaveCoupon = async (payload, couponId) => {
    setIsSubmitting(true);
    try {
      const res = couponId
        ? await adminCouponApi.updateCoupon(couponId, payload)
        : await adminCouponApi.createCoupon(payload);
      showToast("success", res?.message || "Đã lưu mã ưu đãi thành công.");
      setFormTarget(null);
      await loadCoupons();
    } catch (err) {
      showToast("error", err?.message || "Không thể lưu mã ưu đãi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mã ưu đãi "${coupon.code}"?`)) return;
    try {
      const res = await adminCouponApi.deleteCoupon(coupon.id);
      showToast("success", res?.message || "Đã xóa mã ưu đãi.");
      await loadCoupons();
    } catch (err) {
      showToast("error", err?.message || "Không thể xóa mã ưu đãi.");
    }
  };

  const handleConfirmGrant = async (couponId, payload) => {
    setIsSubmitting(true);
    try {
      const res = await adminCouponApi.grantCouponToTourists(couponId, payload);
      showToast("success", res?.message || "Đã tặng mã ưu đãi cho khách du lịch.");
      setGrantTarget(null);
      await loadCoupons();
    } catch (err) {
      showToast("error", err?.message || "Không thể tặng mã ưu đãi.");
    } finally {
      setIsSubmitting(false);
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
              Mã ưu đãi toàn sàn
            </Typography>
            <Typography variant="body-sm" className="text-ink-subtle mt-1">
              Tạo chiến dịch giảm giá, theo dõi lượt sử dụng và tặng mã ưu đãi trực tiếp cho Khách
              du lịch.
            </Typography>
          </div>

          <button
            type="button"
            onClick={() => setFormTarget({})}
            className="px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-colors cursor-pointer self-start"
          >
            Tạo mã ưu đãi
          </button>
        </div>

        <AdminCouponsTable
          coupons={coupons}
          isLoading={isLoading}
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => updateParam("status", val || "all")}
          searchQuery={searchInput}
          onSearchChange={setSearchInput}
          counts={counts}
          onEdit={(c) => setFormTarget(c)}
          onDelete={handleDeleteCoupon}
          onOpenGrant={(c) => setGrantTarget(c)}
        />
      </div>

      <CouponFormModal
        key={formTarget?.id || (formTarget ? "create" : "closed")}
        coupon={formTarget}
        isOpen={Boolean(formTarget)}
        isSubmitting={isSubmitting}
        onClose={() => setFormTarget(null)}
        onSubmit={handleSaveCoupon}
      />

      <CouponGrantModal
        key={grantTarget?.id || "closed"}
        coupon={grantTarget}
        isSubmitting={isSubmitting}
        onClose={() => setGrantTarget(null)}
        onConfirmGrant={handleConfirmGrant}
      />
    </AdminLayout>
  );
}
