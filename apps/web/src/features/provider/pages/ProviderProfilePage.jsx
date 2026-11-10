import React, { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import ProviderLayout from "../layouts/ProviderLayout";
import Typography from "../../../components/ui/Typography";
import { useAuth } from "../../../hooks/useAuth";
import providerProfileService from "../services/providerProfileService";

// Sub-components tuân thủ kiến trúc Component-Based Architecture
import ProviderProfileMetrics from "../components/ProviderProfileMetrics";
import ProviderAvatarUploader from "../components/ProviderAvatarUploader";
import ProviderInfoForm from "../components/ProviderInfoForm";
import ProviderWalletActivation from "../components/ProviderWalletActivation";
import ProviderSecurityForm from "../components/ProviderSecurityForm";

/**
 * Screen Orchestrator: Trang Quản lý Hồ sơ & Ví Travel của Đối tác (Provider)
 */
export default function ProviderProfilePage() {
  const { user, updateUser } = useAuth();

  // Tab điều hướng: 'profile' | 'wallet' | 'security'
  const [activeTab, setActiveTab] = useState("profile");

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isActivatingWallet, setIsActivatingWallet] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Feedback states
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [avatarFeedback, setAvatarFeedback] = useState(null);
  const [walletFeedback, setWalletFeedback] = useState(null);
  const [securityFeedback, setSecurityFeedback] = useState(null);

  // 1. Cập nhật thông tin hồ sơ
  const handleSaveProfile = async (formData) => {
    setIsUpdatingProfile(true);
    setProfileFeedback(null);
    try {
      const response = await providerProfileService.updateProfile(formData);
      if (response?.data) updateUser(response.data);
      setProfileFeedback({ type: "success", message: "Cập nhật hồ sơ đối tác thành công!" });
    } catch (err) {
      setProfileFeedback({ type: "error", message: err.message || "Cập nhật hồ sơ thất bại." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // 2. Tải ảnh đại diện mới
  const handleUploadAvatar = async (file) => {
    setIsUploadingAvatar(true);
    setAvatarFeedback(null);
    try {
      const res = await providerProfileService.uploadAvatar(file);
      if (res?.user) updateUser(res.user);
      else if (res?.data?.avatar_url) {
        updateUser({ ...user, avatar_url: res.data.avatar_url, avatar: res.data.avatar_url });
      }
      setAvatarFeedback({ type: "success", message: "Cập nhật ảnh đại diện thành công!" });
    } catch (err) {
      setAvatarFeedback({ type: "error", message: err.message || "Tải ảnh thất bại." });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 3. Kích hoạt Ví Travel Đối tác
  const handleActivateWallet = async (walletData) => {
    setIsActivatingWallet(true);
    setWalletFeedback(null);
    try {
      const res = await providerProfileService.activateWallet(walletData);
      if (res?.user) updateUser(res.user);
      setWalletFeedback({ type: "success", message: res?.message || "Kích hoạt ví thành công!" });
    } catch (err) {
      setWalletFeedback({ type: "error", message: err.message || "Kích hoạt ví thất bại." });
    } finally {
      setIsActivatingWallet(false);
    }
  };

  // 4. Đổi mật khẩu
  const handleChangePassword = async (payload) => {
    setIsChangingPassword(true);
    setSecurityFeedback(null);
    try {
      const res = await providerProfileService.changePassword(payload);
      setSecurityFeedback({ type: "success", message: res?.message || "Đổi mật khẩu thành công!" });
    } catch (err) {
      setSecurityFeedback({ type: "error", message: err.message || "Đổi mật khẩu thất bại." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const kycStatus = user?.provider_profile?.status || "approved";

  return (
    <ProviderLayout activeTab="profile">
      {/* 1. Header Trang */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h1">Hồ sơ cơ sở kinh doanh</Typography>
          <Typography variant="body-sm" className="text-ink-subtle mt-1">
            Quản lý thông tin thương hiệu, người đại diện pháp luật, kích hoạt ví và bảo mật tài
            khoản.
          </Typography>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {kycStatus === "approved" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-status-success">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đối tác chính thức</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
              <Clock className="w-4 h-4" />
              <span>Đang xét duyệt hồ sơ</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards (Số dư ví, Mã đối tác, Email) */}
      <ProviderProfileMetrics user={user} onNavigateWalletTab={() => setActiveTab("wallet")} />

      {/* 3. Main Body: Cột trái (Avatar) & Cột phải (Tabs nội dung) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <ProviderAvatarUploader
            user={user}
            isUploading={isUploadingAvatar}
            onUploadFile={handleUploadAvatar}
            feedback={avatarFeedback}
          />
          <div className="bg-slate-50 border border-border-subtle rounded-xl p-5">
            <Typography
              variant="label"
              className="text-xs font-semibold text-ink-primary block mb-2"
            >
              Lưu ý quy chế thông tin đối tác
            </Typography>
            <ul className="text-xs text-ink-body space-y-2 list-disc list-inside leading-relaxed">
              <li>
                Tên thương mại và hotline là thông tin hiển thị trực tiếp cho khách khi đặt
                tour/phòng.
              </li>
              <li>
                Ví Travel là điều kiện tiên quyết để nhận doanh thu và đối soát thanh toán định kỳ.
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-2xs overflow-hidden">
            {/* Tab Header Navigation */}
            <div className="flex border-b border-border-subtle bg-slate-50/60 px-6 pt-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "profile"
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-ink-subtle hover:text-ink-primary"
                }`}
              >
                Thông tin cơ sở & Đại diện
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("wallet")}
                className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "wallet"
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-ink-subtle hover:text-ink-primary"
                }`}
              >
                <span>Ví Travel</span>
                {!user?.wallet && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "security"
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-ink-subtle hover:text-ink-primary"
                }`}
              >
                Bảo mật & Đổi mật khẩu
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === "profile" && (
                <ProviderInfoForm
                  user={user}
                  isSubmitting={isUpdatingProfile}
                  onSubmit={handleSaveProfile}
                  feedback={profileFeedback}
                />
              )}

              {activeTab === "wallet" && (
                <ProviderWalletActivation
                  user={user}
                  isActivating={isActivatingWallet}
                  onActivateWallet={handleActivateWallet}
                  feedback={walletFeedback}
                />
              )}

              {activeTab === "security" && (
                <ProviderSecurityForm
                  isSubmitting={isChangingPassword}
                  onSubmit={handleChangePassword}
                  feedback={securityFeedback}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
