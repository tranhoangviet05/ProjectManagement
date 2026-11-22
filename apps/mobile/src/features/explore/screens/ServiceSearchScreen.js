import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import Skeleton from "../../../components/common/Skeleton";
import { resolveMediaUrl } from "../../../lib/apiClient";
import { colors, radius, spacing, touchTarget } from "../../../theme/tokens";
import exploreService from "../services/exploreService";
import { useExploreData } from "../context/ExploreDataContext";
import {
  HOME_CATEGORIES,
  PRICE_PRESETS,
  SORT_OPTIONS,
  formatCurrencyVnd,
  formatPriceUnit,
  getRatingVerdict,
  getServiceTypeLabel,
} from "../models/exploreModel";

function ResultSkeletonList() {
  return (
    <View style={styles.skeletonWrap}>
      {[1, 2, 3, 4].map((idx) => (
        <View key={idx} style={styles.skeletonCard}>
          <Skeleton width={104} height={104} borderRadius={12} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="85%" height={16} />
            <Skeleton width="55%" height={13} />
            <Skeleton width="45%" height={18} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Màn hình Kết quả Tìm kiếm & Bộ lọc Dịch vụ (Điểm đến, Từ khóa, Danh mục, Khoảng giá, Sắp xếp).
 * Đồng bộ trạng thái lọc trực tiếp qua route.params.
 */
export default function ServiceSearchScreen({ navigation, route }) {
  const initialParams = route?.params || {};
  const { locations } = useExploreData();

  const [keyword, setKeyword] = useState(initialParams.q || "");
  const [group, setGroup] = useState(initialParams.group || "");
  const [locationId, setLocationId] = useState(initialParams.location_id || "");
  const [locationName, setLocationName] = useState(initialParams.location_name || "");
  const [minPrice, setMinPrice] = useState(initialParams.min_price || "");
  const [maxPrice, setMaxPrice] = useState(initialParams.max_price || "");
  const [sort, setSort] = useState(initialParams.sort || "newest");

  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const fetchResults = useCallback(async (params) => {
    setLoading(true);
    try {
      const response = await exploreService.fetchServices({
        q: params.q || undefined,
        group: params.group || undefined,
        location_id: params.location_id || undefined,
        min_price: params.min_price || undefined,
        max_price: params.max_price || undefined,
        sort: params.sort || "newest",
        per_page: 25,
      });
      setResults(Array.isArray(response?.data) ? response.data : []);
      setTotalCount(response?.meta?.total ?? (response?.data?.length || 0));
    } catch {
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const queryPayload = {
      q: keyword.trim(),
      group,
      location_id: locationId,
      min_price: minPrice,
      max_price: maxPrice,
      sort,
    };
    navigation.setParams({
      ...queryPayload,
      location_name: locationName,
    });

    const timer = setTimeout(() => {
      fetchResults(queryPayload);
    }, 220);

    return () => clearTimeout(timer);
  }, [
    keyword,
    group,
    locationId,
    locationName,
    minPrice,
    maxPrice,
    sort,
    fetchResults,
    navigation,
  ]);

  const handleResetFilters = () => {
    setKeyword("");
    setGroup("");
    setLocationId("");
    setLocationName("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  const activePricePresetId =
    PRICE_PRESETS.find((p) => p.min === minPrice && p.max === maxPrice)?.id || "custom";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      {/* Thanh tìm kiếm trên cùng */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={20} color={colors.inkPrimary} />
        </Pressable>

        <View style={styles.searchBox}>
          <Search size={16} color={colors.inkSubtle} />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm khách sạn, tour, địa điểm..."
            placeholderTextColor={colors.inkSubtle}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {keyword ? (
            <Pressable onPress={() => setKeyword("")} hitSlop={8}>
              <X size={15} color={colors.inkSubtle} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={() => setFilterModalOpen(true)}
          style={[
            styles.iconBtn,
            (minPrice || maxPrice || sort !== "newest") && styles.iconBtnActive,
          ]}
          accessibilityLabel="Bộ lọc nâng cao"
        >
          <SlidersHorizontal
            size={19}
            color={
              minPrice || maxPrice || sort !== "newest" ? colors.brandPrimary : colors.inkPrimary
            }
          />
        </Pressable>
      </View>

      {/* Thanh bộ lọc nhanh theo Danh mục & Điểm đến */}
      <View style={styles.filterStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          {locationName ? (
            <Pressable
              style={[styles.chip, styles.chipActive]}
              onPress={() => {
                setLocationId("");
                setLocationName("");
              }}
            >
              <MapPin size={13} color="#FFFFFF" />
              <AppText style={styles.chipTextActive}>{locationName}</AppText>
              <X size={13} color="#FFFFFF" />
            </Pressable>
          ) : null}

          <Pressable
            style={[styles.chip, !group && styles.chipActive]}
            onPress={() => setGroup("")}
          >
            <AppText style={[styles.chipText, !group && styles.chipTextActive]}>Tất cả</AppText>
          </Pressable>

          {HOME_CATEGORIES.map((cat) => {
            const selected = group === cat.apiGroup;
            return (
              <Pressable
                key={cat.id}
                style={[styles.chip, selected && styles.chipActive]}
                onPress={() => setGroup(selected ? "" : cat.apiGroup)}
              >
                <AppText style={[styles.chipText, selected && styles.chipTextActive]}>
                  {cat.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.bodyContainer}>
        {/* Tổng quan số lượng kết quả */}
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryText}>
            {loading ? "Đang tìm dịch vụ phù hợp..." : `Tìm thấy ${totalCount} dịch vụ`}
          </AppText>
          {(keyword || group || locationId || minPrice || maxPrice) && (
            <Pressable onPress={handleResetFilters}>
              <AppText style={styles.resetText}>Xóa bộ lọc</AppText>
            </Pressable>
          )}
        </View>

        {loading ? (
          <ResultSkeletonList />
        ) : (
          <FlatList
            style={styles.resultsList}
            data={results}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => {
              const displayName = item.name || item.title || "Dịch vụ du lịch";
              const thumb =
                resolveMediaUrl(item.cover_image || item.primary_image) ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
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

              const displayedPolicies = Array.isArray(item.policies)
                ? item.policies.slice(0, 1)
                : [];
              const extraPolicies = Math.max(
                0,
                Number(item.policies_count || displayedPolicies.length) - displayedPolicies.length,
              );

              const categoryLabel = item.category?.name || getServiceTypeLabel(item.type);

              return (
                <Pressable
                  style={styles.resultCard}
                  onPress={() => navigation.navigate("Detail", { serviceId: item.id, tour: item })}
                >
                  <View style={styles.resultImageWrap}>
                    <Image source={{ uri: thumb }} style={styles.resultImage} resizeMode="cover" />
                  </View>

                  <View style={styles.resultBody}>
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

                    <AppText style={styles.resultTitle} numberOfLines={2}>
                      {displayName}
                    </AppText>

                    <View style={styles.ratingRow}>
                      <View style={styles.scoreBox}>
                        <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
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
                            : ""}
                      </AppText>
                    </View>

                    <View style={styles.locRow}>
                      <MapPin size={12} color={colors.brandPrimary} />
                      <AppText style={styles.locText} numberOfLines={1}>
                        {addressText}
                      </AppText>
                    </View>

                    {item.provider?.business_name ? (
                      <View style={styles.locRow}>
                        <Building2 size={12} color={colors.inkSubtle} />
                        <AppText style={styles.providerText} numberOfLines={1}>
                          {item.provider.business_name}
                        </AppText>
                        <BadgeCheck size={12} color="#10B981" />
                      </View>
                    ) : null}

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
                            <AppText style={styles.moreChipText}>
                              +{extraPolicies} chính sách
                            </AppText>
                          </View>
                        ) : null}
                      </View>
                    ) : null}

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
                            <AppText style={styles.moreChipText}>
                              +{extraAmenities} tiện nghi
                            </AppText>
                          </View>
                        ) : null}
                      </View>
                    ) : null}

                    <View style={styles.priceFooter}>
                      <View>
                        <AppText style={styles.priceFromText}>Giá từ</AppText>
                        {item.active_promotion ? (
                          <AppText style={styles.strikePriceText}>
                            {formatCurrencyVnd(item.base_price)}
                          </AppText>
                        ) : null}
                      </View>
                      <View style={styles.priceValueRow}>
                        <AppText
                          style={[
                            styles.resultPrice,
                            item.active_promotion && { color: "#E11D48" },
                          ]}
                        >
                          {formatCurrencyVnd(
                            item.active_promotion
                              ? item.active_promotion.discounted_price
                              : item.base_price,
                          )}
                        </AppText>
                        <AppText style={styles.priceUnitText}>
                          /{formatPriceUnit(item.price_unit, item.type)}
                        </AppText>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <AppText style={styles.emptyTitle}>Chưa tìm thấy dịch vụ phù hợp</AppText>
                <AppText style={styles.emptyDesc}>
                  Thử đổi điểm đến, nới rộng khoảng giá hoặc tìm bằng từ khóa khác.
                </AppText>
                <Pressable style={styles.emptyResetBtn} onPress={handleResetFilters}>
                  <AppText style={styles.emptyResetText}>Xem tất cả dịch vụ</AppText>
                </Pressable>
              </View>
            }
          />
        )}
      </View>

      {/* Modal Bộ lọc Khoảng giá, Điểm đến & Sắp xếp */}
      <Modal
        visible={filterModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>Bộ lọc tìm kiếm</AppText>
              <Pressable onPress={() => setFilterModalOpen(false)} style={styles.iconBtn}>
                <X size={20} color={colors.inkPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <AppText style={styles.filterGroupLabel}>Khoảng giá nhanh</AppText>
              <View style={styles.presetWrap}>
                {PRICE_PRESETS.map((preset) => {
                  const selected = activePricePresetId === preset.id;
                  return (
                    <Pressable
                      key={preset.id}
                      style={[styles.modalChip, selected && styles.modalChipActive]}
                      onPress={() => {
                        setMinPrice(preset.min);
                        setMaxPrice(preset.max);
                      }}
                    >
                      <AppText
                        style={[styles.modalChipText, selected && styles.modalChipTextActive]}
                      >
                        {preset.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>

              <AppText style={styles.filterGroupLabel}>Hoặc nhập khoảng giá (VNĐ)</AppText>
              <View style={styles.priceInputRow}>
                <TextInput
                  value={minPrice}
                  onChangeText={(t) => setMinPrice(t.replace(/[^0-9]/g, ""))}
                  placeholder="Giá tối thiểu"
                  placeholderTextColor={colors.inkSubtle}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
                <AppText style={{ color: colors.inkSubtle }}>–</AppText>
                <TextInput
                  value={maxPrice}
                  onChangeText={(t) => setMaxPrice(t.replace(/[^0-9]/g, ""))}
                  placeholder="Giá tối đa"
                  placeholderTextColor={colors.inkSubtle}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
              </View>

              <AppText style={styles.filterGroupLabel}>Điểm đến phổ biến</AppText>
              <View style={styles.presetWrap}>
                {locations.slice(0, 10).map((loc) => {
                  const selected = String(locationId) === String(loc.id);
                  return (
                    <Pressable
                      key={loc.id}
                      style={[styles.modalChip, selected && styles.modalChipActive]}
                      onPress={() => {
                        if (selected) {
                          setLocationId("");
                          setLocationName("");
                        } else {
                          setLocationId(loc.id);
                          setLocationName(loc.name);
                        }
                      }}
                    >
                      <AppText
                        style={[styles.modalChipText, selected && styles.modalChipTextActive]}
                      >
                        {loc.name}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>

              <AppText style={styles.filterGroupLabel}>Sắp xếp theo</AppText>
              <View style={styles.presetWrap}>
                {SORT_OPTIONS.map((opt) => {
                  const selected = sort === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      style={[styles.modalChip, selected && styles.modalChipActive]}
                      onPress={() => setSort(opt.id)}
                    >
                      <AppText
                        style={[styles.modalChipText, selected && styles.modalChipTextActive]}
                      >
                        {opt.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.resetOutlineBtn} onPress={handleResetFilters}>
                <AppText style={styles.resetOutlineText}>Đặt lại</AppText>
              </Pressable>
              <Pressable style={styles.applyPrimaryBtn} onPress={() => setFilterModalOpen(false)}>
                <AppText style={styles.applyPrimaryText}>Áp dụng bộ lọc</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bodyContainer: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.surfaceBase,
  },
  resultsList: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  iconBtn: {
    width: touchTarget.minHeight,
    height: touchTarget.minHeight,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnActive: {
    backgroundColor: "#E0F2FE",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    minHeight: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.inkPrimary,
  },
  filterStrip: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterChipsRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: "#F1F5F9",
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.inkBody,
  },
  chipTextActive: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.inkBody,
  },
  resetText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  skeletonWrap: {
    paddingHorizontal: spacing.md,
    gap: 12,
  },
  skeletonCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl * 2,
    gap: 12,
  },
  resultCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
  },
  resultImageWrap: {
    width: 112,
    height: 158,
    flexShrink: 0,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    position: "relative",
  },
  resultImage: {
    width: 112,
    height: 158,
  },
  resultBody: {
    flex: 1,
    gap: 5,
    paddingVertical: 2,
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
    fontSize: 10.5,
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
  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.inkPrimary,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  scoreBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#0284C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  scoreBoxText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  verdictText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  reviewMetaText: {
    fontSize: 11,
    color: colors.inkSubtle,
    flex: 1,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locText: {
    fontSize: 12,
    color: colors.inkBody,
    flex: 1,
  },
  providerText: {
    fontSize: 11.5,
    color: colors.inkSubtle,
    flexShrink: 1,
  },
  policiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  policyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    maxWidth: 145,
  },
  policyChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#059669",
    flexShrink: 1,
  },
  perksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  perkChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    maxWidth: 105,
  },
  perkChipText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: colors.inkBody,
  },
  moreChip: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  moreChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  priceFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  priceFromText: {
    fontSize: 11,
    color: colors.inkSubtle,
  },
  priceValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  priceUnitText: {
    fontSize: 10.5,
    color: colors.inkSubtle,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: spacing.lg,
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
    lineHeight: 20,
  },
  emptyResetBtn: {
    marginTop: 8,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radius.lg,
  },
  emptyResetText: {
    fontSize: 13.5,
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
    maxHeight: "84%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  filterGroupLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.inkPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  presetWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalChipActive: {
    backgroundColor: "#E0F2FE",
    borderColor: colors.brandPrimary,
  },
  modalChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.inkBody,
  },
  modalChipTextActive: {
    color: colors.brandPrimary,
    fontWeight: "700",
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  priceInput: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    minHeight: 44,
    fontSize: 14,
    color: colors.inkPrimary,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 10,
    marginTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  resetOutlineBtn: {
    flex: 0.4,
    minHeight: 46,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  resetOutlineText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  applyPrimaryBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  applyPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
