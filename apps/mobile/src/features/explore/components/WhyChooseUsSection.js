import React from "react";
import { StyleSheet, View } from "react-native";
import { BadgeCheck, CalendarCheck, ShieldCheck, Users } from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { colors, spacing } from "../../../theme/tokens";
import { WHY_CHOOSE_US_ITEMS } from "../models/exploreModel";

const PILLAR_ICONS = {
  escrow: ShieldCheck,
  kyc: BadgeCheck,
  community: Users,
  transparent: CalendarCheck,
};

export default function WhyChooseUsSection() {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>Lý do nên chọn chúng tôi</AppText>
      <AppText style={styles.sectionSubtitle}>
        An tâm trên từng chuyến đi cùng hệ sinh thái du lịch minh bạch
      </AppText>

      <View style={styles.list}>
        {WHY_CHOOSE_US_ITEMS.map((item) => {
          const IconComp = PILLAR_ICONS[item.id] || ShieldCheck;
          return (
            <View key={item.id} style={styles.pillarCard}>
              <View style={styles.iconWrap}>
                <IconComp size={20} color={colors.brandPrimary} />
              </View>
              <View style={styles.textCol}>
                <AppText style={styles.pillarTitle}>{item.title}</AppText>
                <AppText style={styles.pillarDesc}>{item.desc}</AppText>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg + 4,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.inkPrimary,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: colors.inkBody,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm + 2,
  },
  pillarCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm + 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: spacing.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
    gap: 4,
  },
  pillarTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  pillarDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkBody,
  },
});
