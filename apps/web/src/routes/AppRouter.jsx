import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import AuthPage from "../features/auth/pages/AuthPage";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import ProviderDashboardPage from "../features/provider/pages/ProviderDashboardPage";
import TouristPreviewPage from "../features/tourist/pages/TouristPreviewPage";
import Typography from "../components/ui/Typography";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-7 h-7 text-brand-primary animate-spin" />
      <Typography variant="body-sm" className="text-ink-subtle">
        Đang đồng bộ phiên đăng nhập...
      </Typography>
    </div>
  );
}

/**
 * Bảo vệ Route theo phân quyền (Role-based Guard)
 */
function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, isLoading, role, getDashboardRouteByRole } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardRouteByRole(role)} replace />;
  }

  return children;
}

/**
 * Tự động chuyển hướng khỏi trang /auth nếu đã đăng nhập
 */
function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, role, getDashboardRouteByRole } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (isAuthenticated) {
    return <Navigate to={getDashboardRouteByRole(role)} replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang Đăng nhập / Đăng ký */}
        <Route
          path="/auth"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />

        {/* Bảng điều khiển Quản trị viên (Admin) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Bảng điều khiển Nhà cung cấp (Provider) */}
        <Route
          path="/provider/*"
          element={
            <ProtectedRoute allowedRoles={["provider", "admin"]}>
              <ProviderDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Không gian Du khách trên Web (Tourist) */}
        <Route
          path="/tourist/*"
          element={
            <ProtectedRoute allowedRoles={["tourist", "provider", "admin"]}>
              <TouristPreviewPage />
            </ProtectedRoute>
          }
        />

        {/* Điều hướng mặc định */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
