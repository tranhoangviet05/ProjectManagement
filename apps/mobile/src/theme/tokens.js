/**
 * Hệ thống Semantic Design Tokens đồng bộ 100% giữa Web (@stb/web) và Mobile (@stb/mobile)
 * Tuân thủ quy chuẩn docs/design-system.md & .agent/skills/ui-design/SKILL.md
 */
export const fonts = {
  regular: "Quicksand_400Regular",
  medium: "Quicksand_500Medium",
  semiBold: "Quicksand_600SemiBold",
  bold: "Quicksand_700Bold",
};

export const colors = {
  surfaceBase: "#F8FAFC",
  surfaceElevated: "#FFFFFF",
  surfaceMuted: "#F1F5F9",
  surfaceObsidian: "#0B1320",
  surfaceObsidianSoft: "#131F33",

  // Bộ màu chủ đạo: Xanh trời (Sky Blue) - Đại dương, bầu trời tự do và an tâm
  brandPrimary: "#0284C7", // Sky Blue 600
  brandHover: "#0369A1", // Deep Sky Blue 700
  brandDark: "#075985", // Midnight Ocean 800
  brandLight: "#E0F2FE", // Soft Sky Mist 100
  brandSubtle: "#F0F9FF", // Clear Sky 50

  // Bộ màu phụ 1: Hoàng hôn & Nắng biển (Sunset Coral / Sand Gold) - Tương phản ấm áp cho ưu đãi, CTA chốt deal, rating sao
  secondaryWarm: "#F97316", // Sunset Coral 500
  secondaryWarmHover: "#EA580C", // Sunset Coral 600
  secondaryWarmLight: "#FFEDD5", // Warm Sand 100
  secondaryWarmSubtle: "#FFF7ED", // Warm Sand 50

  // Bộ màu phụ 2: Trải nghiệm sinh thái & Biển đảo (Lagoon Teal)
  secondaryLagoon: "#0D9488", // Teal 600
  secondaryLagoonLight: "#CCFBF1", // Mint Teal 100

  inkPrimary: "#0F172A",
  inkBody: "#334155",
  inkSubtle: "#64748B",
  inkInverse: "#F8FAFC",

  borderSubtle: "#E2E8F0",
  borderStrong: "#CBD5E1",

  statusSuccess: "#059669",
  statusSuccessBg: "#ECFDF5",
  statusWarning: "#D97706",
  statusWarningBg: "#FFFBEB",
  statusDanger: "#E11D48",
  statusDangerBg: "#FFF1F2",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const touchTarget = {
  minHeight: 48,
  minWidth: 48,
};

export const typographyScale = {
  display: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: colors.inkPrimary,
  },
  h1: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: colors.inkPrimary,
  },
  h2: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  h3: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    color: colors.inkBody,
  },
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    color: colors.inkBody,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: colors.inkSubtle,
  },
};
