import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Calendar,
  Flame,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { resolveMediaUrl } from "../../../lib/apiClient";
import { colors, radius, spacing, touchTarget } from "../../../theme/tokens";
import { useExploreData } from "../context/ExploreDataContext";
import { formatCurrencyVnd, formatPriceUnit } from "../models/exploreModel";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

function formatFullCampaignDate(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Màn hình Chi tiết các Chương trình Khuyến mãi đang mở (xếp theo độ ưu tiên từ trên xuống).
 */
export default function HolidayCampaignsScreen({ navigation }) {
  const { campaigns, services } = useExploreData();

  const sortedCampaigns = useMemo(
    () => [...campaigns].sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0)),
    [campaigns],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={20} color={colors.inkPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText style={styles.headerTitle}>Chương trình khuyến mãi</AppText>
          <AppText style={styles.headerSub}>
            {sortedCampaigns.length} chương trình ưu đãi đang diễn ra
          </AppText>
        </View>
      </View>

      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedCampaigns.length === 0 ? (
          <View style={styles.emptyBox}>
            <Flame size={30} color={colors.inkSubtle} />
            <AppText style={styles.emptyTitle}>Hiện chưa có chương trình khuyến mãi nào</AppText>
            <AppText style={styles.emptyDesc}>
              Các chương trình ưu đãi lễ hội mới sẽ sớm được cập nhật tại đây.
            </AppText>
          </View>
        ) : (
          sortedCampaigns.map((camp) => {
            const matchedServices = services.filter(
              (s) => s.active_promotion?.campaign_id === camp.id,
            );

            return (
              <View key={camp.id} style={styles.campaignBlock}>
                <View style={styles.bannerWrap}>
                  <Image
                    source={{ uri: resolveMediaUrl(camp.banner_url) || FALLBACK_BANNER }}
                    style={styles.bannerImg}
                    resizeMode="cover"
                  />
                  <View style={styles.bannerOverlay} />
                  <View style={styles.bannerBadge}>
                    <Sparkles size={12} color="#FFFFFF" />
                    <AppText style={styles.bannerBadgeText}>
                      {camp.badge_text || "Ưu đãi lễ hội"}
                    </AppText>
                  </View>
                </View>

                <View style={styles.campaignInfo}>
                  <AppText style={styles.campaignTitle}>{camp.name}</AppText>

                  {camp.description ? (
                    <AppText style={styles.campaignDesc}>{camp.description}</AppText>
                  ) : null}

                  <View style={styles.metaList}>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color={colors.brandPrimary} />
                      <AppText style={styles.metaItemText}>
                        Thời gian: {formatFullCampaignDate(camp.starts_at)} –{" "}
                        {formatFullCampaignDate(camp.ends_at)}
                      </AppText>
                    </View>
                    <View style={styles.metaItem}>
                      <Flame size={14} color="#E11D48" />
                      <AppText style={styles.metaItemText}>
                        Mức giảm từ{" "}
                        {camp.discount_type === "fixed"
                          ? formatCurrencyVnd(camp.discount_value)
                          : `${camp.discount_value}%`}
                        {camp.max_discount
                          ? ` (tối đa ${formatCurrencyVnd(camp.max_discount)})`
                          : ""}
                      </AppText>
                    </View>
                  </View>

                  {/* Dịch vụ tham gia chiến dịch này */}
                  {matchedServices.length > 0 ? (
                    <View style={styles.servicesWrap}>
                      <AppText style={styles.servicesHeading}>
                        Dịch vụ đang tham gia ({matchedServices.length})
                      </AppText>
                      <View style={styles.servicesList}>
                        {matchedServices.map((svc) => {
                          const promo = svc.active_promotion;
                          const shownPolicy = svc.policies?.[0];
                          const extraPolicies = Math.max(
                            0,
                            Number(svc.policies_count || 0) - (shownPolicy ? 1 : 0),
                          );

                          return (
                            <Pressable
                              key={svc.id}
                              style={styles.serviceRow}
                              onPress={() =>
                                navigation.navigate("Detail", {
                                  serviceId: svc.id,
                                  tour: svc,
                                })
                              }
                            >
                              <Image
                                source={{
                                  uri:
                                    resolveMediaUrl(svc.cover_image) ||
                                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
                                }}
                                style={styles.svcThumb}
                                resizeMode="cover"
                              />
                              <View style={styles.svcInfo}>
                                <AppText style={styles.svcName} numberOfLines={2}>
                                  {svc.name}
                                </AppText>
                                <View style={styles.svcMetaRow}>
                                  <MapPin size={12} color={colors.brandPrimary} />
                                  <AppText style={styles.svcLoc} numberOfLines={1}>
                                    {svc.location?.name || "Việt Nam"}
                                  </AppText>
                                  <Star size={11} color="#F59E0B" fill="#F59E0B" />
                                  <AppText style={styles.svcRating}>
                                    {Number(svc.rating_avg || 0) > 0
                                      ? Number(svc.rating_avg).toFixed(1)
                                      : "Mới"}
                                  </AppText>
                                </View>

                                {shownPolicy ? (
                                  <View style={styles.policyRow}>
                                    <ShieldCheck size={11} color="#059669" />
                                    <AppText style={styles.policyText} numberOfLines={1}>
                                      {shownPolicy.name}
                                      {extraPolicies > 0 ? ` (+${extraPolicies})` : ""}
                                    </AppText>
                                  </View>
                                ) : null}

                                <View style={styles.svcPriceRow}>
                                  <AppText style={styles.svcStrike}>
                                    {formatCurrencyVnd(svc.base_price)}
                                  </AppText>
                                  <AppText style={styles.svcPrice}>
                                    {formatCurrencyVnd(promo.discounted_price)}
                                  </AppText>
                                  <AppText style={styles.svcUnit}>
                                    /{formatPriceUnit(svc.price_unit, svc.type)}
                                  </AppText>
                                </View>
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ) : (
                    <AppText style={styles.noServicesNote}>
                      Chưa có dịch vụ nào nằm trong chương trình khuyến mãi này.
                    </AppText>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: touchTarget.minHeight,
    height: touchTarget.minHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: colors.inkSubtle,
  },
  bodyScroll: {
    flex: 1,
    backgroundColor: colors.surfaceBase,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
    gap: 16,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 56,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  emptyDesc: {
    fontSize: 13.5,
    color: colors.inkBody,
    textAlign: "center",
  },
  campaignBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  bannerWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#0F172A",
    position: "relative",
  },
  bannerImg: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
  },
  bannerBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E11D48",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  bannerBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  campaignInfo: {
    padding: spacing.md,
    gap: 10,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  campaignDesc: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.inkBody,
  },
  metaList: {
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  metaItemText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.inkBody,
    flex: 1,
  },
  servicesWrap: {
    gap: 8,
    marginTop: 4,
  },
  servicesHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  servicesList: {
    gap: 10,
  },
  serviceRow: {
    flexDirection: "row",
    gap: 10,
    padding: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  svcThumb: {
    width: 88,
    height: 96,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  svcInfo: {
    flex: 1,
    gap: 4,
    justifyContent: "space-between",
  },
  svcName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.inkPrimary,
    lineHeight: 19,
  },
  svcMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  svcLoc: {
    fontSize: 12,
    color: colors.inkBody,
    flex: 1,
  },
  svcRating: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  policyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  policyText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
    flex: 1,
  },
  svcPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    flexWrap: "wrap",
  },
  svcStrike: {
    fontSize: 11.5,
    color: colors.inkSubtle,
    textDecorationLine: "line-through",
  },
  svcPrice: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#E11D48",
  },
  svcUnit: {
    fontSize: 11,
    color: colors.inkSubtle,
  },
  noServicesNote: {
    fontSize: 12.5,
    color: colors.inkSubtle,
    fontStyle: "italic",
  },
});
