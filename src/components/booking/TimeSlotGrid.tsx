import { useTranslation } from 'react-i18next'

interface Slot {
  startTime: string
  endTime: string
  available: boolean
}

interface Props {
  slots: Slot[]
  selected: string | null
  onSelect: (time: string) => void
  loading?: boolean
}

function generateDemoSlots(): Slot[] {
  const slots: Slot[] = []
  const booked = ['09:30', '11:00', '14:00', '15:30']
  let h = 9, m = 0
  while (h < 17 || (h === 16 && m <= 30)) {
    const start = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
    m += 30; if (m >= 60) { h++; m -= 60 }
    const end = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
    slots.push({ startTime: start, endTime: end, available: !booked.includes(start) })
  }
  return slots
}

const DEMO_SLOTS = generateDemoSlots()

export default function TimeSlotGrid({ slots, selected, onSelect, loading }: Props) {
  const { t } = useTranslation()
  const displaySlots = slots.length > 0 ? slots : DEMO_SLOTS

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  const available   = displaySlots.filter(s => s.available)
  const unavailable = displaySlots.filter(s => !s.available)

  if (displaySlots.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">{t('slots.none')}</p>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-rose-100 border border-rose-300 inline-block" />
          {t('slots.available_count', { count: available.length })}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200 inline-block" />
          {t('slots.unavailable_count', { count: unavailable.length })}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {displaySlots.map((slot) => (
          <button
            key={slot.startTime}
            disabled={!slot.available}
            onClick={() => slot.available && onSelect(slot.startTime)}
            title={slot.available ? t('slots.available') : t('slots.unavailable')}
            className={`py-2 px-1 rounded-lg text-sm font-medium transition-all text-center
              ${!slot.available
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                : selected === slot.startTime
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
          >
            {slot.startTime}
          </button>
        ))}
      </div>
    </div>
  )
}
