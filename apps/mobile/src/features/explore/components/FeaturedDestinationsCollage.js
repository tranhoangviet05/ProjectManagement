import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { resolveMediaUrl } from "../../../lib/apiClient";
import { colors, radius, spacing } from "../../../theme/tokens";

const FALLBACK_DESTINATIONS = [
  {
    id: "fallback-1",
    name: "Đà Nẵng",
    slug: "da-nang",
    image_url:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fallback-2",
    name: "Đà Lạt",
    slug: "da-lat",
    image_url:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fallback-3",
    name: "Phú Quốc",
    slug: "phu-quoc",
    image_url:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fallback-4",
    name: "Sa Pa",
    slug: "sa-pa",
    image_url:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fallback-5",
    name: "Vịnh Hạ Long",
    slug: "vinh-ha-long",
    image_url:
      "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=900&q=80",
  },
];

function CollageTile({ item, style, onPress }) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.tileBase, style, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`Khám phá ${item.name}`}
    >
      <Image
        source={{
          uri:
            resolveMediaUrl(item.image_url) ||
            "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
        }}
        style={styles.tileImage}
        resizeMode="cover"
      />
      <View style={styles.tileScrim} />
      <View style={styles.tileCaption}>
        <AppText style={styles.tileName} numberOfLines={1}>
          {item.name}
        </AppText>
        {item.active_services_count > 0 ? (
          <AppText style={styles.tileCount}>{item.active_services_count} dịch vụ</AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * Bộ khung 5 địa điểm nổi bật du lịch Việt Nam theo kiểu Collage 5 ảnh bất đối xứng (Instagram-style).
 */
export default function FeaturedDestinationsCollage({
  locations = [],
  onSelectLocation,
  onPressSeeAll,
}) {
  const topFive = useMemo(() => {
    const withImages = locations.filter((l) => Boolean(l.image_url));
    const popular = locations.filter((l) => l.is_popular);
    const merged = [...withImages, ...popular, ...locations].filter(
      (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx,
    );
    const picked = merged.slice(0, 5);
    if (picked.length < 5) {
      return [...picked, ...FALLBACK_DESTINATIONS.slice(picked.length, 5)];
    }
    return picked;
  }, [locations]);

  const [d1, d2, d3, d4, d5] = topFive;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <AppText style={styles.sectionTitle}>Địa điểm nổi bật</AppText>
          <AppText style={styles.sectionSubtitle}>
            5 tọa độ du lịch được yêu thích nhất Việt Nam
          </AppText>
        </View>
        <Pressable onPress={onPressSeeAll} style={styles.seeAllBtn} accessibilityRole="button">
          <AppText style={styles.seeAllText}>Xem tất cả</AppText>
          <ChevronRight size={16} color={colors.brandPrimary} />
        </Pressable>
      </View>

      {/* Bộ khung 5 ảnh bất đối xứng: cột trái (1 ảnh lớn + 1 ảnh vừa), cột phải (3 ảnh xếp tầng) */}
      <View style={styles.collageFrame}>
        <View style={styles.leftColumn}>
          <CollageTile item={d1} style={styles.tileTall} onPress={onSelectLocation} />
          <CollageTile item={d2} style={styles.tileMedium} onPress={onSelectLocation} />
        </View>
        <View style={styles.rightColumn}>
          <CollageTile item={d3} style={styles.tileCompact} onPress={onSelectLocation} />
          <CollageTile item={d4} style={styles.tileCompactTall} onPress={onSelectLocation} />
          <CollageTile item={d5} style={styles.tileCompact} onPress={onSelectLocation} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
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
  collageFrame: {
    flexDirection: "row",
    gap: 6,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    padding: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  leftColumn: {
    flex: 1.18,
    gap: 6,
  },
  rightColumn: {
    flex: 1,
    gap: 6,
  },
  tileBase: {
    borderRadius: radius.md,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#CBD5E1",
  },
  tileTall: {
    height: 164,
  },
  tileMedium: {
    height: 112,
  },
  tileCompact: {
    height: 84,
  },
  tileCompactTall: {
    height: 102,
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  tileScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  tileCaption: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 8,
  },
  tileName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tileCount: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E0F2FE",
    marginTop: 1,
  },
});
