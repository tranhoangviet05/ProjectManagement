import React, { useState } from "react";
import { UserRole } from "@stb/shared-types";

export default function App() {
  const [activeRole, setActiveRole] = useState(UserRole.Admin);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-sky-600">Social Travel Booking</span>
          <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">
            Management Web
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">Workspace:</span>
          <span className="font-semibold text-slate-700">@stb/web</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển hệ thống</h1>
          <p className="text-sm text-slate-500 mt-1">
            Phân hệ quản trị và vận hành dịch vụ du lịch
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            onClick={() => setActiveRole(UserRole.Admin)}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeRole === UserRole.Admin
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Quản trị viên (Admin)
          </button>
          <button
            onClick={() => setActiveRole(UserRole.Provider)}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeRole === UserRole.Provider
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Nhà cung cấp (Provider)
          </button>
          <button
            onClick={() => setActiveRole(UserRole.Tourist)}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeRole === UserRole.Tourist
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Khách du lịch (Tourist Preview)
          </button>
        </div>

        {/* Role Content Panels */}
        {activeRole === UserRole.Admin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">Phê duyệt đối tác</h3>
              <p className="text-2xl font-bold text-slate-900 mt-2">12</p>
              <span className="text-xs text-amber-600 font-medium">Cần xử lý trong ngày</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">Tổng người dùng</h3>
              <p className="text-2xl font-bold text-slate-900 mt-2">1,420</p>
              <span className="text-xs text-emerald-600 font-medium">+8% so với tuần trước</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">Báo cáo vi phạm</h3>
              <p className="text-2xl font-bold text-slate-900 mt-2">3</p>
              <span className="text-xs text-slate-500">Chờ xem xét</span>
            </div>
          </div>
        )}

        {activeRole === UserRole.Provider && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">Dịch vụ đang mở bán</h3>
              <p className="text-2xl font-bold text-slate-900 mt-2">8</p>
              <span className="text-xs text-emerald-600 font-medium">Tours & Homestay</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">Booking mới</h3>
              <p className="text-2xl font-bold text-slate-900 mt-2">24</p>
              <span className="text-xs text-sky-600 font-medium">Chờ xác nhận</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">Doanh thu tạm tính</h3>
              <p className="text-2xl font-bold text-slate-900 mt-2">45,800,000 đ</p>
              <span className="text-xs text-slate-500">Tháng này</span>
            </div>
          </div>
        )}

        {activeRole === UserRole.Tourist && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <h3 className="text-lg font-semibold text-slate-800">Cổng trải nghiệm cho Du khách</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Ứng dụng chính cho khách du lịch được phát triển trên mobile Expo (
              <code className="bg-slate-100 px-1 py-0.5 rounded text-sky-600">apps/mobile</code>).
              Web portal cung cấp trang công khai và xem trước dịch vụ.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
