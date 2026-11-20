import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Typography from "../../../components/ui/Typography";
import AdminUsersTable from "../components/AdminUsersTable";
import UserDetailModal from "../components/UserDetailModal";
import UserBanDialog from "../components/UserBanDialog";
import adminUserApi from "../services/adminUserApi";

/**
 * Screen Orchestrator: Trang Quản lý Tài khoản Người dùng (Route: /admin/users)
 * Chỉ quản lý 2 vai trò: Nhà cung cấp (provider) và Khách du lịch (tourist).
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ all: 0, provider: 0, tourist: 0, active: 0, banned: 0 });
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [detailUser, setDetailUser] = useState(null);
  const [banTarget, setBanTarget] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminUserApi.listUsers({
        role: roleFilter,
        status: statusFilter,
        q: searchQuery,
      });
      setUsers(res?.data || []);
      if (res?.counts) setCounts(res.counts);
    } catch (err) {
      showToast("error", err?.message || "Không thể tải danh sách tài khoản.");
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, statusFilter, searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleViewDetail = async (userSummary) => {
    setDetailUser(userSummary);
    setIsLoadingDetail(true);
    try {
      const res = await adminUserApi.getUserDetail(userSummary.id);
      if (res?.data) setDetailUser(res.data);
    } catch (err) {
      showToast("error", err?.message || "Không thể tải chi tiết tài khoản.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleConfirmBan = async (userId, reason) => {
    setIsSubmitting(true);
    try {
      const res = await adminUserApi.updateUserStatus(userId, { status: "banned", reason });
      showToast("success", res?.message || "Đã khóa tài khoản thành công.");
      setBanTarget(null);
      setDetailUser(null);
      await loadUsers();
    } catch (err) {
      showToast("error", err?.message || "Không thể khóa tài khoản.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnban = async (userId) => {
    setIsSubmitting(true);
    try {
      const res = await adminUserApi.updateUserStatus(userId, { status: "active" });
      showToast("success", res?.message || "Đã mở khóa tài khoản thành công.");
      setDetailUser(null);
      await loadUsers();
    } catch (err) {
      showToast("error", err?.message || "Không thể mở khóa tài khoản.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-rose-950 text-white border-rose-800"
              : "bg-slate-900 text-white border-slate-700"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Typography variant="h1" className="text-2xl sm:text-3xl font-bold text-ink-primary">
              Quản lý Tài khoản
            </Typography>
            <Typography variant="body-sm" className="text-ink-subtle mt-1">
              Theo dõi tài khoản Nhà cung cấp & Khách du lịch, trạng thái kích hoạt Ví và xử lý khóa
              tài khoản vi phạm.
            </Typography>
          </div>
        </div>

        <AdminUsersTable
          users={users}
          isLoading={isLoading}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          counts={counts}
          onViewDetail={handleViewDetail}
          onOpenBan={(u) => setBanTarget(u)}
          onUnban={handleUnban}
        />
      </div>

      <UserDetailModal
        user={detailUser}
        isLoadingDetail={isLoadingDetail}
        isSubmitting={isSubmitting}
        onClose={() => setDetailUser(null)}
        onOpenBan={(u) => setBanTarget(u)}
        onUnban={handleUnban}
      />

      <UserBanDialog
        key={banTarget?.id || "closed"}
        user={banTarget}
        isSubmitting={isSubmitting}
        onClose={() => setBanTarget(null)}
        onConfirmBan={handleConfirmBan}
      />
    </AdminLayout>
  );
}
