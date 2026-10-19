import React from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import Typography from "../../../components/ui/Typography";

/**
 * Component biểu mẫu Đăng ký tài khoản (Web Portal)
 */
export default function RegisterForm({
  role = "provider",
  setRole,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  businessName,
  setBusinessName,
  businessType,
  setBusinessType,
  password,
  setPassword,
  passwordConfirmation,
  setPasswordConfirmation,
  showPassword,
  setShowPassword,
  fieldErrors = {},
  isSubmitting,
  onSubmit,
  onResetFeedback,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Chọn vai trò */}
      <div>
        <Typography variant="label" className="block mb-2">
          Bạn đăng ký với vai trò nào?
        </Typography>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("provider")}
            className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
              role === "provider"
                ? "border-brand-primary bg-brand-light/40"
                : "border-border-subtle bg-surface-elevated hover:bg-surface-base"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Typography variant="label" as="span">
                Nhà cung cấp
              </Typography>
              {role === "provider" && <CheckCircle2 className="w-4 h-4 text-brand-primary" />}
            </div>
            <Typography variant="caption" className="block text-ink-subtle">
              Đăng bán tour, phòng lưu trú và quét vé QR
            </Typography>
          </button>

          <button
            type="button"
            onClick={() => setRole("tourist")}
            className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
              role === "tourist"
                ? "border-brand-primary bg-brand-light/40"
                : "border-border-subtle bg-surface-elevated hover:bg-surface-base"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Typography variant="label" as="span">
                Khách du lịch
              </Typography>
              {role === "tourist" && <CheckCircle2 className="w-4 h-4 text-brand-primary" />}
            </div>
            <Typography variant="caption" className="block text-ink-subtle">
              Đặt chuyến đi, chia sẻ bài viết và nhận hoa hồng
            </Typography>
          </button>
        </div>
      </div>

      {/* Họ và tên */}
      <div>
        <Typography variant="label" htmlFor="register-name" className="block mb-1.5">
          Họ và tên người đại diện
        </Typography>
        <input
          id="register-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            onResetFeedback?.();
          }}
          placeholder="Ví dụ: Trần Hoàng Việt"
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-hidden focus:ring-2 focus:ring-brand-primary/20 ${
            fieldErrors.name
              ? "border-status-danger bg-rose-50/30"
              : "border-border-subtle bg-surface-elevated focus:border-brand-primary"
          }`}
        />
        {fieldErrors.name && (
          <Typography variant="caption" className="text-status-danger mt-1">
            {fieldErrors.name}
          </Typography>
        )}
      </div>

      {/* Thông tin nhà cung cấp */}
      {role === "provider" && (
        <div className="p-3.5 rounded-lg bg-surface-muted border border-border-subtle space-y-3">
          <div>
            <Typography variant="label" htmlFor="register-business-name" className="block mb-1.5">
              Tên doanh nghiệp / Thương hiệu lữ hành
            </Typography>
            <input
              id="register-business-name"
              type="text"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                onResetFeedback?.();
              }}
              placeholder="Ví dụ: Đà Nẵng Ocean Retreat & Travel"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-hidden focus:ring-2 focus:ring-brand-primary/20 bg-surface-elevated ${
                fieldErrors.business_name
                  ? "border-status-danger bg-rose-50/30"
                  : "border-border-subtle focus:border-brand-primary"
              }`}
            />
            {fieldErrors.business_name && (
              <Typography variant="caption" className="text-status-danger mt-1">
                {fieldErrors.business_name}
              </Typography>
            )}
          </div>

          <div>
            <Typography variant="label" htmlFor="register-business-type" className="block mb-1.5">
              Mô hình dịch vụ chủ đạo
            </Typography>
            <select
              id="register-business-type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface-elevated text-sm transition-colors outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            >
              <option value="Tour biển đảo & Nghỉ dưỡng">Tour biển đảo & Nghỉ dưỡng</option>
              <option value="Khách sạn & Homestay ven biển">Khách sạn & Homestay ven biển</option>
              <option value="Cano & Dịch vụ trải nghiệm">Cano & Dịch vụ trải nghiệm</option>
              <option value="Ẩm thực & Sự kiện địa phương">Ẩm thực & Sự kiện địa phương</option>
            </select>
          </div>
        </div>
      )}

      {/* Email & Số điện thoại */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Typography variant="label" htmlFor="register-email" className="block mb-1.5">
            Email xác thực
          </Typography>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              onResetFeedback?.();
            }}
            placeholder="viet@doitac.vn"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-hidden focus:ring-2 focus:ring-brand-primary/20 ${
              fieldErrors.email
                ? "border-status-danger bg-rose-50/30"
                : "border-border-subtle bg-surface-elevated focus:border-brand-primary"
            }`}
          />
          {fieldErrors.email && (
            <Typography variant="caption" className="text-status-danger mt-1">
              {fieldErrors.email}
            </Typography>
          )}
        </div>

        <div>
          <Typography variant="label" htmlFor="register-phone" className="block mb-1.5">
            Số điện thoại
          </Typography>
          <input
            id="register-phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              onResetFeedback?.();
            }}
            placeholder="0912 345 678"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface-elevated text-sm transition-colors outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Mật khẩu & Nhập lại mật khẩu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Typography variant="label" htmlFor="register-password" className="block mb-1.5">
            Mật khẩu mới
          </Typography>
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              onResetFeedback?.();
            }}
            placeholder="Tối thiểu 8 ký tự"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-hidden focus:ring-2 focus:ring-brand-primary/20 ${
              fieldErrors.password
                ? "border-status-danger bg-rose-50/30"
                : "border-border-subtle bg-surface-elevated focus:border-brand-primary"
            }`}
          />
          {fieldErrors.password && (
            <Typography variant="caption" className="text-status-danger mt-1">
              {fieldErrors.password}
            </Typography>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Typography variant="label" htmlFor="register-password-confirm">
              Xác nhận
            </Typography>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-brand-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <input
            id="register-password-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => {
              setPasswordConfirmation(e.target.value);
              onResetFeedback?.();
            }}
            placeholder="Nhập lại mật khẩu"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-hidden focus:ring-2 focus:ring-brand-primary/20 ${
              fieldErrors.password_confirmation
                ? "border-status-danger bg-rose-50/30"
                : "border-border-subtle bg-surface-elevated focus:border-brand-primary"
            }`}
          />
          {fieldErrors.password_confirmation && (
            <Typography variant="caption" className="text-status-danger mt-1">
              {fieldErrors.password_confirmation}
            </Typography>
          )}
        </div>
      </div>

      {/* Nút Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 py-3 px-4 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all shadow-md shadow-brand-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang khởi tạo tài khoản...</span>
          </>
        ) : (
          <span>
            {role === "provider" ? "Mở tài khoản Nhà cung cấp" : "Đăng ký tài khoản Khách du lịch"}
          </span>
        )}
      </button>
    </form>
  );
}
