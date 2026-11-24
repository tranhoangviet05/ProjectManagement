import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import {
  ArrowLeftRight,
  BedDouble,
  Bell,
  Calendar,
  Car,
  Compass,
  MapPin,
  MessageCircle,
  Minus,
  PawPrint,
  Plus,
  Search,
  TrainFront,
  Users,
  X,
} from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { colors, radius, spacing, touchTarget } from "../../../theme/tokens";
import { useSearchFilters } from "../../../context/SearchFilterContext";
import { HOME_CATEGORIES, VEHICLE_TYPE_OPTIONS } from "../models/exploreModel";
import ExploreDatePickerModal, {
  formatCompactDateVi,
  formatFullDateVi,
} from "./ExploreDatePickerModal";

const CATEGORY_ICONS = {
  accommodation: BedDouble,
  entertainment: Compass,
  vehicle: Car,
  train: TrainFront,
};

const ENTERTAINMENT_LABELS = {
  day: "Trong ngày",
  "2d1n": "2 ngày 1 đêm",
  "3d2n": "3 ngày 2 đêm",
  "7d": "1 tuần",
};

const TRAIN_STATIONS = [
  "Ga Hà Nội",
  "Ga Đà Nẵng",
  "Ga Huế",
  "Ga Nha Trang",
  "Ga Sài Gòn",
  "Ga Lào Cai (Sa Pa)",
  "Ga Vinh",
];

