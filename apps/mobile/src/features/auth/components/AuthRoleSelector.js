import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import AppText from "../../../components/common/AppText";
import { colors, spacing, radius } from "../../../theme/tokens";

/**
 * Component lựa chọn vai trò Du khách (Tourist) hoặc Nhà cung cấp (Provider) khi đăng ký
 */
export default function AuthRoleSelector({ role = "tourist", onSelectRole }) {
  return (
    <View style={styles.fieldGroup}>
      <AppText variant="label" style={styles.fieldLabel}>
        Chọn vai trò sử dụng ứng dụng
      </AppText>
      <View style={styles.roleRow}>
        <Pressable
          onPress={() => onSelectRole?.("tourist")}
          style={({ pressed }) => [
            styles.roleOption,
            role === "tourist" && styles.roleOptionActive,
            pressed && styles.pressedSubtle,
          ]}
        >
          <AppText
            variant="label"
            style={[styles.roleTitle, role === "tourist" && styles.roleTitleActive]}
          >
            Khách du lịch
          </AppText>
          <AppText variant="caption" style={styles.roleDesc}>
            Đặt tour, phòng & chia sẻ lịch trình
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => onSelectRole?.("provider")}
          style={({ pressed }) => [
            styles.roleOption,
            role === "provider" && styles.roleOptionActive,
            pressed && styles.pressedSubtle,
          ]}
        >
          <AppText
            variant="label"
            style={[styles.roleTitle, role === "provider" && styles.roleTitleActive]}
          >
            Nhà cung cấp
          </AppText>
          <AppText variant="caption" style={styles.roleDesc}>
            Bán tour, quản lý phòng & quét vé QR
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.inkPrimary,
  },
  roleRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  roleOption: {
    flex: 1,
    minHeight: 76,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    justifyContent: "center",
  },
  roleOptionActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandSubtle,
  },
  pressedSubtle: {
    opacity: 0.85,
  },
  roleTitle: {
    color: colors.inkPrimary,
    marginBottom: 2,
  },
  roleTitleActive: {
    color: colors.brandHover,
    marginBottom: 2,
    fontWeight: "700",
  },
  roleDesc: {
    color: colors.inkSubtle,
    lineHeight: 16,
  },
});
