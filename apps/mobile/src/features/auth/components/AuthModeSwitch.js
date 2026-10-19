import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import AppText from "../../../components/common/AppText";
import { colors, spacing, radius, touchTarget } from "../../../theme/tokens";

/**
 * Component thanh chuyển đổi Đăng nhập / Đăng ký (Segmented Control 48pt)
 */
export default function AuthModeSwitch({ mode = "login", onSelectMode }) {
  return (
    <View style={styles.segmentedBar}>
      <Pressable
        onPress={() => onSelectMode?.("login")}
        style={({ pressed }) => [
          styles.segmentItem,
          mode === "login" && styles.segmentItemActive,
          pressed && styles.pressedSubtle,
        ]}
      >
        <AppText
          variant="label"
          style={[styles.segmentText, mode === "login" && styles.segmentTextActive]}
        >
          Đăng nhập
        </AppText>
      </Pressable>

      <Pressable
        onPress={() => onSelectMode?.("register")}
        style={({ pressed }) => [
          styles.segmentItem,
          mode === "register" && styles.segmentItemActive,
          pressed && styles.pressedSubtle,
        ]}
      >
        <AppText
          variant="label"
          style={[styles.segmentText, mode === "register" && styles.segmentTextActive]}
        >
          Đăng ký mới
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  segmentedBar: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.base,
  },
  segmentItem: {
    flex: 1,
    minHeight: touchTarget.minHeight - 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  segmentItemActive: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pressedSubtle: {
    opacity: 0.8,
  },
  segmentText: {
    color: colors.inkSubtle,
  },
  segmentTextActive: {
    color: colors.inkPrimary,
    fontWeight: "700",
  },
});