function StepperRow({ label, sublabel, value, min = 0, max = 12, onChange }) {
  return (
    <View style={styles.stepperRow}>
      <View style={{ flex: 1 }}>
        <AppText style={styles.stepperLabel}>{label}</AppText>
        {sublabel ? <AppText style={styles.stepperSub}>{sublabel}</AppText> : null}
      </View>
      <View style={styles.stepperControls}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          style={[styles.stepBtn, value <= min && styles.stepBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={`Giảm ${label}`}
        >
          <Minus size={15} color={value <= min ? colors.inkSubtle : colors.inkPrimary} />
        </Pressable>
        <AppText style={styles.stepValue}>{value}</AppText>
        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          style={[styles.stepBtn, value >= max && styles.stepBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={`Tăng ${label}`}
        >
          <Plus size={15} color={value >= max ? colors.inkSubtle : colors.inkPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

export function ExploreStickyHeader({ activeCategory, onSelectCategory }) {
  const insets = useSafeAreaInsets();

  const showFeatureSoon = (title) => {
    Alert.alert(title, "Tính năng đang được hoàn thiện và sẽ sớm ra mắt trên phiên bản tiếp theo.");
  };

  return (
    <View style={styles.stickyHeaderWrapper}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="stickyHeaderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#075985" stopOpacity="1" />
              <Stop offset="100%" stopColor="#0284C7" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#stickyHeaderGradient)" />
        </Svg>
      </View>

      <View style={[styles.stickyHeaderInner, { paddingTop: Math.max(insets.top, 16) + 6 }]}>
        {/* Header: Logo thương hiệu + Icon Thông báo & Tin nhắn */}
        <View style={styles.headerRow}>
          <AppText isLogo style={styles.logoText} numberOfLines={1}>
            Social Travel Booking
          </AppText>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => showFeatureSoon("Thông báo")}
              style={styles.iconGlassBtn}
              accessibilityRole="button"
              accessibilityLabel="Thông báo"
            >
              <Bell size={20} color="#FFFFFF" />
              <View style={styles.notifDot} />
            </Pressable>
            <Pressable
              onPress={() => showFeatureSoon("Tin nhắn")}
              style={styles.iconGlassBtn}
              accessibilityRole="button"
              accessibilityLabel="Tin nhắn"
            >
              <MessageCircle size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Thanh danh mục nằm ngang cố định cùng Header */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {HOME_CATEGORIES.map((cat) => {
            const IconComp = CATEGORY_ICONS[cat.id] || Compass;
            const isActive = activeCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => onSelectCategory(cat.id)}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <IconComp size={16} color={isActive ? colors.brandPrimary : "#E0F2FE"} />
                <AppText
                  style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}
                >
                  {cat.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export default function ExploreHeroSearch({ activeCategory, locations = [], onSubmitSearch }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [durationOption, setDurationOption] = useState(null);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [hasPets, setHasPets] = useState(false);
  const [vehicleType, setVehicleType] = useState("motorbike");
  const [trainFrom, setTrainFrom] = useState("");
  const [trainTo, setTrainTo] = useState("");

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationSearchText, setLocationSearchText] = useState("");
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [stationPickerTarget, setStationPickerTarget] = useState(null);

  const filteredLocations = useMemo(() => {
    const q = locationSearchText.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (loc) => loc.name?.toLowerCase().includes(q) || loc.parent?.name?.toLowerCase().includes(q),
    );
  }, [locations, locationSearchText]);

  const dateDisplayText = useMemo(() => {
    if (!startDate && !durationOption) return "";
    if (activeCategory === "entertainment") {
      const durLabel = durationOption ? ENTERTAINMENT_LABELS[durationOption] : "";
      if (startDate && durLabel) return `${formatFullDateVi(startDate)} · ${durLabel}`;
      if (startDate) return formatFullDateVi(startDate);
      return durLabel;
    }
    if (activeCategory === "train") {
      return startDate ? formatFullDateVi(startDate) : "";
    }
    if (startDate && endDate) {
      const nights = Math.max(1, Math.round((endDate - startDate) / 86400000));
      const unit = activeCategory === "vehicle" ? "ngày" : "đêm";
      return `${formatCompactDateVi(startDate)} – ${formatCompactDateVi(endDate)} (${nights} ${unit})`;
    }
    return startDate ? formatFullDateVi(startDate) : "";
  }, [activeCategory, startDate, endDate, durationOption]);

  const { updateSearchFilters } = useSearchFilters();

  const toLocalIso = (dateObj) => {
    if (!dateObj) return "";
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleSubmit = () => {
    const catMeta = HOME_CATEGORIES.find((c) => c.id === activeCategory);
    const trainQueryParts = [trainFrom, trainTo].filter(Boolean);
    const searchQuery = activeCategory === "train" ? trainQueryParts.join(" - ") : keyword.trim();
    const isoStart = toLocalIso(startDate);
    const isoEnd = toLocalIso(endDate);

    updateSearchFilters({
      startDate: isoStart,
      endDate: isoEnd,
      numAdults: adults,
      numChildren: childrenCount,
      hasPets,
      group: catMeta?.apiGroup || "",
    });

    onSubmitSearch({
      group: catMeta?.apiGroup || "",
      categoryLabel: catMeta?.label || "Tất cả",
      location_id: activeCategory === "train" ? "" : selectedLocation?.id || "",
      location_name: activeCategory === "train" ? "" : selectedLocation?.name || "",
      q: searchQuery,
      adults,
      children: childrenCount,
      has_pets: hasPets,
      vehicle_type: vehicleType,
      date_label: dateDisplayText,
      start_date: isoStart,
      end_date: isoEnd,
    });
  };

  const guestSummary =
    activeCategory === "accommodation"
      ? `${adults} người lớn · ${childrenCount} trẻ em${hasPets ? " · Có thú cưng" : ""}`
      : activeCategory === "train"
        ? `${adults + childrenCount} hành khách`
        : `${adults} người lớn · ${childrenCount} trẻ em`;

  return (
    <View style={styles.heroWrapper}>
      {/* Nền Gradient nối tiếp liền mạch từ thanh danh mục (#0284C7) nhạt dần xuống Form Tìm kiếm */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="heroBrandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#0284C7" stopOpacity="1" />
              <Stop offset="48%" stopColor="#7DD3FC" stopOpacity="0.88" />
              <Stop offset="82%" stopColor="#E0F2FE" stopOpacity="0.95" />
              <Stop offset="100%" stopColor={colors.surfaceBase} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroBrandGradient)" />
        </Svg>
      </View>

      <View style={styles.heroInner}>
        {/* Form Tìm kiếm động theo từng Danh mục */}
        <View style={styles.searchCard}>
          {activeCategory === "train" ? (
            <View style={styles.trainStationBox}>
              <Pressable style={styles.stationField} onPress={() => setStationPickerTarget("from")}>
                <AppText style={styles.fieldTinyLabel}>Ga đi (tùy chọn)</AppText>
                <AppText
                  style={[styles.fieldValueText, !trainFrom && styles.fieldPlaceholder]}
                  numberOfLines={1}
                >
                  {trainFrom || "Chọn ga đi"}
                </AppText>
              </Pressable>
              <Pressable
                style={styles.swapStationBtn}
                onPress={() => {
                  const prev = trainFrom;
                  setTrainFrom(trainTo);
                  setTrainTo(prev);
                }}
                accessibilityLabel="Đổi chiều ga đi và ga đến"
              >
                <ArrowLeftRight size={16} color={colors.brandPrimary} />
              </Pressable>
              <Pressable style={styles.stationField} onPress={() => setStationPickerTarget("to")}>
                <AppText style={styles.fieldTinyLabel}>Ga đến (tùy chọn)</AppText>
                <AppText
                  style={[styles.fieldValueText, !trainTo && styles.fieldPlaceholder]}
                  numberOfLines={1}
                >
                  {trainTo || "Chọn ga đến"}
                </AppText>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.inputRow}
              onPress={() => setLocationModalOpen(true)}
              accessibilityRole="button"
            >
              <MapPin size={18} color={colors.brandPrimary} />
              <View style={styles.inputTextGroup}>
                <AppText style={styles.fieldTinyLabel}>
                  {activeCategory === "vehicle" ? "Điểm nhận xe" : "Điểm đến"}
                </AppText>
                <AppText
                  style={[styles.fieldValueText, !selectedLocation && styles.fieldPlaceholder]}
                  numberOfLines={1}
                >
                  {selectedLocation
                    ? selectedLocation.name
                    : activeCategory === "vehicle"
                      ? "Chọn tỉnh thành / sân bay nhận xe"
                      : "Bạn muốn đi đâu? (Đà Nẵng, Đà Lạt, Phú Quốc...)"}
                </AppText>
              </View>
              {selectedLocation ? (
                <Pressable
                  onPress={() => setSelectedLocation(null)}
                  hitSlop={10}
                  style={styles.clearSmallBtn}
                >
                  <X size={15} color={colors.inkSubtle} />
                </Pressable>
              ) : null}
            </Pressable>
          )}

          {activeCategory === "entertainment" ? (
            <View style={styles.inputRow}>
              <Search size={18} color={colors.inkSubtle} />
              <TextInput
                value={keyword}
                onChangeText={setKeyword}
                placeholder="Tên tour, hoạt động, công viên..."
                placeholderTextColor={colors.inkSubtle}
                style={styles.textInput}
                returnKeyType="search"
                onSubmitEditing={handleSubmit}
              />
            </View>
          ) : null}

          {/* Ngày đi - Ngày về (không bắt buộc) */}
          <Pressable
            style={styles.inputRow}
            onPress={() => setDateModalOpen(true)}
            accessibilityRole="button"
          >
            <Calendar size={18} color={colors.brandPrimary} />
            <View style={styles.inputTextGroup}>
              <AppText style={styles.fieldTinyLabel}>
                {activeCategory === "accommodation"
                  ? "Ngày đi – Ngày về (tùy chọn)"
                  : activeCategory === "vehicle"
                    ? "Ngày nhận – Ngày trả xe (tùy chọn)"
                    : "Ngày khởi hành (tùy chọn)"}
              </AppText>
              <AppText
                style={[styles.fieldValueText, !dateDisplayText && styles.fieldPlaceholder]}
                numberOfLines={1}
              >
                {dateDisplayText || "Bất kỳ ngày nào (Nhấn để chọn lịch)"}
              </AppText>
            </View>
            {dateDisplayText ? (
              <Pressable
                onPress={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setDurationOption(null);
                }}
                hitSlop={10}
                style={styles.clearSmallBtn}
              >
                <X size={15} color={colors.inkSubtle} />
              </Pressable>
            ) : null}
          </Pressable>

          {/* Hàng tùy chọn riêng theo từng danh mục */}
          {activeCategory === "vehicle" ? (
            <View style={styles.vehicleTypeWrap}>
              <AppText style={styles.fieldTinyLabel}>Loại phương tiện</AppText>
              <View style={styles.vehicleChipRow}>
                {VEHICLE_TYPE_OPTIONS.map((opt) => {
                  const selected = vehicleType === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => setVehicleType(opt.id)}
                      style={[styles.vehicleChip, selected && styles.vehicleChipActive]}
                    >
                      <AppText
                        style={[styles.vehicleChipText, selected && styles.vehicleChipTextActive]}
                      >
                        {opt.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.inputRow}
              onPress={() => setGuestModalOpen(true)}
              accessibilityRole="button"
            >
              <Users size={18} color={colors.brandPrimary} />
              <View style={styles.inputTextGroup}>
                <AppText style={styles.fieldTinyLabel}>
                  {activeCategory === "accommodation"
                    ? "Số khách & Thú cưng"
                    : activeCategory === "train"
                      ? "Hành khách"
                      : "Số người tham gia"}
                </AppText>
                <AppText style={styles.fieldValueText} numberOfLines={1}>
                  {guestSummary}
                </AppText>
              </View>
            </Pressable>
          )}

          {/* Công tắc thú cưng hiển thị nhanh riêng cho Chỗ ở */}
          {activeCategory === "accommodation" ? (
            <View style={styles.petQuickRow}>
              <View style={styles.petQuickLeft}>
                <PawPrint size={16} color={colors.brandPrimary} />
                <AppText style={styles.petQuickText}>Có bao gồm thú cưng không?</AppText>
              </View>
              <Switch
                value={hasPets}
                onValueChange={setHasPets}
                trackColor={{ false: colors.borderSubtle, true: "#7DD3FC" }}
                thumbColor={hasPets ? colors.brandPrimary : "#FFFFFF"}
              />
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.searchSubmitBtn, pressed && styles.searchSubmitPressed]}
            onPress={handleSubmit}
            accessibilityRole="button"
          >
            <Search size={18} color="#FFFFFF" />
            <AppText style={styles.searchSubmitText}>
              Tìm {HOME_CATEGORIES.find((c) => c.id === activeCategory)?.label?.toLowerCase()}
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* Modal chọn Điểm đến */}
      <Modal
        visible={locationModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setLocationModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>Chọn điểm đến</AppText>
              <Pressable onPress={() => setLocationModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={20} color={colors.inkPrimary} />
              </Pressable>
            </View>
            <View style={styles.modalSearchBox}>
              <Search size={16} color={colors.inkSubtle} />
              <TextInput
                value={locationSearchText}
                onChangeText={setLocationSearchText}
                placeholder="Tìm tỉnh thành, đảo, khu du lịch..."
                placeholderTextColor={colors.inkSubtle}
                style={styles.modalSearchInput}
              />
            </View>
            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={styles.locationOptionRow}
                  onPress={() => {
                    setSelectedLocation(item);
                    setLocationModalOpen(false);
                    setLocationSearchText("");
                  }}
                >
                  <MapPin size={17} color={colors.brandPrimary} />
                  <View style={{ flex: 1 }}>
                    <AppText style={styles.locationOptionName}>{item.name}</AppText>
                    {item.parent?.name ? (
                      <AppText style={styles.locationOptionSub}>Thuộc {item.parent.name}</AppText>
                    ) : null}
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={
                <AppText style={styles.emptyModalText}>Không tìm thấy địa điểm phù hợp.</AppText>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Modal chọn Lịch cụ thể (Thứ, Ngày/Tháng/Năm) & Custom theo danh mục */}
      <ExploreDatePickerModal
        visible={dateModalOpen}
        activeCategory={activeCategory}
        startDate={startDate}
        endDate={endDate}
        durationOption={durationOption}
        onApply={({ startDate: nextStart, endDate: nextEnd, durationOption: nextDuration }) => {
          setStartDate(nextStart);
          setEndDate(nextEnd);
          setDurationOption(nextDuration);
        }}
        onClose={() => setDateModalOpen(false)}
      />

      {/* Modal chọn Số khách & Thú cưng */}
      <Modal
        visible={guestModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setGuestModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.compactModalSheet}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>Số lượng khách</AppText>
              <Pressable onPress={() => setGuestModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={20} color={colors.inkPrimary} />
              </Pressable>
            </View>
            <StepperRow
              label="Người lớn"
              sublabel="Từ 12 tuổi trở lên"
              value={adults}
              min={1}
              onChange={setAdults}
            />
            <StepperRow
              label="Trẻ em"
              sublabel="Dưới 12 tuổi"
              value={childrenCount}
              min={0}
              onChange={setChildrenCount}
            />
            {activeCategory === "accommodation" ? (
              <View style={[styles.petQuickRow, { marginTop: spacing.xs }]}>
                <View style={styles.petQuickLeft}>
                  <PawPrint size={16} color={colors.brandPrimary} />
                  <AppText style={styles.petQuickText}>Có mang theo thú cưng</AppText>
                </View>
                <Switch
                  value={hasPets}
                  onValueChange={setHasPets}
                  trackColor={{ false: colors.borderSubtle, true: "#7DD3FC" }}
                  thumbColor={hasPets ? colors.brandPrimary : "#FFFFFF"}
                />
              </View>
            ) : null}
            <Pressable
              style={[styles.searchSubmitBtn, { marginTop: spacing.md }]}
              onPress={() => setGuestModalOpen(false)}
            >
              <AppText style={styles.searchSubmitText}>Áp dụng</AppText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal chọn Ga tàu */}
      <Modal
        visible={Boolean(stationPickerTarget)}
        animationType="fade"
        transparent
        onRequestClose={() => setStationPickerTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.compactModalSheet}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>
                {stationPickerTarget === "from" ? "Chọn ga đi" : "Chọn ga đến"}
              </AppText>
              <Pressable onPress={() => setStationPickerTarget(null)} style={styles.modalCloseBtn}>
                <X size={20} color={colors.inkPrimary} />
              </Pressable>
            </View>
            {TRAIN_STATIONS.map((station) => (
              <Pressable
                key={station}
                style={styles.locationOptionRow}
                onPress={() => {
                  if (stationPickerTarget === "from") setTrainFrom(station);
                  else setTrainTo(station);
                  setStationPickerTarget(null);
                }}
              >
                <TrainFront size={17} color={colors.brandPrimary} />
                <AppText style={styles.locationOptionName}>{station}</AppText>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeaderWrapper: {
    position: "relative",
    zIndex: 10,
  },
  stickyHeaderInner: {
    paddingHorizontal: spacing.md,
  },
  heroWrapper: {
    position: "relative",
    paddingBottom: spacing.md,
  },
  heroInner: {
    paddingHorizontal: spacing.md,
    paddingTop: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    flex: 1,
    paddingRight: spacing.sm,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconGlassBtn: {
    width: touchTarget.minHeight,
    height: touchTarget.minHeight,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FB7185",
    borderWidth: 1.5,
    borderColor: "#0284C7",
  },
  categoryScroll: {
    gap: spacing.xs + 2,
    paddingBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 40,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  categoryChipActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  categoryChipText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#F0F9FF",
  },
  categoryChipTextActive: {
    color: colors.brandPrimary,
    fontWeight: "700",
  },
  searchCard: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#0369A1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
    gap: spacing.sm + 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm + 4,
    minHeight: 52,
    paddingVertical: 8,
  },
  inputTextGroup: {
    flex: 1,
  },
  fieldTinyLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.inkSubtle,
    marginBottom: 1,
  },
  fieldValueText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  fieldPlaceholder: {
    color: colors.inkSubtle,
    fontWeight: "500",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.inkPrimary,
    paddingVertical: 2,
  },
  clearSmallBtn: {
    padding: 6,
  },
  trainStationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  stationField: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 10,
  },
  swapStationBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleTypeWrap: {
    gap: 6,
  },
  vehicleChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  vehicleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  vehicleChipActive: {
    backgroundColor: "#E0F2FE",
    borderColor: colors.brandPrimary,
  },
  vehicleChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.inkBody,
  },
  vehicleChipTextActive: {
    color: colors.brandPrimary,
  },
  petQuickRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  petQuickLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  petQuickText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  searchSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    backgroundColor: colors.brandPrimary,
    minHeight: 48,
    borderRadius: radius.lg,
    marginTop: 2,
  },
  searchSubmitPressed: {
    opacity: 0.9,
  },
  searchSubmitText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.md,
    maxHeight: "78%",
  },
  compactModalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm + 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  modalCloseBtn: {
    width: touchTarget.minHeight,
    height: touchTarget.minHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    backgroundColor: "#F1F5F9",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm + 4,
    minHeight: 44,
    marginBottom: spacing.sm,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.inkPrimary,
  },
  locationOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  locationOptionName: {
    fontSize: 14.5,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  locationOptionSub: {
    fontSize: 12,
    color: colors.inkSubtle,
    marginTop: 2,
  },
  emptyModalText: {
    textAlign: "center",
    color: colors.inkSubtle,
    paddingVertical: spacing.lg,
  },
  presetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: spacing.xs + 2,
  },
  presetRowActive: {
    backgroundColor: "#E0F2FE",
    borderColor: colors.brandPrimary,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  presetLabelActive: {
    color: colors.brandPrimary,
  },
  presetDate: {
    fontSize: 13,
    color: colors.inkBody,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  stepperLabel: {
    fontSize: 14.5,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  stepperSub: {
    fontSize: 12,
    color: colors.inkSubtle,
  },
  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  stepBtnDisabled: {
    backgroundColor: "#F8FAFC",
    opacity: 0.5,
  },
  stepValue: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
});
