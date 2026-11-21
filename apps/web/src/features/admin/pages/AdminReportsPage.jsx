import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, EyeOff, Flag, ShieldAlert } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import { adminReportApi } from "../services/adminReportApi";

const STATUS_TABS = [
  { key: "", label: "Tất cả" },
  { key: "pending", label: "Chờ xử lý" },
  { key: "resolved_hidden", label: "Đã ẩn nội dung" },
  { key: "dismissed", label: "Đã bỏ qua" },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminReportApi.listReports({ status: statusFilter });
      const items = res?.data?.data || [];
      setReports(items);
      setPendingCount(res?.meta?.pending_count ?? 0);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleHide = async (id) => {
    setBusyId(id);
    try {
      await adminReportApi.hideContent(id, "Ẩn nội dung vi phạm theo kiểm duyệt Admin");
      await loadReports();
    } finally {
      setBusyId(null);
    }
  };

  const handleDismiss = async (id) => {
    setBusyId(id);
    try {
      await adminReportApi.dismissReport(id, "Báo cáo không đủ cơ sở vi phạm");
      await loadReports();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kiểm duyệt Nội dung &amp; Báo cáo</h1>
            <p className="mt-1 text-sm text-slate-500">
              Xử lý báo cáo bài viết và bình luận vi phạm tiêu chuẩn cộng đồng ({pendingCount} chờ xử lý).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                statusFilter === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Lý do</th>
                <th className="px-4 py-3">Người báo cáo</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Đang tải danh sách báo cáo...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Không có báo cáo nào trong mục này.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">#{r.id}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        <Flag className="h-3 w-3" />
                        {r.target_type} #{r.target_id}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.reason}</td>
                    <td className="px-4 py-3 text-slate-600">{r.reporter?.email || "Người dùng"}</td>
                    <td className="px-4 py-3">
                      {r.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <ShieldAlert className="h-3 w-3" /> Chờ xử lý
                        </span>
                      ) : r.status === "resolved_hidden" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
                          <EyeOff className="h-3 w-3" /> Đã ẩn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> Đã bỏ qua
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "pending" && (
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            disabled={busyId === r.id}
                            onClick={() => handleHide(r.id)}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            Ẩn nội dung
                          </button>
                          <button
                            type="button"
                            disabled={busyId === r.id}
                            onClick={() => handleDismiss(r.id)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                          >
                            Bỏ qua
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
