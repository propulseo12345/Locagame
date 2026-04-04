import { Skeleton } from '../Skeleton';

interface AdminPageSkeletonProps {
  type?: 'table' | 'detail' | 'form';
  statsCount?: number;
  tableColumns?: number;
}

export function AdminPageSkeleton({ type = 'table', statsCount = 4, tableColumns = 5 }: AdminPageSkeletonProps) {
  if (type === 'detail') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10" variant="light" rounded="lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" variant="light" />
            <Skeleton className="h-4 w-32" variant="light" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <Skeleton className="h-5 w-32" variant="light" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24" variant="light" />
                  <Skeleton className="h-4 w-48" variant="light" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <Skeleton className="h-5 w-28" variant="light" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" variant="light" rounded="lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" variant="light" />
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <Skeleton className="h-5 w-32" variant="light" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" variant="light" />
              <Skeleton className="h-10 w-full" variant="light" rounded="lg" />
            </div>
          ))}
          <Skeleton className="h-10 w-32 mt-4" variant="light" rounded="lg" />
        </div>
      </div>
    );
  }

  // Default: table layout
  const widths = ['w-32', 'w-48', 'w-16', 'w-24', 'w-16'];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" variant="light" />
          <Skeleton className="h-4 w-32" variant="light" />
        </div>
        <Skeleton className="h-10 w-36" variant="light" rounded="lg" />
      </div>
      {/* Stats */}
      {statsCount > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: statsCount }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <Skeleton className="h-3 w-20" variant="light" />
              <Skeleton className="h-7 w-14" variant="light" />
            </div>
          ))}
        </div>
      )}
      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 flex gap-8">
          {Array.from({ length: tableColumns }).map((_, i) => (
            <Skeleton key={i} className={`h-3 ${widths[i % widths.length]}`} variant="light" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-4 border-t border-gray-100 flex gap-8 items-center">
            {Array.from({ length: tableColumns }).map((_, j) => (
              <Skeleton key={j} className={`h-4 ${widths[j % widths.length]}`} variant="light" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
