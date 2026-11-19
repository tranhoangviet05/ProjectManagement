import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Typography from "../../../components/ui/Typography";
import ServiceGalleryUploader from "./ServiceGalleryUploader";
import { SERVICE_TYPE_OPTIONS, createInitialServiceForm } from "../models/serviceFormModel";

const STEPS = [
  { id: 1, title: "Thông tin cơ bản" },
  { id: 2, title: "Tiện ích & Lịch trình" },
  { id: 3, title: "Album ảnh & Xuất bản" },
];

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl bg-surface-muted/70 text-ink-primary text-sm placeholder:text-ink-subtle focus:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => createInitialServiceForm(initialService));
  const [existingMedia, setExistingMedia] = useState(initialService?.media || []);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingCoverIndex, setPendingCoverIndex] = useState(null);
  const [tagInputs, setTagInputs] = useState({ amenities: "", includes: "", excludes: "" });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setFormData(createInitialServiceForm(initialService));
    setExistingMedia(initialService?.media || []);
  }, [initialService]);

  const handleFieldChange = (field, value) => {
    setFormError("");
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "type") {
        const matched = SERVICE_TYPE_OPTIONS.find((opt) => opt.value === value);
        if (matched) next.price_unit = matched.defaultUnit;
      }
      return next;
    });
  };

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

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setFormError("Vui lòng nhập tên dịch vụ.");
      return false;
    }
    if (!formData.base_price || Number(formData.base_price) < 0) {
      setFormError("Vui lòng nhập giá cơ sở hợp lệ.");
      return false;
    }
    if (!formData.max_guests || Number(formData.max_guests) < 1) {
      setFormError("Sức chứa tối đa phải lớn hơn hoặc bằng 1.");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setFormError("");
    if (currentStep === 1 && !validateStep1()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleSubmit = async (targetStatus) => {
    setFormError("");
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      category_id: formData.category_id ? Number(formData.category_id) : null,
      location_id: formData.location_id ? Number(formData.location_id) : null,
      status: targetStatus,
      description: formData.description.trim() || null,
      base_price: Number(formData.base_price),
      price_unit: formData.price_unit.trim() || "người",
      max_guests: Number(formData.max_guests),
      duration_days: Number(formData.duration_days || 1),
      duration_nights: Number(formData.duration_nights || 0),
      address: formData.address.trim() || null,
      amenities: formData.amenities,
      includes: formData.includes,
      excludes: formData.excludes,
      schedules: formData.schedules
        .filter((s) => s.title.trim())
        .map((s) => ({
          day_number: Number(s.day_number),
          title: s.title.trim(),
          description: s.description?.trim() || null,
          activities: Array.isArray(s.activities) ? s.activities : [],
        })),
    };

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

  return (
    <div className="bg-surface-elevated rounded-3xl shadow-[0_8px_30px_rgb(15,23,42,0.06)] overflow-hidden">
      {/* Stepper Header */}
      <div className="px-6 py-5 bg-brand-subtle/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
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

        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-ink-subtle hover:text-brand-primary self-start sm:self-auto transition-colors"
        >
          ← Quay lại danh sách
        </button>
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
                placeholder="VD: Tour Lặn Ngắm San Hô Cù Lao Chàm 1 Ngày"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Loại hình dịch vụ <span className="text-status-danger">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleFieldChange("type", e.target.value)}
                className={INPUT_CLASS}
              >
                {SERVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Danh mục trải nghiệm
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleFieldChange("category_id", e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Điểm đến / Khu vực
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

            <div className="grid grid-cols-2 gap-3">
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
                  Đơn vị tính <span className="text-status-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.price_unit}
                  onChange={(e) => handleFieldChange("price_unit", e.target.value)}
                  placeholder="người / phòng"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">
                  Số khách tối đa
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_guests}
                  onChange={(e) => handleFieldChange("max_guests", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Số ngày</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration_days}
                  onChange={(e) => handleFieldChange("duration_days", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Số đêm</label>
                <input
                  type="number"
                  min="0"
                  value={formData.duration_nights}
                  onChange={(e) => handleFieldChange("duration_nights", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Địa chỉ đón khách / Cơ sở lưu trú
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                placeholder="VD: Cảng Cửa Đại, Hội An, Quảng Nam"
                className={INPUT_CLASS}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-7">
            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Mô tả câu chuyện & điểm nhấn trải nghiệm
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Giới thiệu những khoảnh khắc đáng nhớ, cảnh quan nổi bật và lưu ý quan trọng cho du khách..."
                className={INPUT_CLASS}
              />
            </div>

            {/* Tag Lists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { key: "amenities", label: "Tiện ích nổi bật", placeholder: "VD: Wifi miễn phí" },
                { key: "includes", label: "Giá đã bao gồm", placeholder: "VD: Vé tham quan" },
                { key: "excludes", label: "Không bao gồm", placeholder: "VD: Thuế VAT" },
              ].map((group) => (
                <div key={group.key} className="p-4 rounded-2xl bg-surface-muted/60 space-y-3">
                  <label className="block text-sm font-semibold text-ink-primary">
                    {group.label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInputs[group.key]}
                      onChange={(e) =>
                        setTagInputs((prev) => ({ ...prev, [group.key]: e.target.value }))
                      }
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

            {/* Tour Schedules */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body-md" className="font-semibold text-ink-primary">
                    Lịch trình chi tiết theo ngày (khuyên dùng cho Tour)
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
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
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
          {currentStep < 3 ? (
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
