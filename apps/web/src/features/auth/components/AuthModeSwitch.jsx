import React from "react";
import Typography from "../../../components/ui/Typography";

/**
 * Component thanh chuyển đổi giữa Đăng nhập và Đăng ký (Web Portal)
 */
export default function AuthModeSwitch({ mode = "login", onSwitchMode }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-8">
      <div className="inline-flex p-1 rounded-lg bg-surface-muted border border-border-subtle">
        <button
          type="button"
          onClick={() => onSwitchMode("login")}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
            mode === "login"
              ? "bg-surface-elevated text-ink-primary border border-border-subtle shadow-xs"
              : "text-ink-subtle hover:text-ink-primary"
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode("register")}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
            mode === "register"
              ? "bg-surface-elevated text-ink-primary border border-border-subtle shadow-xs"
              : "text-ink-subtle hover:text-ink-primary"
          }`}
        >
          Đăng ký tài khoản
        </button>
      </div>

      <Typography variant="caption" className="hidden sm:inline-block text-ink-subtle">
        Phiên bản Web v1.0
      </Typography>
    </div>
  );
}
