import React from "react";
import { Compass, MapPin, KeyRound, ShieldCheck, QrCode } from "lucide-react";
import Typography from "../../../components/ui/Typography";

/**
 * Component hiển thị không gian thị giác và dữ liệu vận hành bên trái trang Auth (Web Portal)
 */
export default function AuthHeroShowcase({
  destinations = [],
  activeDestIndex = 0,
  setActiveDestIndex,
  demoAccounts = [],
  onSelectDemo,
}) {
  const currentDest = destinations[activeDestIndex] || destinations[0];

  return (
    <aside className="relative lg:w-[52%] bg-surface-obsidian text-ink-inverse flex flex-col justify-between overflow-hidden min-h-[340px] lg:min-h-screen">
      {/* Ảnh nền nhiếp ảnh thực tế */}
      {currentDest && (
        <img
          src={currentDest.image}
          alt={currentDest.name}
          className="absolute inset-0 w-full h-full object-cover opacity-45 transition-opacity duration-500"
        />
      )}

      {/* Lớp phủ chuyển màu bảo vệ độ tương phản chữ */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-obsidian via-surface-obsidian/75 to-surface-obsidian/40" />

      {/* Header thương hiệu */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/25">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="h3" as="span" className="text-white tracking-tight">
                Social Travel Booking
              </Typography>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-light/20 text-brand-light uppercase tracking-wider">
                Cổng Điều Hành
              </span>
            </div>
            <Typography variant="caption" className="text-slate-300">
              Nền tảng số hóa trải nghiệm du lịch & lưu trú ven biển
            </Typography>
          </div>
        </div>
      </div>

      {/* Thông tin tọa độ và điểm kiểm thử trực tiếp */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-6">
        {/* Hộp dữ liệu điểm đến trực tiếp */}
        {currentDest && (
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-brand-light font-medium">
                <MapPin className="w-4 h-4 text-brand-light" />
                <span>{currentDest.coordinates}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Dữ liệu thực
              </span>
            </div>

            <Typography variant="h2" className="text-white mb-1.5">
              {currentDest.name}
            </Typography>
            <Typography variant="body-sm" className="text-slate-200 mb-4 line-clamp-2">
              {currentDest.caption}
            </Typography>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{currentDest.stats.activeTours}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <QrCode className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">{currentDest.stats.qrCheckin}</span>
              </div>
            </div>
          </div>
        )}

        {/* Khối Điền nhanh tài khoản kiểm thử */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 max-w-lg backdrop-blur">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <Typography variant="label" as="span" className="text-white text-xs font-semibold">
                Tài khoản kiểm thử nhanh (1-Click Fill)
              </Typography>
            </div>
            <Typography variant="caption" className="text-slate-400">
              Môi trường Dev
            </Typography>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {demoAccounts.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => onSelectDemo?.(demo)}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-semibold text-white group-hover:text-brand-light truncate">
                  {demo.label.split("(")[0]}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{demo.roleBadge}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bộ chuyển đổi điểm đến */}
        <div className="flex items-center gap-2 pt-2">
          <Typography variant="caption" className="text-slate-400 mr-2">
            Điểm đến tiêu biểu:
          </Typography>
          {destinations.map((dest, idx) => {
            const isActive = activeDestIndex === idx;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => setActiveDestIndex?.(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-brand-primary text-white"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {dest.name.split(",")[0]}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
