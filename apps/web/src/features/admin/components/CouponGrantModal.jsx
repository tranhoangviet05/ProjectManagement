import React, { useState, useEffect } from "react";
import { Loader2, Search, X } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";
import adminUserApi from "../services/adminUserApi";
import adminCouponApi from "../services/adminCouponApi";

/**
 * Modal Tặng mã ưu đãi cho danh sách Khách du lịch (Tourist).
 */
export default function CouponGrantModal({
  coupon,
  isSubmitting = false,
  onClose,
  onConfirmGrant,
}) {
  const [tourists, setTourists] = useState([]);
  const [grants, setGrants] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!coupon) return;
    let mounted = true;
    setIsLoadingData(true);

    Promise.all([
      adminUserApi.listUsers({ role: "tourist", status: "active", per_page: 100 }),
      adminCouponApi.listCouponGrants(coupon.id),
    ])
      .then(([usersRes, grantsRes]) => {
        if (!mounted) return;
        setTourists(usersRes?.data || []);
        setGrants(grantsRes?.data || []);
      })
      .finally(() => {
        if (mounted) setIsLoadingData(false);
      });

    return () => {
      mounted = false;
    };
  }, [coupon]);

  if (!coupon) return null;

  const grantedIdSet = new Set(grants.map((g) => g.user_id));

  const filteredTourists = tourists.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (t.name || "").toLowerCase().includes(q) ||
      (t.email || "").toLowerCase().includes(q) ||
      (t.phone || "").toLowerCase().includes(q)
    );
  });

  const eligibleTourists = filteredTourists.filter((t) => !grantedIdSet.has(t.id));

  const toggleSelect = (userId) => {
    setError("");
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const toggleSelectAllEligible = () => {
    setError("");
    const eligibleIds = eligibleTourists.map((t) => t.id);
    const allSelected =
      eligibleIds.length > 0 && eligibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !eligibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...eligibleIds])));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      setError("Vui lòng chọn ít nhất 1 khách du lịch để tặng mã.");
      return;
    }
    onConfirmGrant?.(coupon.id, { user_ids: selectedIds, note: note.trim() || null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-surface-elevated rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-slate-50 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Typography variant="h3" className="text-lg font-bold text-ink-primary truncate">
              Tặng mã ưu đãi: {coupon.code}
            </Typography>
            <p className="text-xs text-ink-subtle mt-0.5">
              Chọn các tài khoản Khách du lịch (Tourist) để gửi tặng mã vào ví ưu đãi cá nhân.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
            className="p-1.5 rounded-lg text-ink-subtle hover:text-ink-primary hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-status-danger">
              {error}
            </div>
          )}

          {/* Tìm kiếm & Chọn tất cả */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm khách du lịch theo tên, email, SĐT..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
              <Search className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {eligibleTourists.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAllEligible}
                className="px-3 py-2 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-xs font-semibold text-ink-primary cursor-pointer shrink-0"
              >
                {eligibleTourists.every((t) => selectedIds.includes(t.id))
                  ? "Bỏ chọn tất cả"
                  : `Chọn tất cả (${eligibleTourists.length})`}
              </button>
            )}
          </div>

          {/* Danh sách Tourist */}
          <div className="border border-border-subtle rounded-xl divide-y divide-border-subtle max-h-64 overflow-y-auto">
            {isLoadingData ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" rounded="rounded-lg" />
                <Skeleton className="h-10 w-full" rounded="rounded-lg" />
                <Skeleton className="h-10 w-full" rounded="rounded-lg" />
              </div>
            ) : filteredTourists.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-subtle">
                Không tìm thấy tài khoản Khách du lịch đang hoạt động nào.
              </div>
            ) : (
              filteredTourists.map((t) => {
                const alreadyGranted = grantedIdSet.has(t.id);
                const isChecked = selectedIds.includes(t.id);

                return (
                  <label
                    key={t.id}
                    className={`px-4 py-3 flex items-center justify-between gap-3 ${
                      alreadyGranted
                        ? "bg-slate-50/70 opacity-70 cursor-not-allowed"
                        : "hover:bg-slate-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        disabled={alreadyGranted}
                        checked={alreadyGranted || isChecked}
                        onChange={() => !alreadyGranted && toggleSelect(t.id)}
                        className="w-4 h-4 rounded border-border-subtle text-brand-primary focus:ring-brand-primary"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-ink-primary truncate">
                          {t.name}
                        </div>
                        <div className="text-xs text-ink-subtle truncate">
                          {t.email} {t.phone ? `• ${t.phone}` : ""}
                        </div>
                      </div>
                    </div>

                    {alreadyGranted && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold shrink-0">
                        Đã tặng
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>

          {/* Ghi chú tặng mã */}
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Lời nhắn / Lý do tặng (tùy chọn)
            </label>
            <input
              type="text"
              maxLength={255}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Quà tri ân khách hàng thân thiết tháng 11"
              className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-surface-base text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
            <span className="text-xs text-ink-subtle">
              Đã chọn <strong>{selectedIds.length}</strong> khách du lịch mới
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-body text-sm font-semibold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedIds.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận tặng mã
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
