import { Skeleton } from '../Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" variant="light" />
        <Skeleton className="h-4 w-64" variant="light" />
      </div>
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <Skeleton className="h-3 w-24" variant="light" />
            <Skeleton className="h-8 w-20" variant="light" />
            <Skeleton className="h-3 w-32" variant="light" />
          </div>
        ))}
      </div>
      {/* Chart + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <Skeleton className="h-4 w-32" variant="light" />
          <Skeleton className="h-48 w-full" variant="light" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <Skeleton className="h-4 w-28" variant="light" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0" variant="light" rounded="full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-full" variant="light" />
                <Skeleton className="h-3 w-16" variant="light" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
