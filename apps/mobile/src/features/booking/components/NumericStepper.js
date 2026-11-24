import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { colors } from "../../../theme/tokens";

export default function NumericStepper({
  label,
  subtitle,
  value = 1,
  min = 1,
  max = 50,
  onChange,
}) {
  const safeValue = Math.max(min, Number(value ?? min));
  const canDecrease = safeValue > min;
  const canIncrease = max == null || safeValue < max;

  const handleDecrease = () => {
    if (!canDecrease) return;
    onChange?.(safeValue - 1);
  };

  const handleIncrease = () => {
    if (!canIncrease) return;
    onChange?.(safeValue + 1);
  };

  return (
    <View style={styles.row}>
      <View style={styles.labelCol}>
        <AppText style={styles.label}>{label}</AppText>
        {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
      </View>

      <View style={styles.controls}>
        <Pressable
          style={[styles.btn, !canDecrease && styles.btnDisabled]}
          onPress={handleDecrease}
          disabled={!canDecrease}
          accessibilityLabel={`Giảm ${label}`}
        >
          <Minus size={16} color={canDecrease ? colors.brandPrimary : "#CBD5E1"} />
        </Pressable>

        <AppText style={styles.valueText}>{safeValue}</AppText>

        <Pressable
          style={[styles.btn, !canIncrease && styles.btnDisabled]}
          onPress={handleIncrease}
          disabled={!canIncrease}
          accessibilityLabel={`Tăng ${label}`}
        >
          <Plus size={16} color={canIncrease ? colors.brandPrimary : "#CBD5E1"} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 6,
  },
  labelCol: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.25,
    borderColor: colors.brandPrimary,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  valueText: {
    minWidth: 26,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
});
