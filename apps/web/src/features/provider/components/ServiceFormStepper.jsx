import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Send,
  Save,
  Loader2,
  AlertCircle,
  BedDouble,
  CalendarDays,
  Sparkles,
  X,
} from "lucide-react";
import Typography from "../../../components/ui/Typography";
import ServiceGalleryUploader from "./ServiceGalleryUploader";
import { useAuth } from "../../../hooks/useAuth";
import apiClient from "../../../lib/apiClient";
import { AmenityIcon } from "../../admin/utils/amenityIcons";
import {
  ROOM_RANK_OPTIONS,
  resolveProviderServiceConfig,
  createEmptyRoomType,
  createInitialServiceForm,
  generate15DayAvailability,
} from "../models/serviceFormModel";

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl bg-surface-muted/70 text-ink-primary text-sm placeholder:text-ink-subtle focus:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all";

const READONLY_INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl bg-surface-muted text-ink-subtle text-sm font-semibold cursor-not-allowed";

export default function ServiceFormStepper({
  initialService = null,
  categories = [],
  locations = [],
  isSubmitting = false,
  onSaveService,
  onUploadMedia,
  onSetExistingCover,
  onDeleteExistingMedia,
  onCancel,
}) {
  const { user } = useAuth();
  const providerConfig = useMemo(
    () => resolveProviderServiceConfig(user?.provider_profile?.business_type),
    [user?.provider_profile?.business_type],
  );

  const isAccommodation = providerConfig.group === "accommodation";
  const isTour = providerConfig.group === "tour";

  const steps = useMemo(() => {
    if (isTour) {
      return [
        { id: 1, title: "Thông tin cơ bản" },
        { id: 2, title: "Lịch phục vụ (15 ngày)" },
        { id: 3, title: "Tiện ích & Lịch trình" },
        { id: 4, title: "Album ảnh & Xuất bản" },
      ];
    }
    if (isAccommodation) {
      return [
        { id: 1, title: "Thông tin cơ bản" },
        { id: 2, title: "Tiện ích & Loại phòng" },
        { id: 3, title: "Album ảnh & Xuất bản" },
      ];
    }
    return [
      { id: 1, title: "Thông tin cơ bản" },
      { id: 2, title: "Tiện ích dịch vụ" },
      { id: 3, title: "Album ảnh & Xuất bản" },
    ];
  }, [isTour, isAccommodation]);

  const lastStepId = steps[steps.length - 1].id;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() =>
    createInitialServiceForm(initialService, providerConfig.group),
  );
  const [existingMedia, setExistingMedia] = useState(initialService?.media || []);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingCoverIndex, setPendingCoverIndex] = useState(null);
  const [tagInputs, setTagInputs] = useState({ amenities: "", includes: "", excludes: "" });
  const [roomAmenityInputs, setRoomAmenityInputs] = useState({});
  const [activityInputs, setActivityInputs] = useState({});
  const [formError, setFormError] = useState("");
  const [catalogOptions, setCatalogOptions] = useState({
    amenities: [],
    roomAmenities: [],
    includes: [],
    excludes: [],
    policies: [],
  });

  const resolvedServiceType = initialService?.type || providerConfig.serviceType || "tour";

  useEffect(() => {
    let mounted = true;
    const svcType = resolvedServiceType;

    Promise.allSettled([
      apiClient.get(`/public/amenities?scope=service&type=${encodeURIComponent(svcType)}`),
      apiClient.get(`/public/amenities?scope=room&type=${encodeURIComponent(svcType)}`),
      apiClient.get(`/public/inclusions?kind=include&type=${encodeURIComponent(svcType)}`),
      apiClient.get(`/public/inclusions?kind=exclude&type=${encodeURIComponent(svcType)}`),
      apiClient.get(`/public/policies?type=${encodeURIComponent(svcType)}`),
    ]).then(([svcAmRes, roomAmRes, incRes, excRes, polRes]) => {
      if (!mounted) return;
      setCatalogOptions({
        amenities: svcAmRes.status === "fulfilled" ? svcAmRes.value?.data || [] : [],
        roomAmenities: roomAmRes.status === "fulfilled" ? roomAmRes.value?.data || [] : [],
        includes: incRes.status === "fulfilled" ? incRes.value?.data || [] : [],
        excludes: excRes.status === "fulfilled" ? excRes.value?.data || [] : [],
        policies: polRes.status === "fulfilled" ? polRes.value?.data || [] : [],
      });
    });

    return () => {
      mounted = false;
    };
  }, [resolvedServiceType]);

  useEffect(() => {
    setFormData(createInitialServiceForm(initialService, providerConfig.group));
    setExistingMedia(initialService?.media || []);
    setCurrentStep(1);
  }, [initialService, providerConfig.group]);

  const filteredCategories = useMemo(() => {
    const svcType = resolvedServiceType;
    if (!svcType) return categories;
    return categories.filter(
      (cat) =>
        !Array.isArray(cat.applicable_types) ||
        cat.applicable_types.length === 0 ||
        cat.applicable_types.includes(svcType),
    );
  }, [categories, resolvedServiceType]);

  const handleTogglePolicy = (policyId) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.policy_ids) ? prev.policy_ids : [];
      const exists = current.includes(policyId);
      return {
        ...prev,
        policy_ids: exists ? current.filter((id) => id !== policyId) : [...current, policyId],
      };
    });
  };

  const handleFieldChange = (field, value) => {
    setFormError("");
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Tag helpers (Service level) ---
  const handleAddTag = (field) => {
    const raw = tagInputs[field].trim();
    if (!raw) return;
    setFormData((prev) => {
      if (prev[field].includes(raw)) return prev;
      return { ...prev, [field]: [...prev[field], raw] };
    });
    setTagInputs((prev) => ({ ...prev, [field]: "" }));
  };

  const handleRemoveTag = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleTogglePresetTag = (field, name) => {
    setFormData((prev) => {
      const exists = prev[field].includes(name);
      return {
        ...prev,
        [field]: exists ? prev[field].filter((t) => t !== name) : [...prev[field], name],
      };
    });
  };

  const handleToggleRoomPresetAmenity = (roomIdx, name) => {
    setFormData((prev) => ({
      ...prev,
      room_types: prev.room_types.map((room, idx) => {
        if (idx !== roomIdx) return room;
        const exists = room.amenities.includes(name);
        return {
          ...room,
          amenities: exists ? room.amenities.filter((a) => a !== name) : [...room.amenities, name],
        };
      }),
    }));
  };

  // --- Room Types helpers (Accommodation Step 2) ---
  const handleAddRoomType = () => {
    setFormError("");
    setFormData((prev) => ({
      ...prev,
      room_types: [...prev.room_types, createEmptyRoomType()],
    }));
  };

  const handleUpdateRoomType = (idx, field, value) => {
    setFormError("");
    setFormData((prev) => ({
      ...prev,
      room_types: prev.room_types.map((room, i) => {
        if (i !== idx) return room;
        const updated = { ...room, [field]: value };
        if (field === "total_rooms" && Number(updated.inventory) > Number(value)) {
          updated.inventory = value;
        }
        return updated;
      }),
    }));
  };

  const handleRemoveRoomType = (idx) => {
    setFormData((prev) => ({
      ...prev,
      room_types: prev.room_types.filter((_, i) => i !== idx),
    }));
  };

  const handleAddRoomAmenity = (roomIdx) => {
    const raw = (roomAmenityInputs[roomIdx] || "").trim();
    if (!raw) return;
    setFormData((prev) => ({
      ...prev,
      room_types: prev.room_types.map((room, i) => {
        if (i !== roomIdx) return room;
        if (room.amenities.includes(raw)) return room;
        return { ...room, amenities: [...room.amenities, raw] };
      }),
    }));
    setRoomAmenityInputs((prev) => ({ ...prev, [roomIdx]: "" }));
  };

  const handleRemoveRoomAmenity = (roomIdx, amenityIdx) => {
    setFormData((prev) => ({
      ...prev,
      room_types: prev.room_types.map((room, i) =>
        i === roomIdx
          ? { ...room, amenities: room.amenities.filter((_, aIdx) => aIdx !== amenityIdx) }
          : room,
      ),
    }));
  };

  // --- Availability helpers (Tour Step 2) ---
  const handleUpdateAvailabilityDay = (idx, field, value) => {
    setFormError("");
    setFormData((prev) => ({
      ...prev,
      availabilities: prev.availabilities.map((day, i) =>
        i === idx ? { ...day, [field]: value } : day,
      ),
    }));
  };

  const handleApplyDefaultSlotsToAll = () => {
    const slots = Math.max(1, Number(formData.daily_slots || 15));
    setFormData((prev) => ({
      ...prev,
      availabilities:
        prev.availabilities.length > 0
          ? prev.availabilities.map((day) => ({
              ...day,
              total_slots: day.is_blocked ? day.total_slots : String(slots),
            }))
          : generate15DayAvailability(slots),
    }));
  };

  // --- Schedule helpers (Tour Step 3) ---
  const handleAddScheduleDay = () => {
    setFormData((prev) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        {
          day_number: prev.schedules.length + 1,
          title: "",
          description: "",
          activities: [],
        },
      ],
    }));
  };

  const handleUpdateSchedule = (idx, field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  };

  const handleRemoveScheduleDay = (idx) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules
        .filter((_, i) => i !== idx)
        .map((item, i) => ({ ...item, day_number: i + 1 })),
    }));
  };

  const handleAddScheduleActivity = (dayIdx) => {
    const raw = (activityInputs[dayIdx] || "").trim();
    if (!raw) return;
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.map((item, i) => {
        if (i !== dayIdx) return item;
        const current = Array.isArray(item.activities) ? item.activities : [];
        return { ...item, activities: [...current, raw] };
      }),
    }));
    setActivityInputs((prev) => ({ ...prev, [dayIdx]: "" }));
  };

  const handleRemoveScheduleActivity = (dayIdx, actIdx) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.map((item, i) =>
        i === dayIdx
          ? {
              ...item,
              activities: (item.activities || []).filter((_, aIdx) => aIdx !== actIdx),
            }
          : item,
      ),
    }));
  };

  // --- Media helpers ---
  const handleAddPendingFiles = (files) => {
    const mapped = files.map((file) => ({
      key: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPendingFiles((prev) => {
      const next = [...prev, ...mapped];
      if (existingMedia.length === 0 && pendingCoverIndex === null && next.length > 0) {
        const firstImgIdx = next.findIndex((item) => !item.file.type.startsWith("video/"));
        if (firstImgIdx !== -1) setPendingCoverIndex(firstImgIdx);
      }
      return next;
    });
  };

  const handleRemovePendingFile = (idx) => {
    setPendingFiles((prev) => {
      const removed = prev[idx];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      const next = prev.filter((_, i) => i !== idx);
      if (pendingCoverIndex === idx) {
        setPendingCoverIndex(null);
      } else if (pendingCoverIndex !== null && pendingCoverIndex > idx) {
        setPendingCoverIndex(pendingCoverIndex - 1);
      }
      return next;
    });
  };

  // --- Validation ---
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setFormError("Vui lòng nhập tên dịch vụ.");
      return false;
    }
    if (!formData.category_id) {
      setFormError("Vui lòng chọn danh mục dịch vụ.");
      return false;
    }
    if (!formData.location_id) {
      setFormError("Vui lòng chọn điểm đến / khu vực.");
      return false;
    }
    if (formData.base_price === "" || Number(formData.base_price) < 0) {
      setFormError("Vui lòng nhập giá cơ sở hợp lệ.");
      return false;
    }
    if (!formData.address.trim()) {
      setFormError("Vui lòng nhập địa chỉ cơ sở / điểm đón khách.");
      return false;
    }
    if (!formData.description.trim()) {
      setFormError("Vui lòng nhập mô tả chi tiết dịch vụ.");
      return false;
    }
    if (isTour && (!formData.daily_slots || Number(formData.daily_slots) < 1)) {
      setFormError("Vui lòng nhập số lượng khách mặc định mỗi ngày (>= 1).");
      return false;
    }
    return true;
  };

  const validateAccommodationRooms = () => {
    if (!isAccommodation) return true;
    if (!formData.room_types || formData.room_types.length === 0) {
      setFormError("Dịch vụ Chỗ ở phải có ít nhất 1 loại phòng.");
      return false;
    }
    for (let i = 0; i < formData.room_types.length; i += 1) {
      const room = formData.room_types[i];
      if (!room.name.trim()) {
        setFormError(`Vui lòng nhập tên cho Loại phòng #${i + 1}.`);
        return false;
      }
      if (room.base_price === "" || Number(room.base_price) < 0) {
        setFormError(`Vui lòng nhập giá hợp lệ cho Loại phòng "${room.name}".`);
        return false;
      }
      if (!room.total_rooms || Number(room.total_rooms) < 1) {
        setFormError(`Tổng số phòng của "${room.name}" phải >= 1.`);
        return false;
      }
      if (!room.capacity_adults || Number(room.capacity_adults) < 1) {
        setFormError(`Sức chứa người lớn của "${room.name}" phải >= 1.`);
        return false;
      }
    }
    return true;
  };

  const handleGoToStep = (targetStep) => {
    setFormError("");
    if (targetStep > 1 && !validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (isAccommodation && targetStep > 2 && !validateAccommodationRooms()) {
      setCurrentStep(2);
      return;
    }
    setCurrentStep(targetStep);
  };

  const handleNextStep = () => {
    handleGoToStep(Math.min(currentStep + 1, lastStepId));
  };

  const handleSubmit = async (targetStatus) => {
    setFormError("");
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateAccommodationRooms()) {
      setCurrentStep(2);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category_id: Number(formData.category_id),
      location_id: Number(formData.location_id),
      status: targetStatus,
      description: formData.description.trim(),
      base_price: Number(formData.base_price),
      address: formData.address.trim(),
      amenities: formData.amenities,
      includes: formData.includes,
      excludes: formData.excludes,
      policy_ids: formData.policy_ids || [],
    };

    if (isAccommodation) {
      payload.room_types = formData.room_types.map((room) => ({
        ...(room.id ? { id: room.id } : {}),
        name: room.name.trim(),
        rank: room.rank || "standard",
        description: room.description?.trim() || null,
        base_price: Number(room.base_price),
        total_rooms: Number(room.total_rooms),
        inventory:
          room.inventory !== ""
            ? Math.min(Number(room.inventory), Number(room.total_rooms))
            : Number(room.total_rooms),
        capacity_adults: Number(room.capacity_adults),
        capacity_children: Number(room.capacity_children || 0),
        amenities: Array.isArray(room.amenities) ? room.amenities : [],
        status: room.status || "active",
      }));
    }

    if (isTour) {
      payload.daily_slots = Number(formData.daily_slots || 15);
      payload.availabilities = formData.availabilities.map((day) => ({
        available_date: day.available_date,
        total_slots: day.is_blocked ? 0 : Number(day.total_slots || 0),
        price_override: day.price_override !== "" ? Number(day.price_override) : null,
        is_blocked: Boolean(day.is_blocked),
      }));
      payload.schedules = formData.schedules
        .filter((s) => s.title.trim())
        .map((s) => ({
          day_number: Number(s.day_number),
          title: s.title.trim(),
          description: s.description?.trim() || null,
          activities: Array.isArray(s.activities) ? s.activities : [],
        }));
    }

    try {
      const savedService = await onSaveService(payload, pendingFiles, pendingCoverIndex);
      if (savedService?.media) {
        setExistingMedia(savedService.media);
      }
      setPendingFiles([]);
      setPendingCoverIndex(null);
    } catch (err) {
      setFormError(err?.message || "Không thể lưu dịch vụ. Vui lòng kiểm tra lại.");
    }
  };

  const handleCoverChange = async (mediaId) => {
    if (!initialService?.id) return;
    const updated = await onSetExistingCover?.(initialService.id, mediaId);
    if (updated) {
      setExistingMedia((prev) => prev.map((m) => ({ ...m, is_cover: m.id === mediaId })));
    }
  };

  const handleMediaDelete = async (mediaId) => {
    if (!initialService?.id) return;
    await onDeleteExistingMedia?.(initialService.id, mediaId);
    setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
  };

  const handleUploadOnlyNow = async () => {
    if (!initialService?.id || pendingFiles.length === 0) return;
    const uploaded = await onUploadMedia?.(
      initialService.id,
      pendingFiles.map((p) => p.file),
      pendingCoverIndex,
    );
    if (uploaded) {
      setExistingMedia((prev) => {
        const resetPrev =
          pendingCoverIndex !== null ? prev.map((m) => ({ ...m, is_cover: false })) : prev;
        return [...resetPrev, ...uploaded];
      });
      setPendingFiles([]);
      setPendingCoverIndex(null);
    }
  };

  const renderTagSection = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { key: "amenities", label: "Tiện nghi", placeholder: "VD: Wifi miễn phí, Điều hòa" },
          { key: "includes", label: "Bao gồm", placeholder: "VD: Ăn sáng, Vé tham quan" },
          { key: "excludes", label: "Không bao gồm", placeholder: "VD: Thuế VAT, Chi phí cá nhân" },
        ].map((group) => (
          <div key={group.key} className="p-4 rounded-2xl bg-surface-muted/60 space-y-3">
            <label className="block text-sm font-semibold text-ink-primary">{group.label}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInputs[group.key]}
                onChange={(e) => setTagInputs((prev) => ({ ...prev, [group.key]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(group.key);
                  }
                }}
                placeholder={group.placeholder}
                className="flex-1 px-3 py-2 rounded-xl bg-surface-elevated text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
              <button
                type="button"
                onClick={() => handleAddTag(group.key)}
                className="px-3 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-hover transition-colors"
              >
                Thêm
              </button>
            </div>
            {catalogOptions[group.key]?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                  Chọn nhanh gợi ý chuẩn hệ thống
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {catalogOptions[group.key].map((preset) => {
                    const selected = formData[group.key].includes(preset.name);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleTogglePresetTag(group.key, preset.name)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          selected
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-surface-elevated text-ink-body border-border-subtle hover:bg-slate-100"
                        }`}
                      >
                        {group.key === "amenities" ? (
                          <AmenityIcon name={preset.icon} className="w-3.5 h-3.5 shrink-0" />
                        ) : group.key === "includes" ? (
                          <Check
                            className={`w-3.5 h-3.5 shrink-0 ${
                              selected ? "text-white" : "text-emerald-600"
                            }`}
                          />
                        ) : (
                          <X
                            className={`w-3.5 h-3.5 shrink-0 ${
                              selected ? "text-white" : "text-rose-600"
                            }`}
                          />
                        )}
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {formData[group.key].map((tag, idx) => (
                <span
                  key={`${group.key}-${tag}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated text-xs font-medium text-ink-primary shadow-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(group.key, idx)}
                    className="text-ink-subtle hover:text-status-danger"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {catalogOptions.policies?.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-muted/60 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-ink-primary">
              Chính sách dịch vụ áp dụng
            </label>
            <p className="text-xs text-ink-subtle mt-0.5">
              Chọn các chính sách thanh toán, hủy/đổi lịch và quy định sử dụng mà doanh nghiệp bạn
              áp dụng cho dịch vụ này.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {catalogOptions.policies.map((pol) => {
              const selected = (formData.policy_ids || []).includes(pol.id);
              return (
                <button
                  key={pol.id}
                  type="button"
                  onClick={() => handleTogglePolicy(pol.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    selected
                      ? "bg-brand-subtle border-brand-primary text-brand-primary"
                      : "bg-surface-elevated border-border-subtle text-ink-body hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      selected ? "bg-brand-primary text-white" : "bg-slate-100 text-ink-subtle"
                    }`}
                  >
                    <AmenityIcon name={pol.icon || "shield-check"} className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-ink-primary leading-snug">
                      {pol.name}
                    </div>
                    {pol.description && (
                      <div className="text-[11px] text-ink-subtle line-clamp-2 mt-0.5">
                        {pol.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-surface-elevated rounded-3xl shadow-[0_8px_30px_rgb(15,23,42,0.06)] overflow-hidden">
      {/* Stepper Header */}
      <div className="px-6 py-5 bg-brand-subtle/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {steps.map((step) => {
            const isDone = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleGoToStep(step.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-primary text-white shadow-sm"
                    : isDone
                      ? "bg-status-success-bg text-status-success"
                      : "bg-surface-elevated text-ink-subtle hover:text-ink-primary"
                }`}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white/20">
                  {isDone ? <Check className="w-3.5 h-3.5" /> : step.id}
                </span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-elevated text-xs font-semibold text-brand-primary shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            {providerConfig.businessLabel} · {providerConfig.fixedPriceUnit}
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold text-ink-subtle hover:text-brand-primary transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {/* Form Error */}
      {formError && (
        <div className="mx-6 mt-5 p-3.5 rounded-2xl bg-status-danger-bg text-status-danger text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Step Content */}
      <div className="p-6 sm:p-8">
        {/* BƯỚC 1: THÔNG TIN CƠ BẢN (Bắt buộc toàn bộ) */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Tên dịch vụ <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder={
                  isAccommodation
                    ? "VD: Khách sạn Biển Vàng Đà Nẵng / Villa Nghỉ Dưỡng Sơn Trà"
                    : "VD: Tour Lặn Ngắm San Hô Cù Lao Chàm 1 Ngày"
                }
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Danh mục trải nghiệm <span className="text-status-danger">*</span>
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleFieldChange("category_id", e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">-- Chọn danh mục --</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Điểm đến / Khu vực <span className="text-status-danger">*</span>
              </label>
              <select
                value={formData.location_id}
                onChange={(e) => handleFieldChange("location_id", e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">-- Chọn điểm đến --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Giá cơ sở (VND) <span className="text-status-danger">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.base_price}
                onChange={(e) => handleFieldChange("base_price", e.target.value)}
                placeholder="650000"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Đơn vị tính
              </label>
              <input
                type="text"
                readOnly
                value={providerConfig.fixedPriceUnit}
                className={READONLY_INPUT_CLASS}
              />
            </div>

            {isTour && (
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">
                  Số lượng khách tối đa mỗi ngày (mặc định 15 ngày tới){" "}
                  <span className="text-status-danger">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.daily_slots}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormError("");
                    setFormData((prev) => ({
                      ...prev,
                      daily_slots: val,
                      availabilities: !initialService?.id
                        ? generate15DayAvailability(Math.max(1, Number(val || 1)))
                        : prev.availabilities,
                    }));
                  }}
                  placeholder="15"
                  className={INPUT_CLASS}
                />
              </div>
            )}

            <div className={isTour ? "" : "md:col-span-2"}>
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Địa chỉ cơ sở / Điểm đón khách <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                placeholder="VD: 218 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng"
                className={INPUT_CLASS}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Mô tả chi tiết dịch vụ <span className="text-status-danger">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Giới thiệu chi tiết trải nghiệm, điểm nhấn, không gian lưu trú và các lưu ý quan trọng cho du khách..."
                className={INPUT_CLASS}
              />
            </div>
          </div>
        )}

        {/* BƯỚC 2 (CHẾ ĐỘ CHỖ Ở): TIỆN ÍCH CHỖ Ở & LOẠI PHÒNG (hotel_room_types) */}
        {isAccommodation && currentStep === 2 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <Typography variant="h3" className="text-ink-primary">
                Tiện ích chung của Chỗ ở
              </Typography>
              {renderTagSection()}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Typography variant="h3" className="text-ink-primary flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-brand-primary" />
                    Danh sách Loại phòng ({formData.room_types.length})
                  </Typography>
                  <Typography variant="body-sm" className="text-ink-subtle mt-0.5">
                    Cấu hình chi tiết hạng phòng, số lượng phòng trống và tiện nghi riêng cho từng
                    loại phòng.
                  </Typography>
                </div>
                <button
                  type="button"
                  onClick={handleAddRoomType}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-primary text-white text-xs font-semibold hover:bg-brand-hover shadow-xs transition-colors self-start"
                >
                  <Plus className="w-4 h-4" />
                  Thêm loại phòng
                </button>
              </div>

              <div className="space-y-5">
                {formData.room_types.map((room, roomIdx) => (
                  <div
                    key={`room-${room.id || roomIdx}`}
                    className="p-5 sm:p-6 rounded-2xl bg-surface-muted/50 space-y-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="px-3 py-1 rounded-full bg-brand-primary text-white text-xs font-bold">
                        Loại phòng #{roomIdx + 1}
                      </span>
                      {formData.room_types.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRoomType(roomIdx)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-status-danger hover:opacity-80"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa phòng
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                          Tên loại phòng <span className="text-status-danger">*</span>
                        </label>
                        <input
                          type="text"
                          value={room.name}
                          onChange={(e) => handleUpdateRoomType(roomIdx, "name", e.target.value)}
                          placeholder="VD: Phòng Deluxe Hướng Biển 2 Người"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                          Hạng phòng (Rank)
                        </label>
                        <select
                          value={room.rank}
                          onChange={(e) => handleUpdateRoomType(roomIdx, "rank", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        >
                          {ROOM_RANK_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                          Giá phòng (VND / {providerConfig.fixedPriceUnit}){" "}
                          <span className="text-status-danger">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={room.base_price}
                          onChange={(e) =>
                            handleUpdateRoomType(roomIdx, "base_price", e.target.value)
                          }
                          placeholder="1450000"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                            Tổng số phòng ngủ <span className="text-status-danger">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={room.total_rooms}
                            onChange={(e) =>
                              handleUpdateRoomType(roomIdx, "total_rooms", e.target.value)
                            }
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                            Phòng trống
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={room.total_rooms || 999}
                            value={room.inventory}
                            onChange={(e) =>
                              handleUpdateRoomType(roomIdx, "inventory", e.target.value)
                            }
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                            Người lớn <span className="text-status-danger">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={room.capacity_adults}
                            onChange={(e) =>
                              handleUpdateRoomType(roomIdx, "capacity_adults", e.target.value)
                            }
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                            Trẻ em
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={room.capacity_children}
                            onChange={(e) =>
                              handleUpdateRoomType(roomIdx, "capacity_children", e.target.value)
                            }
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                          Mô tả loại phòng
                        </label>
                        <input
                          type="text"
                          value={room.description}
                          onChange={(e) =>
                            handleUpdateRoomType(roomIdx, "description", e.target.value)
                          }
                          placeholder="Diện tích, hướng nhìn, loại giường..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                          Trạng thái phòng
                        </label>
                        <select
                          value={room.status}
                          onChange={(e) => handleUpdateRoomType(roomIdx, "status", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        >
                          <option value="active">Đang mở bán (active)</option>
                          <option value="inactive">Tạm ngưng (inactive)</option>
                        </select>
                      </div>
                    </div>

                    {/* Tiện nghi riêng của từng phòng */}
                    <div className="pt-2 space-y-2.5">
                      <label className="block text-xs font-semibold text-ink-primary">
                        Tiện nghi riêng của loại phòng này
                      </label>
                      {catalogOptions.roomAmenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                          {catalogOptions.roomAmenities.map((preset) => {
                            const selected = room.amenities.includes(preset.name);
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleToggleRoomPresetAmenity(roomIdx, preset.name)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                  selected
                                    ? "bg-brand-primary text-white border-brand-primary"
                                    : "bg-surface-elevated text-ink-body border-border-subtle hover:bg-slate-100"
                                }`}
                              >
                                <AmenityIcon name={preset.icon} className="w-3.5 h-3.5 shrink-0" />
                                <span>{preset.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <div className="flex gap-2 max-w-md">
                        <input
                          type="text"
                          value={roomAmenityInputs[roomIdx] || ""}
                          onChange={(e) =>
                            setRoomAmenityInputs((prev) => ({
                              ...prev,
                              [roomIdx]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddRoomAmenity(roomIdx);
                            }
                          }}
                          placeholder="VD: Ban công riêng, Bồn tắm, Smart TV"
                          className="flex-1 px-3 py-2 rounded-xl bg-surface-elevated text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddRoomAmenity(roomIdx)}
                          className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-hover"
                        >
                          Thêm tiện nghi
                        </button>
                      </div>
                      {room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {room.amenities.map((amenity, aIdx) => (
                            <span
                              key={`room-${roomIdx}-amenity-${amenity}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated text-xs font-medium text-ink-primary shadow-xs"
                            >
                              {amenity}
                              <button
                                type="button"
                                onClick={() => handleRemoveRoomAmenity(roomIdx, aIdx)}
                                className="text-ink-subtle hover:text-status-danger"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BƯỚC 2 (CHẾ ĐỘ TOUR): LỊCH PHỤC VỤ 15 NGÀY (service_availability) */}
        {isTour && currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Typography variant="h3" className="text-ink-primary flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-brand-primary" />
                  Lịch phục vụ 15 ngày tới
                </Typography>
                <Typography variant="body-sm" className="text-ink-subtle mt-0.5">
                  Hệ thống tự tạo sẵn 15 ngày kể từ hôm nay. Bạn có thể điều chỉnh số khách tối đa,
                  đánh dấu ngày nghỉ hoặc đổi giá riêng cho từng ngày.
                </Typography>
              </div>
              <button
                type="button"
                onClick={handleApplyDefaultSlotsToAll}
                className="px-4 py-2 rounded-full bg-brand-light text-brand-primary text-xs font-semibold hover:bg-brand-primary hover:text-white transition-colors self-start"
              >
                Áp dụng {formData.daily_slots || 15} khách cho ngày đang mở
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-surface-muted/40 p-2 sm:p-4">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="text-xs font-semibold text-ink-subtle">
                    <th className="py-2.5 px-3">Ngày khởi hành</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3">Số khách tối đa</th>
                    <th className="py-2.5 px-3">Giá riêng ngày này (VND)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-sm">
                  {formData.availabilities.map((day, idx) => (
                    <tr
                      key={day.available_date}
                      className={day.is_blocked ? "opacity-60 bg-surface-muted/60" : ""}
                    >
                      <td className="py-2.5 px-3 font-medium text-ink-primary">
                        {day.displayLabel || day.available_date}
                      </td>
                      <td className="py-2.5 px-3">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!day.is_blocked}
                            onChange={(e) =>
                              handleUpdateAvailabilityDay(idx, "is_blocked", !e.target.checked)
                            }
                            className="rounded text-brand-primary focus:ring-brand-primary"
                          />
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              day.is_blocked
                                ? "bg-status-danger-bg text-status-danger"
                                : "bg-status-success-bg text-status-success"
                            }`}
                          >
                            {day.is_blocked ? "Ngày nghỉ" : "Mở bán"}
                          </span>
                        </label>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          disabled={day.is_blocked}
                          value={day.is_blocked ? "0" : day.total_slots}
                          onChange={(e) =>
                            handleUpdateAvailabilityDay(idx, "total_slots", e.target.value)
                          }
                          className="w-28 px-3 py-1.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:opacity-50"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          disabled={day.is_blocked}
                          value={day.price_override}
                          onChange={(e) =>
                            handleUpdateAvailabilityDay(idx, "price_override", e.target.value)
                          }
                          placeholder={`Mặc định (${Number(formData.base_price || 0).toLocaleString("vi-VN")})`}
                          className="w-52 px-3 py-1.5 rounded-xl bg-surface-elevated text-sm placeholder:text-ink-subtle/70 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BƯỚC 3 (TOUR) HOẶC BƯỚC 2 (PHƯƠNG TIỆN): TIỆN ÍCH & LỊCH TRÌNH */}
        {((isTour && currentStep === 3) || (!isTour && !isAccommodation && currentStep === 2)) && (
          <div className="space-y-7">
            {renderTagSection()}

            {isTour && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body-md" className="font-semibold text-ink-primary">
                      Lịch trình chi tiết theo ngày
                    </Typography>
                    <Typography variant="body-sm" className="text-ink-subtle">
                      Giúp du khách hình dung rõ từng chặng hành trình.
                    </Typography>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddScheduleDay}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-brand-light text-brand-primary text-xs font-semibold hover:bg-brand-primary hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm ngày
                  </button>
                </div>

                {formData.schedules.map((item, idx) => (
                  <div
                    key={`day-${item.day_number}-${idx}`}
                    className="p-4 rounded-2xl bg-surface-muted/50 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="px-3 py-1 rounded-full bg-brand-primary text-white text-xs font-bold">
                        Ngày {item.day_number}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveScheduleDay(idx)}
                        className="text-status-danger hover:opacity-80 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateSchedule(idx, "title", e.target.value)}
                      placeholder="Tiêu đề lịch trình ngày (VD: Cảng Cửa Đại - Bãi Ông)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    />
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => handleUpdateSchedule(idx, "description", e.target.value)}
                      placeholder="Mô tả chi tiết hoạt động trong ngày..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    />

                    {/* Các điểm dừng chân / Hoạt động trong ngày (service_schedules.activities) */}
                    <div className="pt-1 space-y-2.5">
                      <label className="block text-xs font-semibold text-ink-primary">
                        Các điểm dừng chân & hoạt động trong ngày
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={activityInputs[idx] || ""}
                          onChange={(e) =>
                            setActivityInputs((prev) => ({ ...prev, [idx]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddScheduleActivity(idx);
                            }
                          }}
                          placeholder="VD: 08:30 - Tham quan Chùa Linh Ứng / 12:00 - Ăn trưa hải sản"
                          className="flex-1 px-3.5 py-2 rounded-xl bg-surface-elevated text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddScheduleActivity(idx)}
                          className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-hover shrink-0"
                        >
                          + Thêm điểm dừng
                        </button>
                      </div>

                      {Array.isArray(item.activities) && item.activities.length > 0 && (
                        <ul className="space-y-1.5">
                          {item.activities.map((act, actIdx) => (
                            <li
                              key={`day-${idx}-act-${actIdx}`}
                              className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-surface-elevated text-xs text-ink-primary shadow-xs"
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-brand-subtle text-brand-primary font-bold flex items-center justify-center text-[11px] shrink-0">
                                  {actIdx + 1}
                                </span>
                                <span>{act}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveScheduleActivity(idx, actIdx)}
                                className="text-ink-subtle hover:text-status-danger px-1"
                                title="Xóa điểm dừng"
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BƯỚC CUỐI: ALBUM ẢNH & XUẤT BẢN */}
        {currentStep === lastStepId && (
          <div className="space-y-5">
            <ServiceGalleryUploader
              existingMedia={existingMedia}
              pendingFiles={pendingFiles}
              pendingCoverIndex={pendingCoverIndex}
              isUploading={isSubmitting}
              onAddPendingFiles={handleAddPendingFiles}
              onRemovePendingFile={handleRemovePendingFile}
              onSelectPendingCover={setPendingCoverIndex}
              onSetExistingCover={handleCoverChange}
              onDeleteExistingMedia={handleMediaDelete}
            />

            {initialService?.id && pendingFiles.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleUploadOnlyNow}
                  className="px-4 py-2 rounded-full bg-brand-light text-brand-primary text-sm font-semibold hover:bg-brand-primary hover:text-white transition-colors"
                >
                  Tải ngay {pendingFiles.length} tệp lên album
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-surface-muted/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-elevated text-sm font-semibold text-ink-primary hover:bg-surface-muted shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Bước trước
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {currentStep < lastStepId ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-primary text-white text-sm font-semibold hover:bg-brand-hover shadow-sm transition-colors"
            >
              Tiếp tục
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit("draft")}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-surface-elevated text-ink-primary text-sm font-semibold hover:bg-surface-muted shadow-xs disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu nháp
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit("pending_review")}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-secondary-warm text-white text-sm font-semibold hover:bg-secondary-warm-hover shadow-sm disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Gửi Admin duyệt
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
