import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "../../../components/common/AppText";
import { colors, fonts, spacing, radius, touchTarget } from "../../../theme/tokens";
import { useAuth } from "../../../hooks/useAuth";

// Import các sub-components theo kiến trúc Component-Based Architecture
import AuthHeroHeader from "../components/AuthHeroHeader";
import AuthModeSwitch from "../components/AuthModeSwitch";
import AuthErrorBanner from "../components/AuthErrorBanner";
import AuthRoleSelector from "../components/AuthRoleSelector";
import AuthDemoAccounts from "../components/AuthDemoAccounts";

const MOBILE_DEMO_ACCOUNTS = [
  {
    id: "tourist",
    title: "Khách du lịch (Tourist)",
    email: "tranhoangviet@gmail.com",
    password: "Tranhoangviet@2005",
  },
  {
    id: "provider",
    title: "Nhà cung cấp (Provider)",
    email: "tranhoangviet.provider@gmail.com",
    password: "Tranhoangviet@2005",
  },
];

export default function AuthScreen() {
  const { login, register, isSubmitting } = useAuth();

  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("tourist");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorBanner, setErrorBanner] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFeedback = () => {
    if (errorBanner) setErrorBanner("");
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
  };

  const handleSelectMode = (nextMode) => {
    setMode(nextMode);
    clearFeedback();
  };

  const handleQuickFill = (demo) => {
    setMode("login");
    setEmail(demo.email);
    setPassword(demo.password);
    clearFeedback();
  };

  const validateForm = () => {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = "Nhập địa chỉ email của bạn.";
    } else if (!emailPattern.test(email.trim())) {
      errors.email = "Địa chỉ email chưa đúng định dạng.";
    }

    if (mode === "login") {
      if (!password) {
        errors.password = "Nhập mật khẩu để đăng nhập.";
      }
    } else {
      if (!name.trim() || name.trim().length < 2) {
        errors.name = "Nhập họ và tên (tối thiểu 2 ký tự).";
      }
      if (role === "provider" && (!businessName.trim() || businessName.trim().length < 2)) {
        errors.business_name = "Nhập tên thương hiệu hoặc đơn vị cung cấp dịch vụ.";
      }
      if (!password || password.length < 8) {
        errors.password = "Mật khẩu cần tối thiểu 8 ký tự.";
      }
      if (password !== passwordConfirm) {
        errors.password_confirmation = "Mật khẩu nhập lại chưa khớp.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    clearFeedback();
    if (!validateForm()) return;

    if (mode === "login") {
      const result = await login(email, password);
      if (!result.success) {
        setErrorBanner(result.message);
        if (result.errors) setFieldErrors(result.errors);
      }
    } else {
      const result = await register({
        name,
        email,
        phone,
        role,
        business_name: role === "provider" ? businessName : undefined,
        password,
        password_confirmation: passwordConfirm,
      });

      if (!result.success) {
        setErrorBanner(result.message);
        if (result.errors) setFieldErrors(result.errors);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Component tiêu đề thương hiệu Coastal Night */}
          <AuthHeroHeader mode={mode} />

          {/* Component thanh chuyển đổi Đăng nhập / Đăng ký 48pt */}
          <AuthModeSwitch mode={mode} onSelectMode={handleSelectMode} />

          {/* Component thông báo lỗi thân thiện */}
          <AuthErrorBanner message={errorBanner} />

          {/* Khối nhập liệu chính */}
          <View style={styles.formContainer}>
            {/* Component chọn vai trò khi đăng ký */}
            {mode === "register" && (
              <AuthRoleSelector role={role} onSelectRole={(r) => setRole(r)} />
            )}

            {/* Trường Họ và tên khi đăng ký */}
            {mode === "register" && (
              <View style={styles.fieldGroup}>
                <AppText variant="label" style={styles.fieldLabel}>
                  Họ và tên
                </AppText>
                <TextInput
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    clearFeedback();
                  }}
                  placeholder="Ví dụ: Trần Hoàng Việt"
                  placeholderTextColor={colors.inkSubtle}
                  style={styles.textInput}
                />
                {Boolean(fieldErrors.name) && (
                  <AppText variant="caption" style={styles.fieldErrorText}>
                    {fieldErrors.name}
                  </AppText>
                )}
              </View>
            )}

            {/* Thông tin nhà cung cấp */}
            {mode === "register" && role === "provider" && (
              <View style={styles.providerBox}>
                <View style={styles.fieldGroup}>
                  <AppText variant="label" style={styles.fieldLabel}>
                    Tên doanh nghiệp / Đơn vị du lịch
                  </AppText>
                  <TextInput
                    value={businessName}
                    onChangeText={(val) => {
                      setBusinessName(val);
                      clearFeedback();
                    }}
                    placeholder="Ví dụ: Đà Nẵng Retreat & Travel"
                    placeholderTextColor={colors.inkSubtle}
                    style={styles.textInput}
                  />
                  {Boolean(fieldErrors.business_name) && (
                    <AppText variant="caption" style={styles.fieldErrorText}>
                      {fieldErrors.business_name}
                    </AppText>
                  )}
                </View>
              </View>
            )}

            {/* Trường Email */}
            <View style={styles.fieldGroup}>
              <AppText variant="label" style={styles.fieldLabel}>
                Địa chỉ email
              </AppText>
              <TextInput
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  clearFeedback();
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="ten@congty.vn"
                placeholderTextColor={colors.inkSubtle}
                style={styles.textInput}
              />
              {Boolean(fieldErrors.email) && (
                <AppText variant="caption" style={styles.fieldErrorText}>
                  {fieldErrors.email}
                </AppText>
              )}
            </View>

            {/* Trường Số điện thoại khi đăng ký */}
            {mode === "register" && (
              <View style={styles.fieldGroup}>
                <AppText variant="label" style={styles.fieldLabel}>
                  Số điện thoại liên hệ
                </AppText>
                <TextInput
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    clearFeedback();
                  }}
                  keyboardType="phone-pad"
                  placeholder="0912 345 678"
                  placeholderTextColor={colors.inkSubtle}
                  style={styles.textInput}
                />
              </View>
            )}

            {/* Trường Mật khẩu */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelBetween}>
                <AppText variant="label" style={styles.fieldLabel}>
                  Mật khẩu
                </AppText>
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <AppText variant="caption" style={styles.togglePassText}>
                    {showPassword ? "Ẩn" : "Hiện"}
                  </AppText>
                </Pressable>
              </View>
              <TextInput
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  clearFeedback();
                }}
                secureTextEntry={!showPassword}
                placeholder="Tối thiểu 8 ký tự"
                placeholderTextColor={colors.inkSubtle}
                style={styles.textInput}
              />
              {Boolean(fieldErrors.password) && (
                <AppText variant="caption" style={styles.fieldErrorText}>
                  {fieldErrors.password}
                </AppText>
              )}
            </View>

            {/* Xác nhận mật khẩu khi đăng ký */}
            {mode === "register" && (
              <View style={styles.fieldGroup}>
                <AppText variant="label" style={styles.fieldLabel}>
                  Xác nhận mật khẩu
                </AppText>
                <TextInput
                  value={passwordConfirm}
                  onChangeText={(val) => {
                    setPasswordConfirm(val);
                    clearFeedback();
                  }}
                  secureTextEntry={!showPassword}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor={colors.inkSubtle}
                  style={styles.textInput}
                />
                {Boolean(fieldErrors.password_confirmation) && (
                  <AppText variant="caption" style={styles.fieldErrorText}>
                    {fieldErrors.password_confirmation}
                  </AppText>
                )}
              </View>
            )}

            {/* Nút bấm Submit chính (Tactile Pressable >= 48pt) */}
            <Pressable
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                isSubmitting && styles.buttonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <AppText variant="body" style={styles.primaryButtonText}>
                  {mode === "login"
                    ? "Đăng nhập vào ứng dụng"
                    : role === "provider"
                      ? "Tạo tài khoản Nhà cung cấp"
                      : "Tạo tài khoản Khách du lịch"}
                </AppText>
              )}
            </Pressable>
          </View>

          {/* Component điền nhanh tài khoản kiểm thử 1 chạm */}
          <AuthDemoAccounts accounts={MOBILE_DEMO_ACCOUNTS} onSelectAccount={handleQuickFill} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceBase,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.xxl,
  },
  formContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: spacing.base,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.inkPrimary,
  },
  labelBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  togglePassText: {
    color: colors.brandPrimary,
    fontWeight: "600",
  },
  textInput: {
    minHeight: touchTarget.minHeight,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceElevated,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.inkPrimary,
  },
  fieldErrorText: {
    color: colors.statusDanger,
  },
  providerBox: {
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.md,
  },
  primaryButton: {
    minHeight: touchTarget.minHeight + 2,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  primaryButtonPressed: {
    backgroundColor: colors.brandHover,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: colors.inkInverse,
    fontWeight: "700",
  },
});
