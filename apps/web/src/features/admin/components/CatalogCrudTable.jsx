import React from "react";
import { Search, Image as ImageIcon } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import { Skeleton } from "../../../components/ui/Skeleton";

const TABS = [
  { id: "locations", label: "Điểm đến" },
  { id: "categories", label: "Danh mục dịch vụ" },
  { id: "businessTypes", label: "Loại hình kinh doanh" },
];

/**
 * Bảng quản lý dữ liệu gốc (Locations, Categories, BusinessTypes) — đồng bộ chuẩn UI Admin.
 */
export default function CatalogCrudTable({
  activeTab,
  onTabChange,
  items = [],
  isLoading = false,
  searchQuery = "",
  onSearchChange,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-xs overflow-hidden">
      {/* Thanh công cụ */}
      <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-ink-body hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Tìm theo tên hoặc đường dẫn..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors"
          />
          <Search className="w-4 h-4 text-ink-subtle absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[820px]">
          <thead>
            {activeTab === "locations" && (
              <tr className="bg-slate-50/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                <th className="py-3 px-4 sm:px-6">Điểm đến</th>
                <th className="py-3 px-4">Khu vực cha / Quốc gia</th>
                <th className="py-3 px-4">Đường dẫn</th>
                <th className="py-3 px-4">Nổi bật</th>
                <th className="py-3 px-4">Dịch vụ gắn kết</th>
                <th className="py-3 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            )}
            {activeTab === "categories" && (
              <tr className="bg-slate-50/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                <th className="py-3 px-4 sm:px-6">Danh mục</th>
                <th className="py-3 px-4">Đường dẫn</th>
                <th className="py-3 px-4">Mô tả</th>
                <th className="py-3 px-4">Dịch vụ gắn kết</th>
                <th className="py-3 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            )}
            {activeTab === "businessTypes" && (
              <tr className="bg-slate-50/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                <th className="py-3 px-4 sm:px-6">Tên loại hình</th>
                <th className="py-3 px-4">Phân loại lớn</th>
                <th className="py-3 px-4">Đường dẫn</th>
                <th className="py-3 px-4">Nhà cung cấp đang dùng</th>
                <th className="py-3 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-border-subtle text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-4 sm:px-6">
                    <Skeleton className="h-4 w-40" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-28" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-28" rounded="rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-20" rounded="rounded-md" />
                  </td>
                  {activeTab === "locations" && (
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-16" rounded="rounded-md" />
                    </td>
                  )}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <Skeleton className="h-8 w-24 ml-auto" rounded="rounded-lg" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={activeTab === "locations" ? 6 : 5}
                  className="py-12 text-center text-ink-subtle"
                >
                  <div className="max-w-xs mx-auto space-y-1">
                    <Typography variant="body" className="font-semibold text-ink-primary">
                      Chưa có dữ liệu phù hợp
                    </Typography>
                    <Typography variant="caption" className="text-ink-subtle">
                      Nhấn nút thêm mới ở góc trên hoặc đổi từ khóa tìm kiếm.
                    </Typography>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                if (activeTab === "locations") {
                  const isLocked = (item.services_count || 0) > 0 || (item.children_count || 0) > 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100 border border-border-subtle shrink-0">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-ink-subtle">
                                <ImageIcon className="w-4 h-4 opacity-50" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-ink-primary block">
                              {item.name}
                            </span>
                            {item.description && (
                              <span className="text-xs text-ink-subtle line-clamp-1 max-w-xs">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-ink-body">
                        <div>{item.parent?.name || "Cấp cao nhất"}</div>
                        <div className="text-ink-subtle font-mono">{item.country_code || "VN"}</div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-ink-subtle">{item.slug}</td>
                      <td className="py-4 px-4">
                        {item.is_popular ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Phổ biến
                          </span>
                        ) : (
                          <span className="text-xs text-ink-subtle">Thường</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-ink-primary font-medium">
                        {item.services_count || 0} dịch vụ
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onEdit?.(item)}
                          className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-primary font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Sửa
                        </button>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => onDelete?.(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-status-danger border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }

                if (activeTab === "categories") {
                  const isLocked = (item.services_count || 0) > 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {item.icon_url && (
                            <img
                              src={item.icon_url}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover border border-border-subtle shrink-0"
                            />
                          )}
                          <span className="font-semibold text-ink-primary">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-ink-subtle">{item.slug}</td>
                      <td className="py-4 px-4 text-xs text-ink-subtle">
                        <span className="line-clamp-2 max-w-md">{item.description || "--"}</span>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-ink-primary">
                        {item.services_count || 0} dịch vụ
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onEdit?.(item)}
                          className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-primary font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Sửa
                        </button>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => onDelete?.(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-status-danger border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }

                // businessTypes
                const isLocked = (item.provider_profiles_count || 0) > 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-semibold text-ink-primary">
                      {item.name}
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-slate-100 text-ink-body px-2.5 py-0.5 rounded text-xs font-medium">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-ink-subtle">{item.slug}</td>
                    <td className="py-4 px-4 text-xs font-medium text-ink-primary">
                      {item.provider_profiles_count || 0} đối tác
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onEdit?.(item)}
                        className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-slate-100 text-ink-primary font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Sửa
                      </button>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => onDelete?.(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-status-danger border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && items.length > 0 && (
        <div className="px-5 py-3 border-t border-border-subtle bg-slate-50/60 flex items-center justify-between text-xs text-ink-subtle">
          <span>
            Hiển thị <strong>{items.length}</strong> bản ghi
          </span>
          <span>Không cho phép xóa dữ liệu đang được dịch vụ hoặc đối tác sử dụng</span>
        </div>
      )}
    </div>
  );
}
