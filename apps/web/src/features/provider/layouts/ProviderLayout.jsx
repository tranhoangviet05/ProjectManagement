import React from "react";
import ProviderSidebar from "../components/ProviderSidebar";

/**
 * Layout dùng chung chuẩn cho toàn bộ các trang của Nhà cung cấp (Provider)
 * Bao gồm thanh ProviderSidebar bên trái và vùng làm việc nội dung chính bên phải.
 */
export default function ProviderLayout({
  activeTab,
  onSelectTab,
  bookingBadge,
  serviceBadge,
  children,
}) {
  return (
    <div className="min-h-screen bg-surface-base flex flex-col lg:flex-row">
      {/* Thanh điều hướng bên trái dùng chung */}
      <ProviderSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        bookingBadge={bookingBadge}
        serviceBadge={serviceBadge}
      />

      {/* Vùng nội dung chính của từng trang Provider */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
