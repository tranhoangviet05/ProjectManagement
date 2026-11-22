import React, { useMemo, useState } from "react";
import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { colors, radius, spacing, touchTarget } from "../../../theme/tokens";
import { formatCurrencyVnd } from "../models/exploreModel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GALLERY_HEIGHT = 260;
const FALLBACK_ROOM_IMAGE =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80";

/**
 * Màn hình Chi tiết Loại phòng cho dịch vụ Chỗ ở (Khách sạn / Homestay / Villa).
 */
export default function RoomTypeDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const room = route?.params?.room || {};
  const service = route?.params?.service || {};
  const [activeIndex, setActiveIndex] = useState(0);

  const images = useMemo(() => {
    const roomImgs = Array.isArray(room.images) ? room.images.filter(Boolean) : [];
    if (roomImgs.length > 0) return roomImgs;
    const svcMedia = Array.isArray(service.media)
      ? service.media.map((m) => m.url).filter(Boolean)
      : [];
    if (svcMedia.length > 0) return svcMedia;
    if (service.cover_image) return [service.cover_image];
    return [FALLBACK_ROOM_IMAGE];
  }, [room.images, service.media, service.cover_image]);

  const amenities = Array.isArray(room.amenities) ? room.amenities : [];
  const availableCount = room.inventory ?? room.total_rooms ?? 0;
  const price = Number(room.base_price || service.base_price || 0);
  const depositAmount = Math.round(price * 0.3);

  const handleSelectRoom = () => {
    if (service?.id && room?.id) {
      navigation.navigate({
        name: "Detail",
        params: {
          serviceId: service.id,
          tour: service,
          selectedRoomId: room.id,
        },
        merge: true,
      });
      return;
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 100 }}
      >
        {/* Gallery ảnh phòng */}
        <View style={styles.galleryWrap}>
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

          <View style={styles.topScrim} pointerEvents="none" />

          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { top: Math.max(insets.top, 12) + 4 }]}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>

          <View style={styles.counterBadge}>
            <AppText style={styles.counterText}>
              {activeIndex + 1} / {images.length}
            </AppText>
          </View>
        </View>

        <View style={styles.contentWrap}>
          {/* Thông tin hạng phòng */}
          <View style={styles.card}>
            {room.rank ? (
              <View style={styles.rankBadge}>
                <Sparkles size={12} color={colors.brandPrimary} />
                <AppText style={styles.rankBadgeText}>{room.rank}</AppText>
              </View>
            ) : null}

            <AppText style={styles.roomTitle}>{room.name || "Chi tiết hạng phòng"}</AppText>
            {service?.name ? <AppText style={styles.serviceSub}>{service.name}</AppText> : null}

            <View style={styles.specsGrid}>
              <View style={styles.specBox}>
                <Users size={16} color={colors.brandPrimary} />
                <View style={{ flex: 1 }}>
                  <AppText style={styles.specLabel}>Sức chứa tối đa</AppText>
                  <AppText style={styles.specValue}>
                    {room.capacity_adults || 2} người lớn
                    {room.capacity_children > 0 ? `, ${room.capacity_children} trẻ em` : ""}
                  </AppText>
                </View>
              </View>

              <View style={styles.specBox}>
                <BedDouble size={16} color={colors.brandPrimary} />
                <View style={{ flex: 1 }}>
                  <AppText style={styles.specLabel}>Tình trạng phòng</AppText>
                  <AppText style={styles.specValue}>
                    {availableCount > 0 ? `Còn ${availableCount} phòng trống` : "Tạm hết phòng"}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          {/* Mô tả hạng phòng */}
          {room.description ? (
            <View style={styles.card}>
              <AppText style={styles.sectionTitle}>Mô tả hạng phòng</AppText>
              <AppText style={styles.descText}>{room.description}</AppText>
            </View>
          ) : null}

          {/* Tiện nghi trong phòng */}
          <View style={styles.card}>
            <AppText style={styles.sectionTitle}>Tiện nghi phòng</AppText>
            {amenities.length > 0 ? (
              <View style={styles.amenitiesList}>
                {amenities.map((item, idx) => (
                  <View key={`${item}-${idx}`} style={styles.amenityRow}>
                    <CheckCircle2 size={15} color="#059669" />
                    <AppText style={styles.amenityText}>{item}</AppText>
                  </View>
                ))}
              </View>
            ) : (
              <AppText style={styles.emptyText}>
                Đầy đủ tiện nghi tiêu chuẩn của cơ sở lưu trú.
              </AppText>
            )}
          </View>

          {/* Chính sách Cọc an toàn 30% Escrow */}
          <View style={styles.escrowCard}>
            <ShieldCheck size={20} color="#059669" />
            <View style={{ flex: 1, gap: 3 }}>
              <AppText style={styles.escrowTitle}>Chính sách Cọc an toàn 30% (Escrow)</AppText>
              <AppText style={styles.escrowDesc}>
                Giữ phòng ngay chỉ với {formatCurrencyVnd(depositAmount)} (30% giá phòng). Số tiền
                này được bảo vệ an toàn đến khi bạn quét mã QR check-in thành công.
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Thanh chọn phòng cố định phía dưới */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <View style={styles.priceCol}>
          <AppText style={styles.priceLabel}>Giá mỗi đêm</AppText>
          <View style={styles.priceRow}>
            <AppText style={styles.priceValue}>{formatCurrencyVnd(price)}</AppText>
            <AppText style={styles.priceUnit}>/đêm</AppText>
          </View>
          <AppText style={styles.depositHint}>
            Cọc trước 30%: {formatCurrencyVnd(depositAmount)}
          </AppText>
        </View>

        <Pressable
          style={({ pressed }) => [styles.selectBtn, pressed && { opacity: 0.9 }]}
          onPress={handleSelectRoom}
          accessibilityRole="button"
        >
          <AppText style={styles.selectBtnText}>Chọn hạng phòng này</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceBase,
  },
  galleryWrap: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
    backgroundColor: "#CBD5E1",
    position: "relative",
  },
  slideImage: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
  },
  topScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 92,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
  },
  backBtn: {
    position: "absolute",
    left: spacing.md,
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
  contentWrap: {
    padding: spacing.md,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: spacing.md,
    gap: 10,
  },
  rankBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  rankBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.inkPrimary,
    lineHeight: 26,
  },
  serviceSub: {
    fontSize: 13,
    color: colors.inkSubtle,
    marginTop: -4,
  },
  specsGrid: {
    gap: 8,
    marginTop: 2,
  },
  specBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  specLabel: {
    fontSize: 11.5,
    color: colors.inkSubtle,
  },
  specValue: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  descText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.inkBody,
  },
  amenitiesList: {
    gap: 8,
  },
  amenityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amenityText: {
    flex: 1,
    fontSize: 13.5,
    color: colors.inkBody,
  },
  emptyText: {
    fontSize: 13.5,
    color: colors.inkSubtle,
  },
  escrowCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 16,
    padding: spacing.md,
  },
  escrowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
  },
  escrowDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#047857",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  priceCol: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11.5,
    color: colors.inkSubtle,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  priceValue: {
    fontSize: 17.5,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  priceUnit: {
    fontSize: 12,
    color: colors.inkSubtle,
  },
  depositHint: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
    marginTop: 1,
  },
  selectBtn: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 18,
    minHeight: touchTarget.minHeight,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  selectBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
