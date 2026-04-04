import { Skeleton } from '../Skeleton';

export function ReservationCardSkeleton() {
  return (
    <div className="bg-white/[0.04] rounded-2xl border border-white/10 border-l-4 border-l-white/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center flex-wrap gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-28" rounded="md" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04] mx-px">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-[#000033]/60 px-6 py-4 flex items-start gap-3">
            <Skeleton className="w-5 h-5 flex-shrink-0" rounded="sm" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-1.5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-36" rounded="lg" />
      </div>
    </div>
  );
}
