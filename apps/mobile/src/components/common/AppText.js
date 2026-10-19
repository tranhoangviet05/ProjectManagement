import React from "react";
import { Text, StyleSheet } from "react-native";
import { typographyScale, fonts } from "../../theme/tokens";

/**
 * Component khóa chặt quy chuẩn kiểu chữ trên Mobile (Typography Lock-in với Quicksand)
 */
export default function AppText({ variant = "body", weight, style, children, ...props }) {
  const baseStyle = typographyScale[variant] || typographyScale.body;

  // Tự động phân giải biến thể Quicksand phù hợp theo weight hoặc variant
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const activeWeight = weight || flattenedStyle.fontWeight;

  let resolvedFontFamily = baseStyle.fontFamily;
  if (activeWeight === "700" || activeWeight === "bold") {
    resolvedFontFamily = fonts.bold;
  } else if (activeWeight === "600" || activeWeight === "semibold") {
    resolvedFontFamily = fonts.semiBold;
  } else if (activeWeight === "500" || activeWeight === "medium") {
    resolvedFontFamily = fonts.medium;
  } else if (activeWeight === "400" || activeWeight === "normal") {
    resolvedFontFamily = fonts.regular;
  }

  return (
    <Text style={[baseStyle, style, { fontFamily: resolvedFontFamily }]} {...props}>
      {children}
    </Text>
  );
}
