import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Typography from "../../../components/ui/Typography";
import { useAuth } from "../../../hooks/useAuth";

// Import các sub-components chuyên biệt theo kiến trúc Component-Based Architecture
import AuthHeroShowcase from "../components/AuthHeroShowcase";
import AuthModeSwitch from "../components/AuthModeSwitch";
import AuthFeedbackAlert from "../components/AuthFeedbackAlert";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import GoogleSignInButton from "../components/GoogleSignInButton";

const COASTAL_DESTINATIONS = [
  {
    id: "son-tra",
    name: "Bán đảo Sơn Trà, Đà Nẵng",
    coordinates: "16.1060° N, 108.2615° E",
    image:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=85",
    caption:
      "Kết nối trực tiếp 140+ đơn vị lữ hành bản địa, lưu trú ven biển và lịch trình xác thực.",
    stats: {
      activeTours: "84 hành trình đang mở",
      qrCheckin: "Đối soát vé QR tức thời",
    },
  },
  {
    id: "ha-long",
    name: "Vịnh Lan Hạ & Hạ Long, Quảng Ninh",
    coordinates: "20.7256° N, 107.0485° E",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=85",
    caption:
      "Quản lý tồn phòng du thuyền, lịch khởi hành theo ngày và tự động thanh toán qua SePay.",
    stats: {
      activeTours: "62 du thuyền & homestay",
      qrCheckin: "Tự động phân bổ hoa hồng Affiliate",
    },
  },
  {
    id: "phu-quoc",
    name: "Nam Đảo Phú Quốc, Kiên Giang",
    coordinates: "10.0364° N, 104.0087° E",
    image:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1400&q=85",
    caption: "Nền tảng hợp nhất đặt dịch vụ du lịch và mạng xã hội chia sẻ kinh nghiệm thực tế.",
    stats: {
      activeTours: "95 khu nghỉ dưỡng & cano",
      qrCheckin: "Bảo vệ giao dịch qua Ví nội bộ",
    },
  },
];

