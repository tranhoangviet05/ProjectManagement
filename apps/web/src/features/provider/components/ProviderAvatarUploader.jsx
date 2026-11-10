import React, { useRef, useState } from "react";
import { Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Typography from "../../../components/ui/Typography";

/**
 * Component quản lý & tải lên ảnh đại diện của Đối tác
 * Tuân thủ quy chuẩn Single Responsibility & Intentional Icon Usage
 */
export default function ProviderAvatarUploader({ user, isUploading, onUploadFile, feedback }) {
  const fileInputRef = useRef(null);
  const [localFeedback, setLocalFeedback] = useState(null);

  const businessDisplayName =
    user?.provider_profile?.business_name || user?.name || "Cơ sở kinh doanh";
  const avatarUrl = user?.avatar_url || user?.avatar;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalFeedback(null);

    // Kiểm tra định dạng
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setLocalFeedback({
        type: "error",
        message: "Định dạng không hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc WEBP.",
      });
      return;
    }

    // Kiểm tra dung lượng tối đa 2MB
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setLocalFeedback({
        type: "error",
        message: "Dung lượng ảnh vượt quá 2MB. Vui lòng nén hoặc chọn ảnh nhỏ hơn.",
      });
      return;
    }

    onUploadFile?.(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const activeFeedback = feedback || localFeedback;

  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-6 text-center shadow-2xs">
      {/* Vùng Avatar có nút Camera overlay */}
      <div className="relative inline-block mx-auto mb-4 group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm mx-auto bg-slate-100 flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={businessDisplayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-brand-primary/10 text-brand-primary font-bold text-3xl flex items-center justify-center">
              {businessDisplayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Overlay kích hoạt chọn file */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute inset-0 rounded-full bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
          aria-label="Thay đổi ảnh đại diện"
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[11px] font-medium">Thay đổi</span>
            </>
          )}
        </button>

        {/* Hidden input file */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <Typography variant="h3" className="truncate mb-1">
        {businessDisplayName}
      </Typography>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full py-2 px-4 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-50 text-xs font-semibold text-ink-primary transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
            <span>Đang tải ảnh lên...</span>
          </>
        ) : (
          <span>Tải ảnh đại diện mới</span>
        )}
      </button>

      <Typography
        variant="caption"
        className="block text-[11px] text-ink-subtle mt-3 leading-relaxed"
      >
        Hỗ trợ định dạng JPG, PNG, WEBP. Dung lượng tối đa 2MB.
      </Typography>

      {/* Thông báo kết quả tải ảnh */}
      {activeFeedback && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
            activeFeedback.type === "success"
              ? "bg-emerald-50 text-status-success border border-emerald-200"
              : "bg-rose-50 text-status-danger border border-rose-200"
          }`}
        >
          {activeFeedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="text-left">{activeFeedback.message}</span>
        </div>
      )}
    </div>
  );
}
