import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import {
  Bug,
  ChevronRight,
  Heart,
  HelpCircle,
  Shield,
  Sliders,
  Tag,
  UserCircle2,
  Wallet,
} from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { colors, radius, spacing, touchTarget } from "../../../theme/tokens";
import { useAuth } from "../../../hooks/useAuth";
import ProfileScreen from "./ProfileScreen";

function MenuRow({ icon: IconComp, label, subtitle, onPress, isLast = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        !isLast && styles.menuRowBorder,
        pressed && styles.menuRowPressed,
      ]}
      accessibilityRole="button"
    >
      <View style={styles.menuIconWrap}>
        <IconComp size={19} color={colors.brandPrimary} />
      </View>
      <View style={styles.menuTextCol}>
        <AppText style={styles.menuLabel}>{label}</AppText>
        {subtitle ? <AppText style={styles.menuSub}>{subtitle}</AppText> : null}
      </View>
      <ChevronRight size={18} color={colors.inkSubtle} />
    </Pressable>
  );
}

/**
 * Tab "Cá nhân":
 * - Nếu người dùng đã đăng nhập (role === 'tourist'): hiển thị ProfileScreen đầy đủ
 * - Nếu chưa đăng nhập (Guest): khuyến khích Đăng nhập / Đăng ký + các mục tiện ích, cài đặt, trợ giúp
 */
export default function AccountTabScreen({ navigation }) {
  const isFocused = useIsFocused();
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated && role === "tourist") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {isFocused ? <StatusBar style="dark" /> : null}
        <ProfileScreen />
      </SafeAreaView>
    );
  }

  const promptLoginForFeature = (title) => {
    Alert.alert(
      title,
      "Đăng nhập để đồng bộ dữ liệu cá nhân và sử dụng trọn vẹn tính năng này trên mọi thiết bị.",
      [
        { text: "Để sau", style: "cancel" },
        {
          text: "Đăng nhập",
          onPress: () => navigation.navigate("Auth", { initialMode: "login" }),
        },
      ],
    );
  };

  const openInfoNotice = (title, message) => {
    Alert.alert(title, message, [{ text: "Đã hiểu" }]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {isFocused ? <StatusBar style="dark" /> : null}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner khuyến khích Đăng nhập hoặc Đăng ký */}
        <View style={styles.authInviteCard}>
          <View style={styles.inviteHeader}>
            <View style={styles.guestAvatar}>
              <UserCircle2 size={32} color={colors.brandPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.inviteTitle}>
                Chào mừng bạn đến với Social Travel Booking
              </AppText>
              <AppText style={styles.inviteDesc}>
                Đăng nhập hoặc đăng ký để đặt chỗ nhanh, tích lũy ưu đãi và lưu địa điểm yêu thích.
              </AppText>
            </View>
          </View>

          <View style={styles.authButtonsRow}>
            <Pressable
              style={styles.loginBtn}
              onPress={() => navigation.navigate("Auth", { initialMode: "login" })}
            >
              <AppText style={styles.loginBtnText}>Đăng nhập</AppText>
            </Pressable>
            <Pressable
              style={styles.registerBtn}
              onPress={() => navigation.navigate("Auth", { initialMode: "register" })}
            >
              <AppText style={styles.registerBtnText}>Đăng ký</AppText>
            </Pressable>
          </View>
        </View>

        {/* Nhóm 1: Tiện ích & Ưu đãi */}
        <AppText style={styles.groupHeading}>Tiện ích & Ưu đãi</AppText>
        <View style={styles.menuCard}>
          <MenuRow
            icon={Wallet}
            label="Quản lý Ví"
            subtitle="Theo dõi số dư hoàn tiền và giao dịch cọc Escrow"
            onPress={() => promptLoginForFeature("Quản lý Ví")}
          />
          <MenuRow
            icon={Heart}
            label="Danh sách đã lưu"
            subtitle="Các chỗ ở, tour và điểm đến bạn yêu thích"
            onPress={() => promptLoginForFeature("Danh sách đã lưu")}
          />
          <MenuRow
            icon={Tag}
            label="Ưu đãi"
            subtitle="Mã giảm giá thành viên và khuyến mãi theo mùa"
            onPress={() =>
              openInfoNotice(
                "Ưu đãi thành viên",
                "Đăng nhập tài khoản để nhận mã giảm giá độc quyền cho chuyến đi đầu tiên.",
              )
            }
            isLast
          />
        </View>

        {/* Nhóm 2: Cài đặt */}
        <AppText style={styles.groupHeading}>Cài đặt</AppText>
        <View style={styles.menuCard}>
          <MenuRow
            icon={Sliders}
            label="Cài đặt thiết bị"
            subtitle="Ngôn ngữ (Tiếng Việt), tiền tệ (VNĐ) và thông báo"
            onPress={() =>
              openInfoNotice(
                "Cài đặt thiết bị",
                "Ứng dụng hiện đang sử dụng ngôn ngữ Tiếng Việt và đơn vị tiền tệ VNĐ.",
              )
            }
            isLast
          />
        </View>

        {/* Nhóm 3: Trợ giúp */}
        <AppText style={styles.groupHeading}>Trợ giúp</AppText>
        <View style={styles.menuCard}>
          <MenuRow
            icon={HelpCircle}
            label="Liên hệ trợ giúp"
            subtitle="Tổng đài hỗ trợ du khách 24/7 qua email & hotline"
            onPress={() =>
              openInfoNotice(
                "Liên hệ trợ giúp",
                "Đội ngũ CSKH luôn sẵn sàng hỗ trợ qua email support@socialtravelbooking.vn.",
              )
            }
          />
          <MenuRow
            icon={Shield}
            label="Trung tâm thông tin về bảo mật"
            subtitle="Chính sách bảo vệ dữ liệu và ký quỹ Escrow an toàn"
            onPress={() =>
              openInfoNotice(
                "Trung tâm thông tin về bảo mật",
                "Mọi giao dịch thanh toán và thông tin cá nhân của bạn đều được mã hóa chuẩn bảo mật.",
              )
            }
          />
          <MenuRow
            icon={Bug}
            label="Báo cáo lỗi ứng dụng"
            subtitle="Gửi phản hồi kỹ thuật giúp chúng tôi cải thiện ứng dụng"
            onPress={() =>
              openInfoNotice(
                "Báo cáo lỗi ứng dụng",
                "Cảm ơn bạn! Vui lòng gửi mô tả sự cố về địa chỉ support@socialtravelbooking.vn.",
              )
            }
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceBase,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  authInviteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: spacing.md + 2,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inviteHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm + 4,
  },
  guestAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.inkPrimary,
    lineHeight: 22,
  },
  inviteDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkBody,
    marginTop: 4,
  },
  authButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  loginBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  registerBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.lg,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    alignItems: "center",
    justifyContent: "center",
  },
  registerBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  groupHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.inkSubtle,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: spacing.sm + 2,
    marginBottom: spacing.xs + 2,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: touchTarget.minHeight + 10,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuRowPressed: {
    backgroundColor: "#F8FAFC",
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextCol: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14.5,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  menuSub: {
    fontSize: 12,
    color: colors.inkSubtle,
    marginTop: 2,
  },
});
