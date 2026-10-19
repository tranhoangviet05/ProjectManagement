import React from "react";
import { StyleSheet, View } from "react-native";
import AppText from "../../../components/common/AppText";
import { colors, spacing, radius } from "../../../theme/tokens";

/**
 * Component khối tiêu đề Coastal Night trên Mobile Auth
 */
export default function AuthHeroHeader({ mode = "login" }) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.brandRow}>
        <View style={styles.brandBadge}>
          <AppText variant="caption" style={styles.brandBadgeText}>
            Social Travel Booking
          </AppText>
        </View>
        <View style={styles.liveDotRow}>
          <View style={styles.liveDot} />
          <AppText variant="caption" style={styles.liveText}>
            Đồng bộ Realtime
          </AppText>
        </View>
      </View>

      <AppText variant="h1" style={styles.heroTitle}>
        {mode === "login" ? "Khởi đầu hành trình mới" : "Tham gia cộng đồng xê dịch"}
      </AppText>
      <AppText variant="bodySmall" style={styles.heroSubtitle}>
        {mode === "login"
          ? "Đăng nhập để quản lý vé QR check-in, chia sẻ trải nghiệm hoặc vận hành dịch vụ du lịch."
          : "Tài khoản tự động phân luồng giao diện dành riêng cho Du khách hoặc Nhà cung cấp."}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surfaceObsidian,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.base,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  brandBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: "rgba(2, 132, 199, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(224, 242, 254, 0.25)",
  },
  brandBadgeText: {
    color: colors.brandLight,
    fontWeight: "700",
  },
  liveDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  liveText: {
    color: "#CBD5E1",
  },
  heroTitle: {
    color: colors.inkInverse,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    color: "#CBD5E1",
  },
});
