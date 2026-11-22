import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import { CalendarCheck2, Compass, QrCode, ShieldCheck } from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { colors, radius, spacing } from "../../../theme/tokens";
import { useAuth } from "../../../hooks/useAuth";

/**
 * Tab "Đặt chỗ" — Lịch sử đặt chỗ & vé QR Check-in của Du khách.
 */
export default function BookingsTabScreen({ navigation }) {
  const isFocused = useIsFocused();
  const { isAuthenticated, user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {isFocused ? <StatusBar style="dark" /> : null}
      <View style={styles.header}>
        <AppText style={styles.headerTitle}>Đặt chỗ</AppText>
        <AppText style={styles.headerSub}>Quản lý lịch trình, cọc Escrow và vé QR check-in</AppText>
      </View>

      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!isAuthenticated ? (
          <View style={styles.guestCard}>
            <View style={styles.iconCircle}>
              <CalendarCheck2 size={28} color={colors.brandPrimary} />
            </View>
            <AppText style={styles.cardTitle}>Theo dõi mọi chuyến đi tại một nơi</AppText>
            <AppText style={styles.cardDesc}>
              Đăng nhập để xem lịch sử đặt phòng, tour đã giữ chỗ, mã QR check-in và trạng thái bảo
              vệ tiền cọc Escrow 30%.
            </AppText>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => navigation.navigate("Auth", { initialMode: "login" })}
            >
              <AppText style={styles.primaryBtnText}>Đăng nhập ngay</AppText>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("Auth", { initialMode: "register" })}
            >
              <AppText style={styles.secondaryBtnText}>Tạo tài khoản mới</AppText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.loggedInWrap}>
            <View style={styles.emptyBookingsCard}>
              <View style={styles.iconCircle}>
                <QrCode size={26} color={colors.brandPrimary} />
              </View>
              <AppText style={styles.cardTitle}>Xin chào, {user?.name || "Du khách"}!</AppText>
              <AppText style={styles.cardDesc}>
                Bạn chưa có đơn đặt chỗ nào sắp tới. Hãy khám phá hàng loạt chỗ ở và tour du lịch
                đặc sắc trên toàn quốc.
              </AppText>
              <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate("SearchTab")}>
                <Compass size={17} color="#FFFFFF" />
                <AppText style={styles.primaryBtnText}>Khám phá dịch vụ ngay</AppText>
              </Pressable>
            </View>

            <View style={styles.infoNote}>
              <ShieldCheck size={18} color={colors.brandPrimary} />
              <AppText style={styles.infoNoteText}>
                Mọi đơn đặt chỗ đều được cấp mã QR check-in riêng và bảo vệ cọc Escrow tự động.
              </AppText>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bodyScroll: {
    flex: 1,
    backgroundColor: colors.surfaceBase,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.inkPrimary,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12.5,
    color: colors.inkBody,
    marginTop: 2,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  guestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: spacing.lg,
    alignItems: "center",
    gap: 12,
    marginTop: spacing.md,
  },
  loggedInWrap: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  emptyBookingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: spacing.lg,
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.inkPrimary,
    textAlign: "center",
  },
  cardDesc: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.inkBody,
    textAlign: "center",
  },
  primaryBtn: {
    width: "100%",
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.brandPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  primaryBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryBtn: {
    width: "100%",
    minHeight: 46,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F0F9FF",
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: "#0369A1",
  },
});
