import React, { useMemo, useRef, useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  BadgeCheck,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { resolveMediaUrl } from "../../../lib/apiClient";
import { colors, radius, spacing } from "../../../theme/tokens";
import {
  formatCurrencyVnd,
  formatPriceUnit,
  getRatingVerdict,
  getServiceTypeLabel,
} from "../models/exploreModel";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

function formatShortCampaignDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

/**
 * Khối "Ưu đãi Lễ hội đang diễn ra" trên Trang chủ Mobile:
 * - Slider Banner tự động chuyển mỗi 3 giây + nút mũi tên Trái/Phải cho toàn bộ chiến dịch đang mở (xếp theo độ ưu tiên)
 * - Phía dưới là danh sách thẻ dịch vụ tham gia chiến dịch với đầy đủ thông tin (nhãn chiến dịch, đánh giá, địa chỉ, đối tác, chính sách + "+N", tiện nghi + "+N", giá gốc & giá sau giảm)
 */
export default function HolidayDealsSection({
  campaigns = [],
  services = [],
  onSelectService,
  onOpenCampaigns,
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(() =>
    Math.max(280, Dimensions.get("window").width - spacing.md * 2),
  );
  const sliderScrollRef = useRef(null);

  const sortedCampaigns = useMemo(
    () => [...campaigns].sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0)),
    [campaigns],
  );

  const promotedServices = useMemo(
    () => services.filter((s) => Boolean(s.active_promotion)),
    [services],
  );

  const safeIdx = sortedCampaigns.length > 0 ? slideIdx % sortedCampaigns.length : 0;

  if (sortedCampaigns.length === 0 && promotedServices.length === 0) {
    return null;
  }

  const goToSlide = (targetIdx) => {
    if (sortedCampaigns.length <= 1) return;
    const normalized = (targetIdx + sortedCampaigns.length) % sortedCampaigns.length;
    setSlideIdx(normalized);
    sliderScrollRef.current?.scrollTo({
      x: normalized * sliderWidth,
      animated: true,
    });
  };

  const handlePrevSlide = () => goToSlide(safeIdx - 1);
  const handleNextSlide = () => goToSlide(safeIdx + 1);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Flame size={19} color="#E11D48" fill="#FFE4E6" />
            <AppText style={styles.sectionTitle}>Ưu đãi Lễ hội đang diễn ra</AppText>
          </View>
          <AppText style={styles.sectionSubtitle}>
            Săn deal du lịch độc quyền từ các đối tác tham gia chiến dịch
          </AppText>
        </View>
        <Pressable onPress={() => onOpenCampaigns?.()} style={styles.seeAllBtn}>
          <AppText style={styles.seeAllText}>Xem tất cả</AppText>
          <ChevronRight size={16} color={colors.brandPrimary} />
        </Pressable>
      </View>

      {/* Banner Slider các chương trình khuyến mãi đang mở */}
      {sortedCampaigns.length > 0 ? (
        <View style={styles.sliderWrapper}>
          <View
            style={styles.bannerFrame}
            onLayout={(e) => {
              const w = Math.round(e.nativeEvent.layout.width);
              if (w > 0 && w !== sliderWidth) {
                setSliderWidth(w);
              }
            }}
          >
            <ScrollView
              ref={sliderScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e) => {
                if (sliderWidth <= 0) return;
                const idx = Math.round(e.nativeEvent.contentOffset.x / sliderWidth);
                if (idx >= 0 && idx < sortedCampaigns.length) {
                  setSlideIdx(idx);
                }
              }}
              style={styles.bannerCarousel}
            >
              {sortedCampaigns.map((camp, idx) => (
                <Pressable
                  key={camp.id}
                  onPress={() => onOpenCampaigns?.(camp.id)}
                  style={({ pressed }) => [
                    styles.bannerCard,
                    { width: sliderWidth },
                    pressed && { opacity: 0.94 },
                  ]}
                  accessibilityRole="button"
                >
                  <Image
                    source={{ uri: resolveMediaUrl(camp.banner_url) || FALLBACK_BANNER }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                  <View style={styles.bannerScrim} />

                  <View style={styles.bannerContent}>
                    <View style={styles.bannerTopRow}>
                      <View style={styles.campaignBadge}>
                        <Sparkles size={11} color="#FFFFFF" />
                        <AppText style={styles.campaignBadgeText}>
                          {camp.badge_text || "Ưu đãi lễ hội"}
                        </AppText>
                      </View>

                      <View style={styles.bannerRightMeta}>
                        {new Date(camp.starts_at) > new Date() ? (
                          <View style={styles.upcomingTag}>
                            <AppText style={styles.upcomingTagText}>Sắp diễn ra</AppText>
                          </View>
                        ) : null}
                        {sortedCampaigns.length > 1 ? (
                          <View style={styles.slideCounter}>
                            <AppText style={styles.slideCounterText}>
                              {idx + 1}/{sortedCampaigns.length}
                            </AppText>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.bannerBottom}>
                      <AppText style={styles.bannerTitle} numberOfLines={1}>
                        {camp.name}
                      </AppText>
                      {camp.description ? (
                        <AppText style={styles.bannerDesc} numberOfLines={2}>
                          {camp.description}
                        </AppText>
                      ) : null}
                      <View style={styles.bannerDateRow}>
                        <Calendar size={12} color="#E0F2FE" />
                        <AppText style={styles.bannerDateText}>
                          {formatShortCampaignDate(camp.starts_at)} –{" "}
                          {formatShortCampaignDate(camp.ends_at)} · Nhấn để xem chi tiết
                        </AppText>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            {/* Nút mũi tên điều hướng Slider nếu có từ 2 chương trình trở lên */}
            {sortedCampaigns.length > 1 ? (
              <>
                <Pressable
                  onPress={handlePrevSlide}
                  style={[styles.sliderArrowBtn, styles.sliderArrowLeft]}
                  accessibilityLabel="Chương trình trước"
                >
                  <ChevronLeft size={18} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  onPress={handleNextSlide}
                  style={[styles.sliderArrowBtn, styles.sliderArrowRight]}
                  accessibilityLabel="Chương trình tiếp theo"
                >
                  <ChevronRight size={18} color="#FFFFFF" />
                </Pressable>
              </>
            ) : null}
          </View>

          {sortedCampaigns.length > 1 ? (
            <View style={styles.dotsRow}>
              {sortedCampaigns.map((c, idx) => (
                <Pressable
                  key={c.id}
                  onPress={() => goToSlide(idx)}
                  style={[styles.dot, idx === safeIdx && styles.dotActive]}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Danh sách dịch vụ ưu tiên đang có khuyến mãi — hiển thị đầy đủ thông tin */}
      {promotedServices.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dealsRow}
        >
          {promotedServices.map((item) => {
            const promo = item.active_promotion;
            const thumb =
              resolveMediaUrl(item.cover_image) ||
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
            const categoryLabel = item.category?.name || getServiceTypeLabel(item.type);
            const ratingScore = Number(item.rating_avg || 0);
            const reviewsCount = Number(item.reviews_count || 0);
            const bookingsCount = Number(item.total_bookings || 0);
            const addressText = item.address
              ? item.location?.name
                ? `${item.address}, ${item.location.name}`
                : item.address
              : item.location?.name || "Việt Nam";
            const displayedAmenities = Array.isArray(item.amenities)
              ? item.amenities.slice(0, 2)
              : [];
            const extraAmenities = Math.max(
              0,
              Number(item.amenities_count || displayedAmenities.length) - displayedAmenities.length,
            );
            const displayedPolicies = Array.isArray(item.policies) ? item.policies.slice(0, 1) : [];
            const extraPolicies = Math.max(
              0,
              Number(item.policies_count || displayedPolicies.length) - displayedPolicies.length,
            );

            return (
              <Pressable
                key={item.id}
                onPress={() => onSelectService(item)}
                style={({ pressed }) => [styles.dealCard, pressed && { opacity: 0.92 }]}
              >
                <View style={styles.imageWrap}>
                  <Image source={{ uri: thumb }} style={styles.dealImage} resizeMode="cover" />
                  {item.provider?.business_name ? (
                    <View style={styles.verifiedPill}>
                      <BadgeCheck size={12} color="#10B981" />
                      <AppText style={styles.verifiedPillText}>KYC</AppText>
                    </View>
                  ) : null}
                </View>

                <View style={styles.dealBody}>
                  <View style={styles.tagsRow}>
                    <View style={styles.categoryTag}>
                      <AppText style={styles.categoryTagText} numberOfLines={1}>
                        {categoryLabel}
                      </AppText>
                    </View>
                    <View style={styles.promoTag}>
                      <AppText style={styles.promoTagText} numberOfLines={1}>
                        {promo.badge_text}
                      </AppText>
                    </View>
                  </View>

                  <AppText style={styles.dealTitle} numberOfLines={2}>
                    {item.name}
                  </AppText>

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

                  <View style={styles.metaRow}>
                    <MapPin size={13} color={colors.brandPrimary} />
                    <AppText style={styles.metaText} numberOfLines={1}>
                      {addressText}
                    </AppText>
                  </View>

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

                  {/* Tiện nghi + chỉ báo còn thêm bên trong */}
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

                  <View style={styles.priceBlock}>
                    <View>
                      <AppText style={styles.priceFromLabel}>Giá từ</AppText>
                      <AppText style={styles.strikePrice}>
                        {formatCurrencyVnd(item.base_price)}
                      </AppText>
                    </View>
                    <View style={styles.newPriceRow}>
                      <AppText style={styles.newPrice}>
                        {formatCurrencyVnd(promo.discounted_price)}
                      </AppText>
                      <AppText style={styles.priceUnit}>
                        /{formatPriceUnit(item.price_unit, item.type)}
                      </AppText>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  sliderWrapper: {
    paddingHorizontal: spacing.md,
    marginBottom: 14,
  },
  bannerFrame: {
    position: "relative",
    borderRadius: 18,
    overflow: "hidden",
  },
  bannerCarousel: {
    width: "100%",
  },
  bannerCard: {
    aspectRatio: 16 / 9,
    backgroundColor: "#0F172A",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  bannerContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 14,
    justifyContent: "space-between",
  },
  bannerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerRightMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  upcomingTag: {
    backgroundColor: "rgba(245, 158, 11, 0.92)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  upcomingTagText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  campaignBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E11D48",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  campaignBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  slideCounter: {
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  slideCounterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bannerBottom: {
    gap: 3,
    paddingHorizontal: 22,
  },
  bannerTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bannerDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: "#F1F5F9",
  },
  bannerDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  bannerDateText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#BAE6FD",
  },
  sliderArrowBtn: {
    position: "absolute",
    top: "50%",
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(15, 23, 42, 0.56)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  sliderArrowLeft: {
    left: 8,
  },
  sliderArrowRight: {
    right: 8,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#E11D48",
  },
  dealsRow: {
    paddingHorizontal: spacing.md,
    gap: 12,
  },
  dealCard: {
    width: 266,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FECDD3",
    overflow: "hidden",
  },
  imageWrap: {
    height: 146,
    backgroundColor: "#E2E8F0",
    position: "relative",
  },
  dealImage: {
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
  dealBody: {
    padding: spacing.sm + 4,
    gap: 6,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  categoryTag: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  categoryTagText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.brandPrimary,
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
  dealTitle: {
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
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  priceFromLabel: {
    fontSize: 11,
    color: colors.inkSubtle,
  },
  strikePrice: {
    fontSize: 11,
    color: colors.inkSubtle,
    textDecorationLine: "line-through",
  },
  newPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  newPrice: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#E11D48",
  },
  priceUnit: {
    fontSize: 11,
    color: colors.inkSubtle,
  },
});
