import { ProductCardSkeleton } from './ProductCardSkeleton';

interface CatalogGridSkeletonProps {
  count?: number;
}

export function CatalogGridSkeleton({ count = 8 }: CatalogGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
