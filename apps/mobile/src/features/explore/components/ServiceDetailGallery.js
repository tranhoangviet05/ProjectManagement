import React, { useState } from "react";
import { Dimensions, FlatList, Image, Pressable, Share, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Share2 } from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { resolveMediaUrl } from "../../../lib/apiClient";
import { radius, spacing, touchTarget } from "../../../theme/tokens";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GALLERY_HEIGHT = 290;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80";

/**
 * Bộ sưu tập ảnh full-bleed trượt ngang cho màn hình Chi tiết Dịch vụ.
 */
export default function ServiceDetailGallery({ media = [], coverImage, serviceName = "", onBack }) {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const images = React.useMemo(() => {
    const urls = Array.isArray(media)
      ? media.map((m) => resolveMediaUrl(m.url)).filter(Boolean)
      : [];
    if (urls.length > 0) return urls;
    const resolvedCover = resolveMediaUrl(coverImage);
    if (resolvedCover) return [resolvedCover];
    return [FALLBACK_IMAGE];
  }, [media, coverImage]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Khám phá "${serviceName}" trên Social Travel Booking!`,
      });
    } catch {
      // Người dùng hủy chia sẻ
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, idx) => `${item}-${idx}`}
        onMomentumScrollEnd={(e) => {
          const nextIdx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(Math.max(0, Math.min(images.length - 1, nextIdx)));
        }}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.slideImage} resizeMode="cover" />
        )}
      />

      {/* Thanh nút điều hướng nổi */}
      <View style={[styles.topActions, { top: Math.max(insets.top, 12) + 4 }]}>
        <Pressable
          onPress={onBack}
          style={styles.glassCircleBtn}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={styles.glassCircleBtn}
          accessibilityRole="button"
          accessibilityLabel="Chia sẻ dịch vụ"
        >
          <Share2 size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Bộ đếm số lượng ảnh */}
      <View style={styles.counterBadge}>
        <AppText style={styles.counterText}>
          {activeIndex + 1} / {images.length}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
    backgroundColor: "#CBD5E1",
    position: "relative",
  },
  slideImage: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
  },
  topActions: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  glassCircleBtn: {
    width: touchTarget.minHeight - 4,
    height: touchTarget.minHeight - 4,
    borderRadius: radius.full,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  counterBadge: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  counterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
