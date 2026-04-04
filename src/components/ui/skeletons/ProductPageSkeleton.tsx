import { Skeleton } from '../Skeleton';

export function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#000033] pt-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        {/* Main layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Gallery */}
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="aspect-[4/3] w-full" rounded="2xl" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-20" rounded="lg" />
              ))}
            </div>
          </div>
          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-4 pt-4">
              <Skeleton className="h-10 w-24" rounded="xl" />
              <Skeleton className="h-10 w-24" rounded="xl" />
            </div>
            <Skeleton className="h-12 w-full mt-4" rounded="xl" />
            <Skeleton className="h-48 w-full mt-4" rounded="xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
