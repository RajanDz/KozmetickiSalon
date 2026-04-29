import { useTranslation } from 'react-i18next'

interface Employee {
  id: string
  name: string
  role: string
  avatar: string
}

interface Props {
  employees: Employee[]
  selected: string | null
  onSelect: (id: string) => void
}

export default function EmployeePicker({ employees, selected, onSelect }: Props) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {employees.map((e) => (
        <button
          key={e.id}
          onClick={() => onSelect(e.id)}
          aria-label={`${t('employee.select')}: ${e.name}`}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm ${
            selected === e.id
              ? 'border-rose-500 bg-rose-50'
              : 'border-gray-200 bg-white hover:border-rose-200'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 font-bold text-sm flex items-center justify-center shrink-0">
            {e.avatar}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-800">{e.name}</p>
            <p className="text-xs text-gray-500">{e.role}</p>
          </div>
          {selected === e.id && <span className="ml-auto text-rose-500 text-lg">✓</span>}
        </button>
      ))}
    </div>
  )
}
