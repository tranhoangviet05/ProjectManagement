import React from "react";

/**
 * Thành phần Loading Skeleton dùng chung trên Web Portal (@stb/web).
 * Sử dụng hiệu ứng shimmer mượt mà từ index.css (.stb-skeleton).
 */
export function Skeleton({ className = "", rounded = "rounded-xl" }) {
  return <div aria-hidden="true" className={`stb-skeleton ${rounded} ${className}`} />;
}

/**
 * Skeleton mô phỏng chính xác cấu trúc thẻ Dịch vụ Du lịch (Tour / Khách sạn).
 */
export function ServiceCardSkeleton() {
  return (
    <div className="bg-surface-elevated rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(15,23,42,0.05)] flex flex-col">
      <Skeleton className="w-full aspect-[16/10]" rounded="rounded-none" />

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-14" rounded="rounded-full" />
            <Skeleton className="h-3.5 w-24" rounded="rounded-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-full" rounded="rounded-lg" />
            <Skeleton className="h-5 w-3/4" rounded="rounded-lg" />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <Skeleton className="h-3.5 w-24" rounded="rounded-full" />
            <Skeleton className="h-3.5 w-16" rounded="rounded-full" />
          </div>
        </div>

        <div className="pt-3.5 flex items-center justify-between gap-2 bg-surface-muted/40 -mx-5 -mb-5 px-5 py-3.5">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-28" rounded="rounded-lg" />
            <Skeleton className="h-3 w-14" rounded="rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" rounded="rounded-full" />
            <Skeleton className="h-8 w-8" rounded="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <ServiceCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default Skeleton;
