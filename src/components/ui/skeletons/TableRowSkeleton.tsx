import { Skeleton } from '../Skeleton';

interface TableRowSkeletonProps {
  columns?: number;
  rows?: number;
}

export function TableRowSkeleton({ columns = 7, rows = 6 }: TableRowSkeletonProps) {
  const widths = ['w-36', 'w-24', 'w-16', 'w-20', 'w-16', 'w-12', 'w-12'];

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-4 py-4">
              <Skeleton
                className={`h-4 ${widths[colIdx % widths.length]}`}
                variant="light"
              />
              {colIdx === 0 && (
                <Skeleton className="h-3 w-24 mt-1.5" variant="light" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
