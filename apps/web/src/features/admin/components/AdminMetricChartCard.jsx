import React, { useState, useEffect } from "react";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";
import adminDashboardApi from "../services/adminDashboardApi";
import { formatCurrencyVnd } from "../../provider/models/serviceFormModel";

const PERIOD_OPTIONS = [
  { id: "7d", label: "7 ngày qua" },
  { id: "month_days", label: "Theo ngày" },
  { id: "12m", label: "Theo tháng" },
  { id: "5y", label: "Theo năm" },
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * Thẻ biểu đồ thống kê độc lập có bộ lọc Ngày / Tháng / Năm riêng cho từng chỉ số.
 */
export default function AdminMetricChartCard({
  metric,
  title,
  subtitle,
  unit = "",
  isCurrency = false,
  accentColor = "bg-brand-primary",
  accentHover = "group-hover:bg-brand-hover",
  initialData = null,
}) {
  const now = new Date();
  const [period, setPeriod] = useState(initialData?.period || "12m");
  const [year, setYear] = useState(initialData?.year || now.getFullYear());
  const [month, setMonth] = useState(initialData?.month || now.getMonth() + 1);

  const [chartData, setChartData] = useState(initialData);
  const [isFetching, setIsFetching] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (initialData) {
      setChartData(initialData);
    }
  }, [initialData]);

  const fetchFilteredChart = async (nextPeriod, nextYear, nextMonth) => {
    setIsFetching(true);
    try {
      const res = await adminDashboardApi.getChartData({
        metric,
        period: nextPeriod,
        year: nextYear,
        month: nextMonth,
      });
      if (res?.data) {
        setChartData(res.data);
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handlePeriodChange = (nextPeriod) => {
    setPeriod(nextPeriod);
    fetchFilteredChart(nextPeriod, year, month);
  };

  const handleYearChange = (nextYear) => {
    const y = Number(nextYear);
    setYear(y);
    fetchFilteredChart(period, y, month);
  };

  const handleMonthChange = (nextMonth) => {
    const m = Number(nextMonth);
    setMonth(m);
    fetchFilteredChart(period, year, m);
  };

  const series = Array.isArray(chartData?.series) ? chartData.series : [];
  const maxVal = Math.max(...series.map((s) => Number(s.value) || 0), 1);
  const totalVal = Number(chartData?.total || 0);
  const prevTotalVal = Number(chartData?.previous_total || 0);
  const growth = Number(chartData?.growth_percent || 0);

  const formatVal = (v) => {
    if (isCurrency) return formatCurrencyVnd(v);
    return `${Number(v).toLocaleString("vi-VN")}${unit ? ` ${unit}` : ""}`;
  };

  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-xs p-5 flex flex-col justify-between gap-5">
      {/* Header & Bộ lọc Ngày / Tháng / Năm riêng */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <Typography variant="h3" className="text-base font-bold text-ink-primary">
            {title}
          </Typography>
          <p className="text-xs text-ink-subtle mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            aria-label={`Chọn chu kỳ thời gian cho ${title}`}
            className="px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs font-semibold text-ink-primary outline-hidden focus:border-brand-primary cursor-pointer"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          {period === "month_days" && (
            <select
              value={month}
              onChange={(e) => handleMonthChange(e.target.value)}
              aria-label={`Chọn tháng cho ${title}`}
              className="px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs font-medium text-ink-primary outline-hidden focus:border-brand-primary cursor-pointer"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          )}

          {period !== "7d" && (
            <select
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
              aria-label={`Chọn năm cho ${title}`}
              className="px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs font-medium text-ink-primary outline-hidden focus:border-brand-primary cursor-pointer"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tổng kỳ hiện tại & % Tăng trưởng so với kỳ trước */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span className="text-xs text-ink-subtle block">Tổng trong kỳ đã chọn</span>
          <span className="text-xl sm:text-2xl font-bold text-ink-primary mt-0.5 block">
            {formatVal(totalVal)}
          </span>
        </div>

        <div className="text-right">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              growth > 0
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : growth < 0
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-slate-100 text-ink-subtle border border-border-subtle"
            }`}
          >
            {growth > 0 ? `+${growth}%` : `${growth}%`} so với kỳ trước
          </span>
          <span className="text-[11px] text-ink-subtle block mt-1">
            Kỳ trước: {formatVal(prevTotalVal)}
          </span>
        </div>
      </div>

      {/* Khu vực Biểu đồ cột tương tác */}
      {isFetching && !chartData ? (
        <Skeleton className="h-48 w-full" rounded="rounded-xl" />
      ) : (
        <div
          className={`relative pt-6 transition-opacity ${isFetching ? "opacity-50" : "opacity-100"}`}
        >
          {/* Tooltip khi hover hoặc điểm cao nhất */}
          <div className="h-5 mb-2 flex items-center justify-between text-xs">
            {hoveredIndex !== null && series[hoveredIndex] ? (
              <div className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-medium">
                {series[hoveredIndex].full_label}:{" "}
                <strong>{formatVal(series[hoveredIndex].value)}</strong>
              </div>
            ) : (
              <span className="text-ink-subtle">Di chuột vào từng cột để xem số liệu chi tiết</span>
            )}
          </div>

          {/* Đồ thị cột chuẩn tỷ lệ */}
          <div className="h-44 flex items-end gap-1 sm:gap-1.5 pt-4 pb-1 px-2 rounded-xl bg-slate-50/70 border border-border-subtle overflow-x-auto">
            {series.map((item, idx) => {
              const val = Number(item.value) || 0;
              const heightPercent = val > 0 ? Math.max(Math.round((val / maxVal) * 100), 8) : 3;
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 min-w-[18px] h-full flex flex-col items-center justify-end group cursor-pointer"
                >
                  <div className="w-full flex-1 flex items-end justify-center px-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all ${
                        val > 0
                          ? `${accentColor} ${accentHover} ${isHovered ? "ring-2 ring-brand-primary/30" : ""}`
                          : "bg-slate-200"
                      }`}
                    />
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] leading-none select-none ${
                      isHovered ? "font-bold text-ink-primary" : "text-ink-subtle"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
