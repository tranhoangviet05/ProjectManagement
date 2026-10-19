import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import AppText from "../../../components/common/AppText";
import { colors, spacing, radius } from "../../../theme/tokens";

/**
 * Component khối tài khoản kiểm thử 1 chạm cho môi trường phát triển (Mobile)
 */
export default function AuthDemoAccounts({ accounts = [], onSelectAccount }) {
  return (
    <View style={styles.demoSection}>
      <AppText variant="label" style={styles.demoHeading}>
        Điền nhanh tài khoản thử nghiệm (1 chạm)
      </AppText>
      <View style={styles.demoGrid}>
        {accounts.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onSelectAccount?.(item)}
            style={({ pressed }) => [styles.demoCard, pressed && styles.demoCardPressed]}
          >
            <AppText variant="label" style={styles.demoTitle}>
              {item.title}
            </AppText>
            <AppText variant="caption" numberOfLines={1} style={styles.demoEmail}>
              {item.email}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  demoSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  demoHeading: {
    color: colors.inkSubtle,
    marginBottom: spacing.sm,
  },
  demoGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  demoCard: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
  },
  demoCardPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  demoTitle: {
    color: colors.inkPrimary,
    marginBottom: 2,
  },
  demoEmail: {
    color: colors.inkSubtle,
  },
});
