import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import ProviderLayout from "../layouts/ProviderLayout";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";
import providerAvailabilityApi from "../services/providerAvailabilityApi";
import {
  ROOM_RANK_OPTIONS,
  createEmptyRoomType,
  formatCurrencyVnd,
} from "../models/serviceFormModel";

function formatYmd(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ServiceAvailabilityPage() {
  const { id: serviceId } = useParams();
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [serviceInfo, setServiceInfo] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [activeTab, setActiveTab] = useState("calendar"); // 'calendar' | 'rooms'

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Bulk / Single Day Form State
  const [startDate, setStartDate] = useState(() => formatYmd(new Date()));
  const [endDate, setEndDate] = useState(() => formatYmd(new Date()));
  const [totalSlots, setTotalSlots] = useState("15");
  const [priceOverride, setPriceOverride] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  // Room Type Quick Add Form
  const [newRoom, setNewRoom] = useState(() => createEmptyRoomType());

  const monthRange = useMemo(() => {
    const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const last = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    return {
      from: formatYmd(first),
      to: formatYmd(last),
      daysInMonth: last.getDate(),
      startWeekday: first.getDay(), // 0 = Sun
    };
  }, [currentMonth]);

  const loadAvailability = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await providerAvailabilityApi.getAvailability(
        serviceId,
        monthRange.from,
        monthRange.to,
      );
      const svc = res?.data?.service || null;
      setServiceInfo(svc);
      setAvailabilities(res?.data?.availabilities || []);

      if (svc && (svc.type === "hotel" || svc.type === "homestay")) {
        const roomRes = await providerAvailabilityApi.listRoomTypes(serviceId);
        setRoomTypes(roomRes?.data || []);
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.message || "Không thể tải lịch phục vụ của dịch vụ.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [serviceId, monthRange.from, monthRange.to]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const availabilityMap = useMemo(() => {
    const map = {};
    availabilities.forEach((item) => {
      map[item.available_date] = item;
    });
    return map;
  }, [availabilities]);

  const handleSelectCalendarDay = (dateStr) => {
    setStartDate(dateStr);
    setEndDate(dateStr);
    const existing = availabilityMap[dateStr];
    if (existing) {
      setTotalSlots(String(existing.total_slots));
      setPriceOverride(existing.price_override ? String(Number(existing.price_override)) : "");
      setIsBlocked(Boolean(existing.is_blocked));
    } else {
      setPriceOverride("");
      setIsBlocked(false);
    }
  };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      await providerAvailabilityApi.upsertAvailability(serviceId, {
        start_date: startDate,
        end_date: endDate || startDate,
        total_slots: Number(totalSlots || 0),
        price_override: priceOverride !== "" ? Number(priceOverride) : null,
        is_blocked: Boolean(isBlocked),
      });
      setFeedback({
        type: "success",
        message: "Đã cập nhật lịch phục vụ & giá theo ngày thành công.",
      });
      await loadAvailability();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.message || "Không thể cập nhật lịch phục vụ.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRoomType = async (e) => {
    e.preventDefault();
    if (!newRoom.name.trim() || !newRoom.base_price) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await providerAvailabilityApi.createRoomType(serviceId, {
        name: newRoom.name.trim(),
        rank: newRoom.rank,
        description: newRoom.description?.trim() || null,
        base_price: Number(newRoom.base_price),
        total_rooms: Number(newRoom.total_rooms || 1),
        inventory: Number(newRoom.inventory || newRoom.total_rooms || 1),
        capacity_adults: Number(newRoom.capacity_adults || 2),
        capacity_children: Number(newRoom.capacity_children || 0),
        status: "active",
      });
      setNewRoom(createEmptyRoomType());
      setFeedback({ type: "success", message: "Đã thêm hạng phòng mới thành công." });
      await loadAvailability();
    } catch (err) {
      setFeedback({ type: "error", message: err?.message || "Không thể thêm hạng phòng." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoomType = async (roomTypeId) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await providerAvailabilityApi.deleteRoomType(serviceId, roomTypeId);
      setFeedback({ type: "success", message: "Đã xóa hạng phòng." });
      await loadAvailability();
    } catch (err) {
      setFeedback({ type: "error", message: err?.message || "Không thể xóa hạng phòng." });
    } finally {
      setIsSaving(false);
    }
  };

  const isAccommodation = serviceInfo?.type === "hotel" || serviceInfo?.type === "homestay";

  return (
    <ProviderLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/provider/services")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-subtle hover:text-brand-primary mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại Quản lý dịch vụ
            </button>
            <Typography variant="h1">
              {serviceInfo?.name || "Cấu hình Lịch phục vụ & Giá"}
            </Typography>
            {serviceInfo && (
              <Typography variant="body-sm" className="text-ink-subtle mt-1">
                Giá cơ sở: <strong>{formatCurrencyVnd(serviceInfo.base_price)}</strong> /{" "}
                {serviceInfo.price_unit}
              </Typography>
            )}
          </div>

          {isAccommodation && (
            <div className="inline-flex p-1 rounded-full bg-surface-elevated shadow-xs self-start">
              <button
                type="button"
                onClick={() => setActiveTab("calendar")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === "calendar"
                    ? "bg-brand-primary text-white"
                    : "text-ink-subtle hover:text-ink-primary"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Lịch & Giá theo ngày
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rooms")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === "rooms"
                    ? "bg-brand-primary text-white"
                    : "text-ink-subtle hover:text-ink-primary"
                }`}
              >
                <BedDouble className="w-3.5 h-3.5" />
                Hạng phòng ({roomTypes.length})
              </button>
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-2.5 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-status-success-bg text-status-success"
                : "bg-status-danger-bg text-status-danger"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-[420px]" rounded="rounded-3xl" />
            <Skeleton className="h-[420px]" rounded="rounded-3xl" />
          </div>
        ) : activeTab === "calendar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Calendar Grid */}
            <div className="lg:col-span-2 bg-surface-elevated rounded-3xl p-5 sm:p-6 shadow-[0_6px_24px_rgba(15,23,42,0.05)] space-y-5">
              <div className="flex items-center justify-between">
                <Typography variant="h3" className="text-ink-primary">
                  Tháng {currentMonth.getMonth() + 1} / {currentMonth.getFullYear()}
                </Typography>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                      )
                    }
                    className="p-2 rounded-full bg-surface-muted hover:bg-brand-light text-ink-primary transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                      )
                    }
                    className="p-2 rounded-full bg-surface-muted hover:bg-brand-light text-ink-primary transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-ink-subtle">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: monthRange.startWeekday }).map((_, idx) => (
                  <div key={`empty-${idx}`} />
                ))}

                {Array.from({ length: monthRange.daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateObj = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    dayNum,
                  );
                  const dateStr = formatYmd(dateObj);
                  const entry = availabilityMap[dateStr];
                  const isSelected = dateStr >= startDate && dateStr <= (endDate || startDate);
                  const hasOverride = Boolean(entry?.price_override);
                  const blocked = Boolean(entry?.is_blocked);

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => handleSelectCalendarDay(dateStr)}
                      className={`p-2 rounded-2xl text-left transition-all min-h-[74px] flex flex-col justify-between ${
                        isSelected
                          ? "bg-brand-primary text-white shadow-sm"
                          : blocked
                            ? "bg-status-danger-bg/60 text-status-danger"
                            : entry
                              ? "bg-brand-subtle/70 hover:bg-brand-light/70 text-ink-primary"
                              : "bg-surface-muted/50 hover:bg-surface-muted text-ink-primary"
                      }`}
                    >
                      <span className="text-xs font-bold">{dayNum}</span>
                      {entry ? (
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-medium opacity-85">
                            {blocked
                              ? "Đóng bán"
                              : `${entry.booked_slots}/${entry.total_slots} chỗ`}
                          </div>
                          <div
                            className={`text-[10px] font-bold truncate ${
                              !isSelected && hasOverride ? "text-secondary-warm" : ""
                            }`}
                          >
                            {Number(entry.effective_price).toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] opacity-55">Mặc định</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Config Panel */}
            <form
              onSubmit={handleSaveAvailability}
              className="bg-surface-elevated rounded-3xl p-6 shadow-[0_6px_24px_rgba(15,23,42,0.05)] space-y-5"
            >
              <Typography variant="h3" className="text-ink-primary">
                Cập nhật Lịch & Giá
              </Typography>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted/70 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted/70 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                  Số lượng chỗ mở bán
                </label>
                <input
                  type="number"
                  min="0"
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted/70 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                  Giá tùy chỉnh theo ngày (VND - bỏ trống dùng giá gốc)
                </label>
                <input
                  type="number"
                  min="0"
                  value={priceOverride}
                  onChange={(e) => setPriceOverride(e.target.value)}
                  placeholder="VD: 850000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted/70 text-sm"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-muted/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBlocked}
                  onChange={(e) => setIsBlocked(e.target.checked)}
                  className="rounded text-status-danger"
                />
                <span className="text-sm font-medium text-ink-primary">
                  Đóng bán / Ngày nghỉ (Không nhận khách)
                </span>
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-full bg-brand-primary text-white text-sm font-semibold hover:bg-brand-hover shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Lưu cấu hình lịch
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Add Room Type */}
            <form
              onSubmit={handleCreateRoomType}
              className="bg-surface-elevated rounded-3xl p-6 shadow-[0_6px_24px_rgba(15,23,42,0.05)] space-y-4"
            >
              <Typography variant="h3" className="text-ink-primary">
                Thêm Hạng phòng mới
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <input
                  type="text"
                  required
                  value={newRoom.name}
                  onChange={(e) => setNewRoom((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Tên hạng phòng..."
                  className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-surface-muted/70 text-sm"
                />
                <select
                  value={newRoom.rank}
                  onChange={(e) => setNewRoom((p) => ({ ...p, rank: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-muted/70 text-sm"
                >
                  {ROOM_RANK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  required
                  value={newRoom.base_price}
                  onChange={(e) => setNewRoom((p) => ({ ...p, base_price: e.target.value }))}
                  placeholder="Giá phòng (VND)"
                  className="px-3.5 py-2.5 rounded-xl bg-surface-muted/70 text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-primary text-white text-sm font-semibold hover:bg-brand-hover"
                >
                  <Plus className="w-4 h-4" />
                  Thêm hạng phòng
                </button>
              </div>
            </form>

            {/* Room Types List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {roomTypes.map((room) => (
                <div
                  key={room.id}
                  className="bg-surface-elevated rounded-3xl p-5 shadow-[0_6px_24px_rgba(15,23,42,0.05)] flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase text-secondary-lagoon">
                      {room.rank}
                    </span>
                    <Typography variant="h3" className="text-ink-primary">
                      {room.name}
                    </Typography>
                    <div className="text-sm font-bold text-brand-primary">
                      {formatCurrencyVnd(room.base_price)} / {serviceInfo?.price_unit}
                    </div>
                    <div className="text-xs text-ink-subtle">
                      Tổng {room.total_rooms} phòng · Còn trống {room.inventory} ·{" "}
                      {room.capacity_adults} người lớn, {room.capacity_children} trẻ em
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRoomType(room.id)}
                    className="p-2 rounded-full bg-surface-muted text-status-danger hover:bg-status-danger-bg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
