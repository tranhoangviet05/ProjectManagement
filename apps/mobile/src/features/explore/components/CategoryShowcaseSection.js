import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  BadgeCheck,
  Building2,
  Car,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Star,
  TrainFront,
} from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { resolveMediaUrl } from "../../../lib/apiClient";
import { colors, radius, spacing } from "../../../theme/tokens";
import {
  POPULAR_TRAIN_ROUTES,
  formatCurrencyVnd,
  formatPriceUnit,
  getRatingVerdict,
  getServiceTypeLabel,
} from "../models/exploreModel";

const VEHICLE_FALLBACK_CARDS = [
  {
    id: "veh-1",
    title: "Thuê xe máy tay ga giao tận khách sạn",
    location: "Đà Nẵng · Hội An",
    price: 150000,
    unit: "ngày",
    tag: "Xe máy",
  },
  {
    id: "veh-2",
    title: "Ô tô tự lái 5 chỗ đời mới (giao sân bay)",
    location: "Đà Lạt · Phú Quốc",
    price: 850000,
    unit: "ngày",
    tag: "Ô tô tự lái",
  },
  {
    id: "veh-3",
    title: "Xe riêng 7 chỗ có tài xế đi liên tỉnh",
    location: "Hà Nội · Sa Pa",
    price: 1600000,
    unit: "chuyến",
    tag: "Có tài xế",
  },
];

