import { Skeleton } from '../Skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col">
      <Skeleton className="aspect-[4/3] w-full" rounded="sm" />
      <div className="p-3 sm:p-5 flex-1 flex flex-col">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-1/2 mb-4" />
        <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-white/10">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-[44px] w-full" rounded="xl" />
      </div>
    </div>
  );
}
