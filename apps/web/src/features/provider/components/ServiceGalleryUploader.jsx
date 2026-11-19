import React, { useRef } from "react";
import { ImagePlus, Star, Trash2, Film, Loader2 } from "lucide-react";
import Typography from "../../../components/ui/Typography";

export default function ServiceGalleryUploader({
  existingMedia = [],
  pendingFiles = [],
  pendingCoverIndex = null,
  isUploading = false,
  onAddPendingFiles,
  onRemovePendingFile,
  onSelectPendingCover,
  onSetExistingCover,
  onDeleteExistingMedia,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length > 0) {
      onAddPendingFiles?.(selected);
    }
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const dropped = Array.from(event.dataTransfer?.files || []);
    if (dropped.length > 0) {
      onAddPendingFiles?.(dropped);
    }
  };

  return (
    <div className="space-y-5">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border-default hover:border-brand-primary bg-surface-subtle/60 hover:bg-brand-primary/5 rounded-2xl p-8 text-center cursor-pointer transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="mx-auto w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-3">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <ImagePlus className="w-6 h-6" />
          )}
        </div>
        <Typography variant="body-md" className="font-semibold text-ink-primary">
          Kéo thả hoặc nhấn để tải lên album ảnh / video dịch vụ
        </Typography>
        <Typography variant="body-sm" className="text-ink-subtle mt-1">
          Hỗ trợ JPG, PNG, WEBP, MP4 (tối đa 10MB/tệp, tối đa 15 tệp mỗi lượt).
        </Typography>
      </div>

      {/* Danh sách ảnh đã lưu trên máy chủ */}
      {existingMedia.length > 0 && (
        <div className="space-y-2.5">
          <Typography variant="body-sm" className="font-semibold text-ink-primary">
            Album hiện tại ({existingMedia.length} tệp)
          </Typography>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {existingMedia.map((media) => (
              <div
                key={media.id}
                className={`group relative rounded-xl overflow-hidden border bg-surface-card aspect-[4/3] ${
                  media.is_cover
                    ? "border-brand-primary ring-2 ring-brand-primary/25"
                    : "border-border-default"
                }`}
              >
                {media.type === "video" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-2">
                    <Film className="w-7 h-7 mb-1 opacity-80" />
                    <span className="text-xs opacity-75">Video MP4</span>
                  </div>
                ) : (
                  <img src={media.url} alt="Service media" className="w-full h-full object-cover" />
                )}

                {media.is_cover && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-primary text-white shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    Ảnh bìa
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-slate-950/75 via-slate-950/35 to-transparent flex items-center justify-between gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {!media.is_cover && media.type !== "video" ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetExistingCover?.(media.id);
                      }}
                      className="px-2 py-1 rounded-lg text-[11px] font-medium bg-white/95 text-slate-800 hover:bg-white shadow-sm"
                    >
                      Đặt ảnh bìa
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteExistingMedia?.(media.id);
                    }}
                    className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                    title="Xóa tệp"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danh sách file mới chọn chờ upload */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2.5">
          <Typography variant="body-sm" className="font-semibold text-ink-primary">
            Tệp mới chờ tải lên ({pendingFiles.length} tệp)
          </Typography>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {pendingFiles.map((item, idx) => {
              const isCover = pendingCoverIndex === idx;
              return (
                <div
                  key={item.key}
                  className={`relative rounded-xl overflow-hidden border bg-surface-card aspect-[4/3] ${
                    isCover
                      ? "border-brand-primary ring-2 ring-brand-primary/25"
                      : "border-border-default"
                  }`}
                >
                  {item.file.type.startsWith("video/") ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-2">
                      <Film className="w-7 h-7 mb-1 opacity-80" />
                      <span className="text-xs truncate max-w-full px-2">{item.file.name}</span>
                    </div>
                  ) : (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {isCover && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-primary text-white shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                      Chọn làm bìa
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-slate-950/75 to-transparent flex items-center justify-between gap-1.5">
                    {!isCover && !item.file.type.startsWith("video/") ? (
                      <button
                        type="button"
                        onClick={() => onSelectPendingCover?.(idx)}
                        className="px-2 py-1 rounded-lg text-[11px] font-medium bg-white/95 text-slate-800 hover:bg-white shadow-sm"
                      >
                        Đặt ảnh bìa
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => onRemovePendingFile?.(idx)}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                      title="Gỡ tệp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