function ServiceHighlightCard({ item, onPress }) {
  const thumb =
    resolveMediaUrl(item.cover_image || item.primary_image) ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
  const displayName = item.name || item.title || "Dịch vụ du lịch";
  const ratingScore = Number(item.rating_avg || item.avg_rating || 0);
  const reviewsCount = Number(item.reviews_count || 0);
  const bookingsCount = Number(item.total_bookings || 0);
  const addressText = item.address
    ? item.location?.name
      ? `${item.address}, ${item.location.name}`
      : item.address
    : item.location?.name || "Việt Nam";
  const displayedAmenities =
    Array.isArray(item.amenities) && item.amenities.length > 0
      ? item.amenities.slice(0, 2)
      : Array.isArray(item.includes) && item.includes.length > 0
        ? item.includes.slice(0, 2)
        : [];
  const totalAmenities =
    Array.isArray(item.amenities) && item.amenities.length > 0
      ? Number(item.amenities_count || item.amenities.length)
      : Array.isArray(item.includes)
        ? item.includes.length
        : 0;
  const extraAmenities = Math.max(0, totalAmenities - displayedAmenities.length);

  const displayedPolicies = Array.isArray(item.policies) ? item.policies.slice(0, 1) : [];
  const extraPolicies = Math.max(
    0,
    Number(item.policies_count || displayedPolicies.length) - displayedPolicies.length,
  );

  const categoryLabel = item.category?.name || getServiceTypeLabel(item.type);

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.serviceCard, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
    >
      <View style={styles.serviceImageWrap}>
        <Image source={{ uri: thumb }} style={styles.serviceImage} resizeMode="cover" />
        {item.provider?.business_name ? (
          <View style={styles.verifiedPill}>
            <BadgeCheck size={12} color="#10B981" />
            <AppText style={styles.verifiedPillText}>KYC</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.serviceBody}>
        {/* Nhãn danh mục dịch vụ & Khuyến mãi đặt trong phần thông tin */}
        <View style={styles.tagsRow}>
          <View style={styles.categoryTag}>
            <AppText style={styles.categoryTagText} numberOfLines={1}>
              {categoryLabel}
            </AppText>
          </View>
          {item.active_promotion ? (
            <View style={styles.promoTag}>
              <AppText style={styles.promoTagText} numberOfLines={1}>
                {item.active_promotion.badge_text}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* Tiêu đề dịch vụ */}
        <AppText style={styles.serviceTitle} numberOfLines={2}>
          {displayName}
        </AppText>

        {/* Điểm đánh giá chuẩn Booking.com / Trip.com */}
        <View style={styles.ratingRow}>
          <View style={styles.scoreBox}>
            <Star size={11} color="#FFFFFF" fill="#FFFFFF" />
            <AppText style={styles.scoreBoxText}>
              {ratingScore > 0 ? ratingScore.toFixed(1) : "Mới"}
            </AppText>
          </View>
          <AppText style={styles.verdictText}>{getRatingVerdict(ratingScore)}</AppText>
          <AppText style={styles.reviewMetaText} numberOfLines={1}>
            {reviewsCount > 0
              ? `(${reviewsCount} đánh giá)`
              : bookingsCount > 0
                ? `· ${bookingsCount} lượt đặt`
                : "· Đang mở bán"}
          </AppText>
        </View>

        {/* Địa điểm & Địa chỉ */}
        <View style={styles.metaRow}>
          <MapPin size={13} color={colors.brandPrimary} />
          <AppText style={styles.metaText} numberOfLines={1}>
            {addressText}
          </AppText>
        </View>

        {/* Nhà cung cấp */}
        {item.provider?.business_name ? (
          <View style={styles.metaRow}>
            <Building2 size={13} color={colors.inkSubtle} />
            <AppText style={styles.providerText} numberOfLines={1}>
              {item.provider.business_name}
            </AppText>
          </View>
        ) : null}

        {/* Chính sách dịch vụ + chỉ báo còn thêm bên trong */}
        {displayedPolicies.length > 0 ? (
          <View style={styles.policiesRow}>
            {displayedPolicies.map((pol) => (
              <View key={pol.id} style={styles.policyChip}>
                <ShieldCheck size={11} color="#059669" />
                <AppText style={styles.policyChipText} numberOfLines={1}>
                  {pol.name}
                </AppText>
              </View>
            ))}
            {extraPolicies > 0 ? (
              <View style={styles.moreChip}>
                <AppText style={styles.moreChipText}>+{extraPolicies} chính sách</AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Tiện nghi / Điểm nổi bật + chỉ báo còn thêm bên trong */}
        {displayedAmenities.length > 0 ? (
          <View style={styles.perksRow}>
            {displayedAmenities.map((perk, idx) => (
              <View key={`${perk}-${idx}`} style={styles.perkChip}>
                <AppText style={styles.perkChipText} numberOfLines={1}>
                  {perk}
                </AppText>
              </View>
            ))}
            {extraAmenities > 0 ? (
              <View style={styles.moreChip}>
                <AppText style={styles.moreChipText}>+{extraAmenities} tiện nghi</AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Khối giá minh bạch kiểu Booking.com / Trip.com */}
        <View style={styles.priceBlock}>
          <AppText style={styles.priceFromLabel}>Giá từ</AppText>
          <View style={styles.priceRightCol}>
            {item.active_promotion ? (
              <AppText style={styles.strikePriceText}>{formatCurrencyVnd(item.base_price)}</AppText>
            ) : null}
            <View style={styles.priceAmountRow}>
              <AppText style={[styles.priceText, item.active_promotion && { color: "#E11D48" }]}>
                {formatCurrencyVnd(
                  item.active_promotion ? item.active_promotion.discounted_price : item.base_price,
                )}
              </AppText>
              <AppText style={styles.priceUnitText}>
                /{formatPriceUnit(item.price_unit, item.type)}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Nội dung động thay đổi tương ứng theo Danh mục đang được chọn trên Trang chủ.
 */
export default function CategoryShowcaseSection({
  activeCategory,
  services = [],
  onSelectService,
  onPressExploreCategory,
}) {
  const filteredServices = useMemo(() => {
    if (activeCategory === "accommodation") {
      return services.filter((s) => s.type === "hotel" || s.type === "homestay");
    }
    if (activeCategory === "entertainment") {
      return services.filter((s) => s.type === "tour");
    }
    if (activeCategory === "vehicle") {
      return services.filter((s) => {
        if (s.type !== "vehicle") return false;
        const catSlug = String(s.category?.slug || "").toLowerCase();
        const catName = String(s.category?.name || "").toLowerCase();
        return !catSlug.includes("tau") && !catName.includes("vé tàu");
      });
    }
    return [];
  }, [activeCategory, services]);

  const headerConfig = {
    accommodation: {
      title: "Chỗ ở được chọn nhiều nhất",
      subtitle: "Khách sạn, resort và villa xác minh đối tác",
    },
    entertainment: {
      title: "Giải trí & Tour trải nghiệm",
      subtitle: "Lịch trình đặc sắc cùng hướng dẫn viên bản địa",
    },
    vehicle: {
      title: "Thuê xe linh hoạt theo hành trình",
      subtitle: "Giao xe tận nơi tại sân bay và trung tâm thành phố",
    },
    train: {
      title: "Tuyến tàu hỏa ngắm cảnh đẹp nhất",
      subtitle: "Khám phá đường sắt Bắc – Nam và các cung đường ven biển",
    },
  }[activeCategory] || {
    title: "Gợi ý nổi bật",
    subtitle: "Dịch vụ du lịch chất lượng cao",
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <AppText style={styles.sectionTitle}>{headerConfig.title}</AppText>
          <AppText style={styles.sectionSubtitle}>{headerConfig.subtitle}</AppText>
        </View>
        <Pressable onPress={() => onPressExploreCategory(activeCategory)} style={styles.seeAllBtn}>
          <AppText style={styles.seeAllText}>Tất cả</AppText>
          <ChevronRight size={16} color={colors.brandPrimary} />
        </Pressable>
      </View>

      {activeCategory === "train" ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {POPULAR_TRAIN_ROUTES.map((route) => (
            <Pressable
              key={route.id}
              style={styles.trainCard}
              onPress={() => onPressExploreCategory("train", `${route.from} - ${route.to}`)}
            >
              <View style={styles.trainIconBadge}>
                <TrainFront size={18} color={colors.brandPrimary} />
              </View>
              <AppText style={styles.trainRouteTitle} numberOfLines={2}>
                {route.from} → {route.to}
              </AppText>
              <AppText style={styles.trainDuration}>Thời gian dự kiến: {route.duration}</AppText>
              <AppText style={styles.trainPrice}>Từ {formatCurrencyVnd(route.price)}</AppText>
            </Pressable>
          ))}
        </ScrollView>
      ) : activeCategory === "vehicle" && filteredServices.length === 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {VEHICLE_FALLBACK_CARDS.map((v) => (
            <Pressable
              key={v.id}
              style={styles.trainCard}
              onPress={() => onPressExploreCategory("vehicle", v.tag)}
            >
              <View style={styles.trainIconBadge}>
                <Car size={18} color={colors.brandPrimary} />
              </View>
              <AppText style={styles.trainRouteTitle} numberOfLines={2}>
                {v.title}
              </AppText>
              <AppText style={styles.trainDuration}>{v.location}</AppText>
              <AppText style={styles.trainPrice}>
                {formatCurrencyVnd(v.price)} / {v.unit}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      ) : filteredServices.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {filteredServices.slice(0, 8).map((svc) => (
            <ServiceHighlightCard key={svc.id} item={svc} onPress={onSelectService} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyCategoryBox}>
          <AppText style={styles.emptyCategoryText}>
            Hiện chưa có dịch vụ nào trong danh mục này. Nhấn &quot;Tất cả&quot; để tìm kiếm mở
            rộng.
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm + 4,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.inkPrimary,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: colors.inkBody,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingLeft: 8,
  },
  seeAllText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  horizontalList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm + 4,
  },
  serviceCard: {
    width: 266,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  serviceImageWrap: {
    height: 146,
    position: "relative",
    backgroundColor: "#E2E8F0",
  },
  serviceImage: {
    width: "100%",
    height: "100%",
  },
  verifiedPill: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  verifiedPillText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#047857",
  },
  serviceBody: {
    flex: 1,
    padding: spacing.sm + 4,
    gap: 6,
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    maxWidth: "100%",
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  promoTag: {
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  promoTagText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#E11D48",
  },
  strikePriceText: {
    fontSize: 11,
    color: colors.inkSubtle,
    textDecorationLine: "line-through",
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.inkPrimary,
    lineHeight: 20,
    minHeight: 40,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scoreBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#0284C7",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scoreBoxText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  verdictText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  reviewMetaText: {
    fontSize: 11.5,
    color: colors.inkSubtle,
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12.5,
    color: colors.inkBody,
    flex: 1,
  },
  providerText: {
    fontSize: 12,
    color: colors.inkSubtle,
    flex: 1,
  },
  policiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  policyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 165,
  },
  policyChipText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#059669",
    flexShrink: 1,
  },
  perksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 2,
  },
  perkChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 120,
  },
  perkChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.inkBody,
  },
  moreChip: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  moreChipText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  priceBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  priceRightCol: {
    alignItems: "flex-end",
  },
  priceFromLabel: {
    fontSize: 11,
    color: colors.inkSubtle,
  },
  priceAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  priceText: {
    fontSize: 15.5,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  priceUnitText: {
    fontSize: 11,
    color: colors.inkSubtle,
  },
  trainCard: {
    width: 230,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: spacing.md,
    gap: 8,
  },
  trainIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  trainRouteTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: colors.inkPrimary,
    lineHeight: 20,
  },
  trainDuration: {
    fontSize: 12,
    color: colors.inkBody,
  },
  trainPrice: {
    fontSize: 14.5,
    fontWeight: "700",
    color: colors.brandPrimary,
    marginTop: 2,
  },
  emptyCategoryBox: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyCategoryText: {
    fontSize: 13.5,
    color: colors.inkBody,
    lineHeight: 20,
  },
});