const DEMO_ACCOUNTS = [
  {
    label: "Quản trị viên (Admin)",
    email: "admin@gmail.com",
    password: "Admin@123",
    roleBadge: "Toàn quyền sàn",
  },
  {
    label: "Nhà cung cấp (Provider)",
    email: "tranhoangviet.provider@gmail.com",
    password: "Tranhoangviet@2005",
    roleBadge: "Quản lý Tour & Phòng",
  },
  {
    label: "Khách du lịch (Tourist)",
    email: "tranhoangviet@gmail.com",
    password: "Tranhoangviet@2005",
    roleBadge: "Đặt chỗ & MXH",
  },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, isSubmitting } = useAuth();

  // Chế độ biểu mẫu: 'login' | 'register'
  const [mode, setMode] = useState("login");
  const [activeDestIndex, setActiveDestIndex] = useState(0);

  // State dữ liệu form
  const [role, setRole] = useState("provider");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Tour biển đảo & Nghỉ dưỡng");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  // Phản hồi lỗi & trạng thái ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const resetFeedback = () => {
    if (errorMessage) setErrorMessage("");
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
  };

  const switchMode = (targetMode) => {
    setMode(targetMode);
    resetFeedback();
  };

  const handleQuickFillDemo = (demo) => {
    setMode("login");
    setEmail(demo.email);
    setPassword(demo.password);
    resetFeedback();
  };

  const validateClientSide = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = "Nhập địa chỉ email của bạn để tiếp tục.";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Địa chỉ email chưa đúng định dạng (ví dụ: ten@congty.vn).";
    }

    if (mode === "login") {
      if (!password) {
        errors.password = "Nhập mật khẩu tài khoản của bạn.";
      }
    } else {
      if (!name.trim() || name.trim().length < 2) {
        errors.name = "Nhập họ và tên người đại diện (tối thiểu 2 ký tự).";
      }
      if (role === "provider" && (!businessName.trim() || businessName.trim().length < 2)) {
        errors.business_name = "Nhập tên thương hiệu hoặc đơn vị kinh doanh du lịch.";
      }
      if (!password || password.length < 8) {
        errors.password = "Mật khẩu cần có ít nhất 8 ký tự để bảo mật tài khoản.";
      }
      if (password !== passwordConfirmation) {
        errors.password_confirmation = "Mật khẩu nhập lại chưa khớp với mật khẩu đã tạo.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetFeedback();

    if (!validateClientSide()) return;

    if (mode === "login") {
      const result = await login(email, password);
      if (result.success) {
        navigate(result.redirectTo, { replace: true });
      } else {
        setErrorMessage(result.message);
        if (result.errors) setFieldErrors(result.errors);
      }
    } else {
      const result = await register({
        name,
        email,
        phone,
        role,
        business_name: role === "provider" ? businessName : undefined,
        business_type: role === "provider" ? businessType : undefined,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (result.success) {
        navigate(result.redirectTo, { replace: true });
      } else {
        setErrorMessage(result.message);
        if (result.errors) setFieldErrors(result.errors);
      }
    }
  };

  const handleGoogleAuth = async () => {
    resetFeedback();
    const result = await loginWithGoogle(role);
    if (result.success) {
      navigate(result.redirectTo, { replace: true });
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface-elevated flex flex-col lg:flex-row">
      {/* CỘT TRÁI (52%): Component không gian điểm đến & Sổ cái vận hành */}
      <AuthHeroShowcase
        destinations={COASTAL_DESTINATIONS}
        activeDestIndex={activeDestIndex}
        setActiveDestIndex={setActiveDestIndex}
        demoAccounts={DEMO_ACCOUNTS}
        onSelectDemo={handleQuickFillDemo}
      />

      {/* CỘT PHẢI (48%): Khung biểu mẫu Đăng nhập / Đăng ký */}
      <main className="flex-1 flex flex-col justify-between px-6 sm:px-12 lg:px-16 py-8 lg:py-10 overflow-y-auto">
        <div className="w-full max-w-[440px] mx-auto">
          {/* Thanh chuyển chế độ Đăng nhập / Đăng ký */}
          <AuthModeSwitch mode={mode} onSwitchMode={switchMode} />

          {/* Tiêu đề biểu mẫu */}
          <div className="mb-6">
            <Typography variant="h1" className="mb-1.5">
              {mode === "login" ? "Đăng nhập vào bảng điều hành" : "Mở tài khoản trên hệ thống"}
            </Typography>
            <Typography variant="body-sm" className="text-ink-subtle">
              {mode === "login"
                ? "Hệ thống tự động nhận diện vai trò Quản trị viên, Nhà cung cấp hoặc Du khách để chuyển tới không gian làm việc tương ứng."
                : "Chọn loại tài khoản phù hợp với mục đích sử dụng của bạn."}
            </Typography>
          </div>

          {/* Thông báo lỗi thân thiện */}
          <AuthFeedbackAlert message={errorMessage} />

          {/* Form theo chế độ */}
          {mode === "login" ? (
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              fieldErrors={fieldErrors}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onResetFeedback={resetFeedback}
            />
          ) : (
            <RegisterForm
              role={role}
              setRole={setRole}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              businessName={businessName}
              setBusinessName={setBusinessName}
              businessType={businessType}
              setBusinessType={setBusinessType}
              password={password}
              setPassword={setPassword}
              passwordConfirmation={passwordConfirmation}
              setPasswordConfirmation={setPasswordConfirmation}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              fieldErrors={fieldErrors}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onResetFeedback={resetFeedback}
            />
          )}

          {/* Đăng nhập nhanh Google OAuth */}
          <GoogleSignInButton isSubmitting={isSubmitting} onGoogleAuth={handleGoogleAuth} />
        </div>

        {/* Chân trang Web Portal */}
        <footer className="w-full max-w-[440px] mx-auto pt-8 border-t border-border-subtle mt-8 text-center">
          <Typography variant="caption" className="text-ink-subtle">
            © 2026 Social Travel Booking. Nền tảng Du lịch & Lưu trú số thế hệ mới.
          </Typography>
        </footer>
      </main>
    </div>
  );
}
