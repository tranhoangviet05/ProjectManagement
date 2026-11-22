import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { ArrowRight, Sparkles, X } from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { colors, radius, spacing, touchTarget } from "../../../theme/tokens";

export default function AiPlannerBanner() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.section}>
      <View style={styles.bannerCard}>
        <View style={styles.badgeRow}>
          <View style={styles.aiBadge}>
            <Sparkles size={13} color="#38BDF8" />
            <AppText style={styles.aiBadgeText}>Trợ lý du lịch AI</AppText>
          </View>
        </View>

        <AppText style={styles.headline}>Bạn chưa biết đi đâu? Hãy để chúng tôi giúp bạn</AppText>
        <AppText style={styles.description}>
          Chỉ cần chọn ngân sách, số ngày và sở thích — AI sẽ tự động gợi ý lịch trình tối ưu kèm
          chỗ ở và trải nghiệm phù hợp nhất.
        </AppText>

        <Pressable
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.9 }]}
          accessibilityRole="button"
        >
          <Sparkles size={17} color="#0B1320" />
          <AppText style={styles.ctaText}>Tạo lịch trình du lịch bằng AI</AppText>
          <ArrowRight size={16} color="#0B1320" />
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Sparkles size={20} color={colors.brandPrimary} />
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
                accessibilityLabel="Đóng"
              >
                <X size={20} color={colors.inkPrimary} />
              </Pressable>
            </View>
            <AppText style={styles.modalTitle}>Tính năng AI đang được phát triển</AppText>
            <AppText style={styles.modalDesc}>
              Trợ lý tạo lịch trình du lịch thông minh bằng AI sẽ sớm có mặt trong bản cập nhật tới,
              giúp bạn lập kế hoạch tự động từ điểm đến, ngân sách đến dịch vụ đặt chỗ.
            </AppText>
            <Pressable style={styles.modalConfirmBtn} onPress={() => setModalVisible(false)}>
              <AppText style={styles.modalConfirmText}>Đã hiểu</AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  bannerCard: {
    backgroundColor: "#0B1320",
    borderRadius: 20,
    padding: spacing.lg,
    gap: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  badgeRow: {
    flexDirection: "row",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(56, 189, 248, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7DD3FC",
  },
  headline: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 20,
    color: "#CBD5E1",
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#38BDF8",
    minHeight: 48,
    borderRadius: radius.lg,
    marginTop: 6,
    paddingHorizontal: spacing.md,
  },
  ctaText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0B1320",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.52)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: spacing.lg,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: touchTarget.minHeight,
    height: touchTarget.minHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkBody,
  },
  modalConfirmBtn: {
    backgroundColor: colors.brandPrimary,
    minHeight: 46,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  modalConfirmText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
