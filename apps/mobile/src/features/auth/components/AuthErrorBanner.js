import React from "react";
import { StyleSheet, View } from "react-native";
import AppText from "../../../components/common/AppText";
import { colors, spacing, radius } from "../../../theme/tokens";

/**
 * Component hiển thị thông báo lỗi thân thiện trên Mobile (không lộ endpoint hay status code)
 */
export default function AuthErrorBanner({ message }) {
  if (!message) return null;

  return (
    <View style={styles.errorAlert}>
      <AppText variant="bodySmall" style={styles.errorAlertText}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  errorAlert: {
    backgroundColor: colors.statusDangerBg,
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  errorAlertText: {
    color: colors.statusDanger,
    fontWeight: "600",
  },
});
