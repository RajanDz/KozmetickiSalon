interface Props { className?: string }

export function Skeleton({ className = '' }: Props) {
  return <div className={`skeleton ${className}`} />
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-gray-100">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <Skeleton className={`h-4 ${c === 0 ? 'w-32' : c === cols - 1 ? 'w-16' : 'w-24'}`} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}
