import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Animated, Easing, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import AppText from "../../../components/common/AppText";
import { colors, spacing } from "../../../theme/tokens";

/**
 * Màn hình Splash khởi động Mobile gắn với dữ liệu thực:
 * - Nền trắng sạch, hiển thị Logo "Social Travel Booking" xuất hiện nhẹ nhàng từ dưới lên
 * - Hiệu ứng loading hiển thị ngay dưới logo cho đến khi toàn bộ dữ liệu khởi tạo (auth, địa điểm, dịch vụ, bài đăng) tải hoàn tất
 * - Khi dữ liệu sẵn sàng (`isReady === true`) và hiệu ứng logo đã hoàn tất, màn hình mờ dần rồi chuyển thẳng vào Trang chủ
 */
export default function SplashScreen({ isReady = false, onFinish }) {
  const [minIntroDone, setMinIntroDone] = useState(false);
  const hasFinishedRef = useRef(false);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(28)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const loadingTimer = setTimeout(() => {
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 350);

    const introTimer = setTimeout(() => {
      setMinIntroDone(true);
    }, 850);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(introTimer);
    };
  }, [logoOpacity, logoTranslateY, loadingOpacity]);

  useEffect(() => {
    if (!isReady || !minIntroDone || hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 380,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) {
        onFinish();
      }
    });
  }, [isReady, minIntroDone, screenOpacity, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar style="dark" />

      <View style={styles.centerBox}>
        <Animated.View
          style={[
            styles.brandGroup,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        >
          <AppText isLogo style={styles.logoText}>
            Social Travel Booking
          </AppText>

          <View style={styles.loadingSlot}>
            <Animated.View style={{ opacity: loadingOpacity }}>
              <ActivityIndicator size="large" color={colors.brandPrimary} />
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  centerBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  brandGroup: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 35,
    lineHeight: 48,
    paddingTop: 8,
    color: colors.brandPrimary,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  loadingSlot: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },
});
