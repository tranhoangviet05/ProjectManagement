import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { colors } from "../../theme/tokens";

/**
 * Thành phần Loading Skeleton dùng chung trên Mobile App (@stb/mobile).
 * Hiệu ứng pulse mượt mà bằng Animated native driver.
 */
export default function Skeleton({ width = "100%", height = 16, borderRadius = 10, style }) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceMuted,
  },
});
