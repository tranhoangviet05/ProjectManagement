import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { colors, radius, spacing, touchTarget } from "../../../theme/tokens";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const FULL_WEEKDAYS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

const ACCOMMODATION_DURATIONS = [
  { id: "1n", label: "1 đêm", days: 1 },
  { id: "2n", label: "2 đêm", days: 2 },
  { id: "3n", label: "3 đêm", days: 3 },
  { id: "7n", label: "1 tuần", days: 7 },
];

const VEHICLE_DURATIONS = [
  { id: "1d", label: "1 ngày", days: 1 },
  { id: "2d", label: "2 ngày", days: 2 },
  { id: "3d", label: "3 ngày", days: 3 },
  { id: "7d", label: "1 tuần", days: 7 },
];

const ENTERTAINMENT_DURATIONS = [
  { id: "day", label: "Trong ngày", days: 0 },
  { id: "2d1n", label: "2 ngày 1 đêm", days: 1 },
  { id: "3d2n", label: "3 ngày 2 đêm", days: 2 },
  { id: "7d", label: "1 tuần", days: 6 },
];

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatFullDateVi(date) {
  if (!date) return "";
  const weekday = FULL_WEEKDAYS[date.getDay()];
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${weekday}, ${d}/${m}/${y}`;
}

export function formatCompactDateVi(date) {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  // Quy đổi Thứ 2 = 0 ... Chủ nhật = 6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export default function ExploreDatePickerModal({
  visible,
  activeCategory,
  startDate,
  endDate,
  durationOption,
  onApply,
  onClose,
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const isRangeCategory = activeCategory === "accommodation" || activeCategory === "vehicle";

  const [draftStart, setDraftStart] = useState(startDate || null);
  const [draftEnd, setDraftEnd] = useState(endDate || null);
  const [draftDuration, setDraftDuration] = useState(durationOption || null);
  const [viewYear, setViewYear] = useState((startDate || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((startDate || today).getMonth());

  useEffect(() => {
    if (visible) {
      setDraftStart(startDate || null);
      setDraftEnd(endDate || null);
      setDraftDuration(durationOption || null);
      const anchor = startDate || today;
      setViewYear(anchor.getFullYear());
      setViewMonth(anchor.getMonth());
    }
  }, [visible, startDate, endDate, durationOption, today]);

  const calendarCells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const canGoPrevMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayPress = (day) => {
    if (!day || day < today) return;

    if (!isRangeCategory) {
      setDraftStart(day);
      if (draftDuration) {
        const matched = ENTERTAINMENT_DURATIONS.find((o) => o.id === draftDuration);
        setDraftEnd(matched && matched.days > 0 ? addDays(day, matched.days) : null);
      } else {
        setDraftEnd(null);
      }
      return;
    }

    // Chế độ khoảng ngày (Chỗ ở / Thuê xe)
    setDraftDuration(null);
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(day);
      setDraftEnd(null);
    } else if (day < draftStart) {
      setDraftStart(day);
      setDraftEnd(null);
    } else if (isSameDay(day, draftStart)) {
      setDraftEnd(addDays(day, 1));
    } else {
      setDraftEnd(day);
    }
  };

  const handleSelectCustomDuration = (opt) => {
    if (activeCategory === "entertainment") {
      const nextId = draftDuration === opt.id ? null : opt.id;
      setDraftDuration(nextId);
      if (nextId && draftStart) {
        setDraftEnd(opt.days > 0 ? addDays(draftStart, opt.days) : null);
      } else {
        setDraftEnd(null);
      }
      return;
    }

    // Chỗ ở / Thuê xe: chọn số đêm hoặc số ngày từ ngày đi (mặc định hôm nay nếu chưa chọn ngày đi)
    const baseStart = draftStart || today;
    setDraftStart(baseStart);
    setDraftEnd(addDays(baseStart, opt.days));
    setDraftDuration(opt.id);
  };

  const durationChoices =
    activeCategory === "accommodation"
      ? ACCOMMODATION_DURATIONS
      : activeCategory === "vehicle"
        ? VEHICLE_DURATIONS
        : activeCategory === "entertainment"
          ? ENTERTAINMENT_DURATIONS
          : [];

  const modalTitle =
    activeCategory === "accommodation"
      ? "Chọn ngày đi – ngày về"
      : activeCategory === "vehicle"
        ? "Chọn ngày nhận – trả xe"
        : "Chọn ngày khởi hành";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <AppText style={styles.title}>{modalTitle}</AppText>
            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Đóng">
              <X size={20} color={colors.inkPrimary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Tóm tắt thứ, ngày/tháng/năm đang chọn */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryCol}>
                <AppText style={styles.summaryLabel}>
                  {activeCategory === "vehicle" ? "Ngày nhận xe" : "Ngày đi"}
                </AppText>
                <AppText style={styles.summaryValue}>
                  {draftStart ? formatFullDateVi(draftStart) : "Chưa chọn (Linh hoạt)"}
                </AppText>
              </View>

              {isRangeCategory || (activeCategory === "entertainment" && draftEnd) ? (
                <View style={styles.summaryCol}>
                  <AppText style={styles.summaryLabel}>
                    {activeCategory === "vehicle" ? "Ngày trả xe" : "Ngày về"}
                  </AppText>
                  <AppText style={styles.summaryValue}>
                    {draftEnd ? formatFullDateVi(draftEnd) : "Chọn trên lịch"}
                  </AppText>
                </View>
              ) : null}
            </View>

            {/* Điều hướng Tháng / Năm */}
            <View style={styles.monthBar}>
              <Pressable
                onPress={handlePrevMonth}
                style={[styles.monthNavBtn, !canGoPrevMonth && styles.monthNavDisabled]}
                disabled={!canGoPrevMonth}
              >
                <ChevronLeft
                  size={18}
                  color={canGoPrevMonth ? colors.inkPrimary : colors.borderStrong}
                />
              </Pressable>
              <AppText style={styles.monthTitle}>
                Tháng {viewMonth + 1}, {viewYear}
              </AppText>
              <Pressable onPress={handleNextMonth} style={styles.monthNavBtn}>
                <ChevronRight size={18} color={colors.inkPrimary} />
              </Pressable>
            </View>

            {/* Hàng Thứ T2 -> CN */}
            <View style={styles.weekRow}>
              {WEEKDAYS.map((wd) => (
                <View key={wd} style={styles.weekCell}>
                  <AppText style={styles.weekText}>{wd}</AppText>
                </View>
              ))}
            </View>

            {/* Lưới ngày trong tháng */}
            <View style={styles.grid}>
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }
                const isPast = cell < today;
                const isStart = isSameDay(cell, draftStart);
                const isEnd = isSameDay(cell, draftEnd);
                const isInRange = draftStart && draftEnd && cell > draftStart && cell < draftEnd;
                const isToday = isSameDay(cell, today);

                return (
                  <Pressable
                    key={cell.toISOString()}
                    disabled={isPast}
                    onPress={() => handleDayPress(cell)}
                    style={[
                      styles.dayCell,
                      isInRange && styles.dayCellInRange,
                      (isStart || isEnd) && styles.dayCellSelected,
                      isToday && !isStart && !isEnd && styles.dayCellToday,
                    ]}
                  >
                    <AppText
                      style={[
                        styles.dayText,
                        isPast && styles.dayTextPast,
                        isInRange && styles.dayTextInRange,
                        (isStart || isEnd) && styles.dayTextSelected,
                      ]}
                    >
                      {cell.getDate()}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* Lựa chọn Custom nhanh theo từng danh mục */}
            {durationChoices.length > 0 ? (
              <View style={styles.customSection}>
                <AppText style={styles.customHeading}>
                  {activeCategory === "entertainment"
                    ? "Thời lượng trải nghiệm (tùy chọn)"
                    : "Hoặc chọn nhanh thời gian từ ngày đi"}
                </AppText>
                <View style={styles.customChipsRow}>
                  {durationChoices.map((opt) => {
                    const active = draftDuration === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        style={[styles.customChip, active && styles.customChipActive]}
                        onPress={() => handleSelectCustomDuration(opt)}
                      >
                        <AppText
                          style={[styles.customChipText, active && styles.customChipTextActive]}
                        >
                          {opt.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={styles.clearBtn}
              onPress={() => {
                onApply({ startDate: null, endDate: null, durationOption: null });
                onClose();
              }}
            >
              <AppText style={styles.clearBtnText}>Bất kỳ ngày nào</AppText>
            </Pressable>
            <Pressable
              style={styles.applyBtn}
              onPress={() => {
                onApply({
                  startDate: draftStart,
                  endDate: draftEnd,
                  durationOption: draftDuration,
                });
                onClose();
              }}
            >
              <AppText style={styles.applyBtnText}>Áp dụng</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.md,
    maxHeight: "88%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  closeBtn: {
    width: touchTarget.minHeight,
    height: touchTarget.minHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryBox: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: radius.lg,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  summaryCol: {
    flex: 1,
    gap: 2,
  },
  summaryLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.inkSubtle,
  },
  summaryValue: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  monthBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  monthNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  monthNavDisabled: {
    opacity: 0.45,
  },
  monthTitle: {
    fontSize: 15.5,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekCell: {
    width: "14.2857%",
    alignItems: "center",
    paddingVertical: 4,
  },
  weekText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.inkSubtle,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.2857%",
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    marginVertical: 1,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.brandPrimary,
  },
  dayCellInRange: {
    backgroundColor: "#E0F2FE",
    borderRadius: 0,
  },
  dayCellSelected: {
    backgroundColor: colors.brandPrimary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  dayTextPast: {
    color: colors.borderStrong,
  },
  dayTextInRange: {
    color: colors.brandDark,
    fontWeight: "700",
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  customSection: {
    marginTop: spacing.md,
    gap: 8,
  },
  customHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.inkBody,
  },
  customChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  customChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  customChipActive: {
    backgroundColor: "#E0F2FE",
    borderColor: colors.brandPrimary,
  },
  customChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.inkBody,
  },
  customChipTextActive: {
    color: colors.brandPrimary,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  clearBtn: {
    flex: 0.48,
    minHeight: 46,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  applyBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
