import { Skeleton } from '../Skeleton';

export function CategoryCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl aspect-square bg-white/5">
      <div className="absolute inset-0 bg-gradient-to-t from-[#000033] via-[#000033]/50 to-transparent" />
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="absolute top-4 right-4">
          <Skeleton className="h-6 w-10" rounded="full" />
        </div>
        <Skeleton className="w-14 h-14 mb-4" rounded="xl" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
