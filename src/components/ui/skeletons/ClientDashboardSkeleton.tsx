import { Skeleton } from '../Skeleton';
import { ReservationCardSkeleton } from './ReservationCardSkeleton';

export function ClientDashboardSkeleton() {
  return (
    <div className="space-y-5 mt-6 md:mt-8">
      {/* Welcome hero */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 flex-shrink-0" rounded="full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
      </div>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-5">
            <Skeleton className="w-10 h-10 mb-3" rounded="xl" />
            <Skeleton className="h-4 w-28 mb-1" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      {/* Recent reservations */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <ReservationCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
