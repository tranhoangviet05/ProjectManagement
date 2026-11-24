import React from "react";
import { StyleSheet, View } from "react-native";
import AppText from "../../../components/common/AppText";
import { getBookingStatusMeta } from "../models/bookingModel";

export default function BookingStatusBadge({ status }) {
  const meta = getBookingStatusMeta(status);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: meta.bg,
          borderColor: meta.border,
        },
      ]}
    >
      <AppText style={[styles.text, { color: meta.text }]} numberOfLines={1}>
        {meta.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11.5,
    fontWeight: "700",
  },
});
