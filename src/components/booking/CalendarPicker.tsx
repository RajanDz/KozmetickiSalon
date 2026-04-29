import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const UNAVAILABLE_DAYS = [0, 6]

interface Props {
  selected: Date | null
  onSelect: (date: Date) => void
}

export default function CalendarPicker({ selected, onSelect }: Props) {
  const { t } = useTranslation()
  const MONTHS     = t('calendar.months',    { returnObjects: true }) as string[]
  const DAYS_SHORT = t('calendar.days_short',{ returnObjects: true }) as string[]

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth   = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 select-none">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center text-gray-500 hover:text-rose-600 transition-colors">‹</button>
        <span className="font-semibold text-gray-800 text-sm">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center text-gray-500 hover:text-rose-600 transition-colors">›</button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />
          const cellDate   = new Date(viewYear, viewMonth, day)
          const isPast     = cellDate < today
          const isUnavail  = UNAVAILABLE_DAYS.includes(cellDate.getDay())
          const isDisabled = isPast || isUnavail
          const isSelected = selected?.toDateString() === cellDate.toDateString()
          const isToday    = today.toDateString() === cellDate.toDateString()

          return (
            <button
              key={day}
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelect(cellDate)}
              className={`mx-auto w-9 h-9 rounded-full text-sm flex items-center justify-center transition-all
                ${isSelected  ? 'bg-rose-600 text-white font-bold shadow' : ''}
                ${!isSelected && isToday ? 'border-2 border-rose-400 text-rose-600 font-semibold' : ''}
                ${!isSelected && !isDisabled && !isToday ? 'hover:bg-rose-50 text-gray-700' : ''}
                ${isDisabled  ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>

      {selected && (
        <p className="mt-4 text-center text-xs text-rose-600 font-medium">
          {t('calendar.selected', {
            date: selected.toLocaleDateString('sr-Latn-ME', { weekday: 'long', day: 'numeric', month: 'long' }),
          })}
        </p>
      )}
    </div>
  )
}
