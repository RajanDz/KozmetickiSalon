interface Props {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon = '📭', title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-4xl mb-4 opacity-60">{icon}</span>
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      {description && <p className="text-xs text-gray-400 max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  )
}
