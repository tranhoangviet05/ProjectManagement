import React from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Typography from "../../../components/ui/Typography";

/**
 * Component biểu mẫu Đăng nhập (Web Portal)
 */
export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  fieldErrors = {},
  isSubmitting,
  onSubmit,
  onResetFeedback,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Email */}
      <div>
        <Typography variant="label" htmlFor="login-email" className="block mb-1.5">
          Địa chỉ email công vụ / cá nhân
        </Typography>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            onResetFeedback?.();
          }}
          placeholder="ten@congty.vn"
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

      {/* Mật khẩu */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Typography variant="label" htmlFor="login-password">
            Mật khẩu đăng nhập
          </Typography>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-brand-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            {showPassword ? (
              <>
                <EyeOff className="w-3.5 h-3.5" /> Ẩn mật khẩu
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> Xem mật khẩu
              </>
            )}
          </button>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              onResetFeedback?.();
            }}
            placeholder="••••••••"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-hidden focus:ring-2 focus:ring-brand-primary/20 ${
              fieldErrors.password
                ? "border-status-danger bg-rose-50/30"
                : "border-border-subtle bg-surface-elevated focus:border-brand-primary"
            }`}
          />
        </div>
        {fieldErrors.password && (
          <Typography variant="caption" className="text-status-danger mt-1">
            {fieldErrors.password}
          </Typography>
        )}
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
            <span>Đang xác thực thông tin...</span>
          </>
        ) : (
          <span>Đăng nhập vào hệ thống</span>
        )}
      </button>
    </form>
  );
}
