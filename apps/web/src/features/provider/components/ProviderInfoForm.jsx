import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Typography from "../../../components/ui/Typography";

const VN_PHONE_REGEX = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

/**
 * Biểu mẫu chỉnh sửa thông tin Cơ sở kinh doanh & Người đại diện
 * Nhận dữ liệu qua props, phát sự kiện onSubmit ngược lên Orchestrator (Props Down, Events Up)
 */
export default function ProviderInfoForm({ user, isSubmitting, onSubmit, feedback }) {
  const [formData, setFormData] = useState({
    representative_name: "",
    business_name: "",
    phone: "",
    address: "",
    description: "",
  });

  const [fieldError, setFieldError] = useState("");

  // Đồng bộ dữ liệu khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        representative_name: user.provider_profile?.representative_name || user.name || "",
        business_name: user.provider_profile?.business_name || user.name || "",
        phone: user.phone || user.provider_profile?.phone || "",
        address: user.provider_profile?.address || "",
        description: user.provider_profile?.description || user.tourist_profile?.bio || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldError) setFieldError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFieldError("");

    if (!formData.representative_name.trim()) {
      setFieldError("Vui lòng nhập họ và tên người đại diện pháp luật.");
      return;
    }

    if (!formData.business_name.trim()) {
      setFieldError("Vui lòng nhập tên cơ sở kinh doanh / thương hiệu du lịch.");
      return;
    }

    if (formData.phone && !VN_PHONE_REGEX.test(formData.phone.replace(/\s+/g, ""))) {
      setFieldError("Số điện thoại không đúng định dạng di động Việt Nam (ví dụ: 0912345678).");
      return;
    }

    onSubmit?.({
      name: formData.name.trim(),
      business_name: formData.business_name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      bio: formData.description.trim(),
      description: formData.description.trim(),
    });
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        name: user.name || user.provider_profile?.representative_name || "",
        business_name: user.provider_profile?.business_name || user.name || "",
        phone: user.phone || user.provider_profile?.phone || "",
        address: user.provider_profile?.address || "",
        description: user.provider_profile?.description || user.tourist_profile?.bio || "",
      });
      setFieldError("");
    }
  };

  const activeError = fieldError || (feedback?.type === "error" ? feedback.message : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông báo kết quả thao tác */}
      {feedback?.type === "success" && (
        <div className="p-4 rounded-lg text-sm font-medium flex items-start gap-3 bg-emerald-50 text-status-success border border-emerald-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{feedback.message}</span>
        </div>
      )}

      {activeError && (
        <div className="p-4 rounded-lg text-sm font-medium flex items-start gap-3 bg-rose-50 text-status-danger border border-rose-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{activeError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Tên cơ sở kinh doanh */}
        <div className="sm:col-span-2">
          <Typography variant="label" as="label" htmlFor="business_name" className="block mb-1.5">
            Tên cơ sở kinh doanh / Thương hiệu du lịch <span className="text-status-danger">*</span>
          </Typography>
          <input
            id="business_name"
            name="business_name"
            type="text"
            value={formData.business_name}
            onChange={handleChange}
            placeholder="Ví dụ: Danang Green Travel, Khách sạn Biển Vàng..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface-elevated text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>

        {/* Họ tên người đại diện */}
        <div>
          <Typography variant="label" as="label" htmlFor="name" className="block mb-1.5">
            Họ và tên người đại diện pháp luật <span className="text-status-danger">*</span>
          </Typography>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.representative_name}
            onChange={handleChange}
            placeholder="Ví dụ: Nguyễn Văn An"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface-elevated text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>

        {/* Số điện thoại liên hệ */}
        <div>
          <Typography variant="label" as="label" htmlFor="phone" className="block mb-1.5">
            Chăm sóc khách hàng <span className="text-status-danger">*</span>
          </Typography>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Ví dụ: 0912345678"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface-elevated text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>

        {/* Địa chỉ cơ sở */}
        <div className="sm:col-span-2">
          <Typography variant="label" as="label" htmlFor="address" className="block mb-1.5">
            Địa chỉ trụ sở / cơ sở hoạt động
          </Typography>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface-elevated text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>

        {/* Mô tả giới thiệu */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <Typography variant="label" as="label" htmlFor="description">
              Mô tả giới thiệu cơ sở du lịch / Doanh nghiệp
            </Typography>
            <Typography variant="caption" className="text-ink-subtle">
              {formData.description.length}/500 ký tự
            </Typography>
          </div>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={500}
            value={formData.description}
            onChange={handleChange}
            placeholder="Mô tả ngắn gọn về kinh nghiệm tổ chức tour, tiêu chuẩn phòng ốc, thế mạnh dịch vụ để tạo niềm tin cho du khách..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface-elevated text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-y"
          />
        </div>
      </div>

      {/* Hành động */}
      <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-border-subtle hover:bg-slate-50 text-xs font-semibold text-ink-body transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-ink-subtle" />
          <span>Khôi phục ban đầu</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu thay đổi...</span>
            </>
          ) : (
            <span>Lưu thay đổi hồ sơ</span>
          )}
        </button>
      </div>
    </form>
  );
}
