import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarRange,
  CheckCircle2,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import ProviderSidebar from "../components/ProviderSidebar";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";
import providerCampaignApi from "../services/providerCampaignApi";
import { SERVICE_STATUS_CONFIG } from "../models/serviceFormModel";

function formatDateTime(iso) {
  if (!iso) return "--";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDiscountLabel(type, value) {
  if (type === "fixed") {
    return `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
  }
  return `${value}%`;
}

export default function ProviderCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [services, setServices] = useState([]);
  const [draftValues, setDraftValues] = useState({}); // key: `${campaignId}_${serviceId}` => discount_value
  const [savingKey, setSavingKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await providerCampaignApi.list();
      const loadedCampaigns = res?.data?.campaigns || [];
      const loadedServices = res?.data?.services || [];
      setCampaigns(loadedCampaigns);
      setServices(loadedServices);

      const initialDrafts = {};
      loadedCampaigns.forEach((c) => {
        loadedServices.forEach((svc) => {
          const existing = c.participations?.find((p) => p.service_id === svc.id);
          initialDrafts[`${c.id}_${svc.id}`] = String(
            existing ? existing.discount_value : c.discount_value,
          );
        });
      });
      setDraftValues(initialDrafts);
    } catch (err) {
      showToast("error", err?.message || "Không thể tải danh sách chương trình khuyến mãi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleOrSave = async (campaign, service, nextActive) => {
    const key = `${campaign.id}_${service.id}`;
    const rawValue = Number(draftValues[key] ?? campaign.discount_value);

    if (nextActive && (Number.isNaN(rawValue) || rawValue < campaign.discount_value)) {
      showToast(
        "error",
        `Mức khuyến mãi của "${service.name}" không được thấp hơn mức tối thiểu (${formatDiscountLabel(campaign.discount_type, campaign.discount_value)}).`,
      );
      return;
    }

    setSavingKey(key);
    try {
      const res = await providerCampaignApi.toggleService(campaign.id, {
        service_id: service.id,
        is_active: nextActive,
        discount_value: rawValue,
      });
      showToast("success", res?.message || "Đã cập nhật tham gia khuyến mãi.");
      await loadData();
    } catch (err) {
      showToast("error", err?.message || "Không thể cập nhật tham gia khuyến mãi.");
    } finally {
      setSavingKey("");
    }
  };

  return (
    <div className="min-h-screen bg-surface-base flex">
      <ProviderSidebar serviceBadge={String(services.length || 0)} />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
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
          <div>
            <Typography variant="h1" className="text-2xl sm:text-3xl font-bold text-ink-primary">
              Chương trình khuyến mãi
            </Typography>
            <Typography variant="body-sm" className="text-ink-subtle mt-1">
              Chọn từng dịch vụ bạn muốn đăng ký tham gia các chiến dịch ưu đãi ngày lễ của sàn.
              Dịch vụ giảm sâu hơn mức chuẩn chiến dịch sẽ được ưu tiên hiển thị nổi bật trên Trang
              chủ!
            </Typography>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-surface-elevated border border-border-subtle space-y-3"
                >
                  <Skeleton className="h-6 w-64" rounded="rounded-md" />
                  <Skeleton className="h-4 w-96" rounded="rounded-md" />
                  <Skeleton className="h-24 w-full" rounded="rounded-xl" />
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface-elevated border border-border-subtle text-center space-y-2">
              <Sparkles className="w-8 h-8 text-brand-primary mx-auto" />
              <Typography variant="h3" className="text-base font-bold text-ink-primary">
                Hiện chưa có chiến dịch khuyến mãi nào đang mở
              </Typography>
              <Typography variant="body-sm" className="text-ink-subtle">
                Khi Quản trị viên mở chiến dịch mới (Black Friday, Cuối tuần, Lễ Tết...), danh sách
                sẽ hiển thị tại đây để bạn chọn dịch vụ tham gia.
              </Typography>
            </div>
          ) : (
            <div className="space-y-6">
              {campaigns.map((campaign) => {
                const activeCount = (campaign.participations || []).filter(
                  (p) => p.is_active,
                ).length;

                // Map các dịch vụ đang tham gia chiến dịch khác để chặn trùng
                const otherActiveByService = {};
                campaigns.forEach((c) => {
                  if (c.id === campaign.id) return;
                  (c.participations || []).forEach((p) => {
                    if (p.is_active) {
                      otherActiveByService[p.service_id] = c.name;
                    }
                  });
                });

                return (
                  <div
                    key={campaign.id}
                    className="rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs overflow-hidden"
                  >
                    {/* Header chiến dịch */}
                    <div className="p-5 sm:p-6 border-b border-border-subtle bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {campaign.banner_url ? (
                          <img
                            src={campaign.banner_url}
                            alt={campaign.name}
                            className="w-28 aspect-video rounded-xl object-cover border border-border-subtle shrink-0"
                          />
                        ) : (
                          <div className="w-28 aspect-video rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                            <Sparkles className="w-6 h-6" />
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Typography variant="h3" className="text-lg font-bold text-ink-primary">
                              {campaign.name}
                            </Typography>
                            {campaign.badge_text && (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold">
                                {campaign.badge_text}
                              </span>
                            )}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                campaign.status === "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {campaign.status === "active" ? "Đang diễn ra" : "Sắp diễn ra"}
                            </span>
                          </div>
                          <p className="text-xs text-ink-body">{campaign.description}</p>
                          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-ink-subtle">
                            <span className="inline-flex items-center gap-1">
                              <CalendarRange className="w-3.5 h-3.5" />
                              {formatDateTime(campaign.starts_at)} →{" "}
                              {formatDateTime(campaign.ends_at)}
                            </span>
                            <span className="font-semibold text-brand-primary">
                              Giảm tối thiểu:{" "}
                              {formatDiscountLabel(campaign.discount_type, campaign.discount_value)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left lg:text-right shrink-0">
                        <span className="inline-flex px-3 py-1 rounded-full bg-brand-subtle text-brand-primary text-xs font-bold">
                          {activeCount} / {services.length} dịch vụ đang tham gia
                        </span>
                      </div>
                    </div>

                    {/* Danh sách từng dịch vụ của NCC */}
                    {services.length === 0 ? (
                      <div className="p-6 text-sm text-ink-subtle">
                        Bạn chưa có dịch vụ nào. Hãy tạo dịch vụ trước để đăng ký khuyến mãi.
                      </div>
                    ) : (
                      <div className="divide-y divide-border-subtle">
                        {services.map((svc) => {
                          const key = `${campaign.id}_${svc.id}`;
                          const participation = campaign.participations?.find(
                            (p) => p.service_id === svc.id,
                          );
                          const isJoined = Boolean(participation?.is_active);
                          const otherCampaignName = !isJoined ? otherActiveByService[svc.id] : null;
                          const isApprovedService = svc.status === "active";
                          const statusCfg = SERVICE_STATUS_CONFIG[svc.status] || {
                            label: svc.status,
                            badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                          };
                          const draftNum = Number(draftValues[key] ?? campaign.discount_value);
                          const isBoosted = draftNum > campaign.discount_value;
                          const isSaving = savingKey === key;

                          return (
                            <div
                              key={svc.id}
                              className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {svc.cover_image ? (
                                  <img
                                    src={svc.cover_image}
                                    alt={svc.name}
                                    className="w-12 h-12 rounded-xl object-cover border border-border-subtle shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <div className="font-semibold text-sm text-ink-primary truncate">
                                    {svc.name}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-subtle mt-1">
                                    <span>
                                      Giá gốc: {Number(svc.base_price).toLocaleString("vi-VN")} ₫ /{" "}
                                      {svc.price_unit}
                                    </span>
                                    <span
                                      className={`inline-flex px-2 py-0.5 rounded-full border text-[11px] font-semibold ${statusCfg.badgeClass}`}
                                    >
                                      {statusCfg.label}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                {!isApprovedService ? (
                                  <span className="text-xs font-medium text-ink-subtle bg-slate-100 px-3 py-1.5 rounded-lg">
                                    Chỉ dịch vụ đã duyệt mở bán mới được tham gia
                                  </span>
                                ) : otherCampaignName ? (
                                  <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                                    Đang tham gia: {otherCampaignName}
                                  </span>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs font-semibold text-ink-subtle">
                                        Mức giảm ({campaign.discount_type === "fixed" ? "₫" : "%"}):
                                      </label>
                                      <input
                                        type="number"
                                        min={campaign.discount_value}
                                        max={campaign.discount_type === "percent" ? 90 : undefined}
                                        value={draftValues[key] ?? ""}
                                        onChange={(e) =>
                                          setDraftValues((prev) => ({
                                            ...prev,
                                            [key]: e.target.value,
                                          }))
                                        }
                                        className="w-24 px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs font-semibold text-ink-primary outline-hidden focus:border-brand-primary"
                                      />
                                      {isBoosted && (
                                        <span
                                          title="Mức giảm cao hơn chuẩn chiến dịch -> được ưu tiên trên Trang chủ"
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold"
                                        >
                                          <TrendingUp className="w-3 h-3" />
                                          Ưu tiên
                                        </span>
                                      )}
                                    </div>

                                    {isJoined ? (
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          disabled={isSaving}
                                          onClick={() => handleToggleOrSave(campaign, svc, true)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                                        >
                                          {isSaving && (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          )}
                                          Cập nhật
                                        </button>
                                        <button
                                          type="button"
                                          disabled={isSaving}
                                          onClick={() => handleToggleOrSave(campaign, svc, false)}
                                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-status-danger border border-rose-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                                        >
                                          Ngưng tham gia
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={isSaving}
                                        onClick={() => handleToggleOrSave(campaign, svc, true)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                                      >
                                        {isSaving && (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        )}
                                        Tham gia chiến dịch
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
