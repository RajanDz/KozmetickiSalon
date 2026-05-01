import { useState } from 'react'
import { StatusKey } from '../../design-system/tokens'
import StatusBadge from '../shared/StatusBadge'

const SERVICES = [
  { id: '1', name: 'Šišanje',         duration: 30,  price: 10 },
  { id: '2', name: 'Bojenje kose',    duration: 90,  price: 30 },
  { id: '3', name: 'Manikir',         duration: 45,  price: 12 },
  { id: '4', name: 'Tretman lica',    duration: 60,  price: 20 },
  { id: '5', name: 'Depilacija nogu', duration: 60,  price: 17 },
]

const STATUSES: { value: StatusKey; label: string }[] = [
  { value: 'PENDING',   label: 'Na čekanju' },
  { value: 'CONFIRMED', label: 'Potvrđen'   },
  { value: 'COMPLETED', label: 'Završen'    },
  { value: 'CANCELLED', label: 'Otkazan'    },
]

export interface AppointmentRow {
  id: string
  client: string
  clientInitials: string
  service: string
  employee: string
  date: string
  time: string
  status: StatusKey
  price: number
}

interface Props {
  appointment: AppointmentRow
  onSave: (updated: AppointmentRow) => void
  onCancel: () => void
}

export default function EditAppointmentModal({ appointment, onSave, onCancel }: Props) {
  const [service, setService] = useState(appointment.service)
  const [time,    setTime]    = useState(appointment.time)
  const [date,    setDate]    = useState(appointment.date)
  const [status,  setStatus]  = useState<StatusKey>(appointment.status)
  const [saving,  setSaving]  = useState(false)

  const selectedService = SERVICES.find(s => s.name === service) ?? SERVICES[0]

  function handleSave() {
    setSaving(true)
    // Simulacija API poziva — zamijeni sa stvarnim fetch/supabase pozivom
    setTimeout(() => {
      onSave({
        ...appointment,
        service,
        time,
        date,
        status,
        price: selectedService.price,
      })
      setSaving(false)
    }, 400)
  }

  const hasChanges =
    service !== appointment.service ||
    time    !== appointment.time    ||
    date    !== appointment.date    ||
    status  !== appointment.status

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-md z-10">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Uredi rezervaciju</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {appointment.client} · {appointment.employee}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Tijelo */}
        <div className="px-6 py-5 space-y-5">

          {/* Tretman */}
          <div>
            <label className="t-label block mb-2">Tretman</label>
            <div className="grid grid-cols-1 gap-2">
              {SERVICES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setService(s.name)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all text-left ${
                    service === s.name
                      ? 'border-blush-400 bg-blush-50 text-blush-700'
                      : 'border-gray-200 hover:border-gray-300 text-stone-700'
                  }`}
                >
                  <span className="font-medium">{s.name}</span>
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span>{s.duration} min</span>
                    <span className="font-semibold text-stone-600">{s.price} €</span>
                    {service === s.name && <span className="text-blush-500">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Datum i Vrijeme */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="t-label block mb-2">Datum</label>
              <input
                type="date"
                value={date.split('.').reverse().join('-')}
                onChange={e => {
                  const parts = e.target.value.split('-')
                  setDate(`${parts[2]}.${parts[1]}.${parts[0]}.`)
                }}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="t-label block mb-2">Vrijeme</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="input text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="t-label block mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                    status === s.value
                      ? 'border-stone-400 bg-stone-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <StatusBadge status={s.value} />
                  {status === s.value && <span className="ml-auto text-stone-500 text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Odustani
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="btn-primary flex-1"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Čuvanje...
              </span>
            ) : 'Sačuvaj izmjene'}
          </button>
        </div>
      </div>
    </div>
  )
}
