import { Skeleton } from '../Skeleton';

export function FeaturedProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/3] w-full mb-4" rounded="2xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
