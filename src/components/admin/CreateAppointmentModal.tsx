import { useState } from 'react'
import { StatusKey } from '../../design-system/tokens'
import { AppointmentRow } from './EditAppointmentModal'

const SERVICES = [
  { id: '1', name: 'Šišanje',         duration: 30, price: 10 },
  { id: '2', name: 'Bojenje kose',    duration: 90, price: 30 },
  { id: '3', name: 'Manikir',         duration: 45, price: 12 },
  { id: '4', name: 'Tretman lica',    duration: 60, price: 20 },
  { id: '5', name: 'Depilacija nogu', duration: 60, price: 17 },
]

const EMPLOYEES = [
  { id: '1', name: 'Ana Petrović',  role: 'Frizer & Kolorist' },
  { id: '2', name: 'Maja Jović',    role: 'Kozmetičar'        },
  { id: '3', name: 'Nina Đorđević', role: 'Manikir & Pedikir' },
]

interface Props {
  onSave: (row: AppointmentRow) => void
  onCancel: () => void
}

interface FormState {
  clientName: string
  serviceId:  string
  employeeId: string
  date:       string
  time:       string
}

const EMPTY: FormState = {
  clientName: '',
  serviceId:  '1',
  employeeId: '1',
  date:       new Date().toISOString().slice(0, 10),
  time:       '09:00',
}

function initials(name: string) {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}.`
}

export default function CreateAppointmentModal({ onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [saving, setSaving] = useState(false)

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const e: typeof errors = {}
    if (!form.clientName.trim())     e.clientName = 'Ime klijenta je obavezno.'
    if (!form.date || form.date < todayIso()) e.date = 'Izaberite datum u budućnosti.'
    if (!form.time)                  e.time = 'Unesite vrijeme.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    setSaving(true)

    const service  = SERVICES.find(s => s.id === form.serviceId)!
    const employee = EMPLOYEES.find(e => e.id === form.employeeId)!

    setTimeout(() => {
      onSave({
        id:             String(Date.now()),
        client:         form.clientName.trim(),
        clientInitials: initials(form.clientName),
        service:        service.name,
        employee:       employee.name,
        date:           formatDate(form.date),
        time:           form.time,
        status:         'CONFIRMED' as StatusKey,
        price:          service.price,
      })
      setSaving(false)
    }, 400)
  }

  const selectedService  = SERVICES.find(s => s.id === form.serviceId)!
  const selectedEmployee = EMPLOYEES.find(e => e.id === form.employeeId)!

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-md z-10 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Nova rezervacija</h2>
            <p className="text-xs text-stone-400 mt-0.5">Kreira se sa statusom Potvrđen</p>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Klijent */}
          <div>
            <label className="t-label block mb-2">Ime klijenta</label>
            <input
              type="text"
              value={form.clientName}
              onChange={e => set('clientName', e.target.value)}
              placeholder="npr. Ana Marković"
              className={`input ${errors.clientName ? 'input-error' : ''}`}
            />
            {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>}
          </div>

          {/* Tretman */}
          <div>
            <label className="t-label block mb-2">Tretman</label>
            <div className="space-y-1.5">
              {SERVICES.map(s => (
                <button
                  key={s.id}
                  onClick={() => set('serviceId', s.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all text-left ${
                    form.serviceId === s.id
                      ? 'border-blush-400 bg-blush-50 text-blush-700'
                      : 'border-gray-200 hover:border-gray-300 text-stone-700'
                  }`}
                >
                  <span className="font-medium">{s.name}</span>
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span>{s.duration} min</span>
                    <span className="font-semibold text-stone-600">{s.price} €</span>
                    {form.serviceId === s.id && <span className="text-blush-500">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Zaposleni */}
          <div>
            <label className="t-label block mb-2">Zaposleni</label>
            <div className="grid grid-cols-3 gap-2">
              {EMPLOYEES.map(e => (
                <button
                  key={e.id}
                  onClick={() => set('employeeId', e.id)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-all ${
                    form.employeeId === e.id
                      ? 'border-blush-400 bg-blush-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${
                    form.employeeId === e.id ? 'bg-blush-200 text-blush-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {initials(e.name)}
                  </div>
                  <p className="text-[11px] font-medium text-stone-700 leading-tight">{e.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-stone-400 leading-tight">{e.role}</p>
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
                value={form.date}
                min={todayIso()}
                onChange={e => set('date', e.target.value)}
                className={`input text-sm ${errors.date ? 'input-error' : ''}`}
              />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="t-label block mb-2">Vrijeme</label>
              <input
                type="time"
                value={form.time}
                min="08:00"
                max="19:00"
                step="900"
                onChange={e => set('time', e.target.value)}
                className={`input text-sm ${errors.time ? 'input-error' : ''}`}
              />
              {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Rezime */}
          <div className="bg-sand-50 rounded-xl p-4 text-xs space-y-1.5 border border-sand-200">
            <p className="t-label mb-2">Pregled</p>
            <div className="flex justify-between">
              <span className="text-stone-400">Klijent</span>
              <span className="font-medium text-stone-700">{form.clientName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Tretman</span>
              <span className="font-medium text-stone-700">{selectedService.name} · {selectedService.duration} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Zaposleni</span>
              <span className="font-medium text-stone-700">{selectedEmployee.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Datum i vrijeme</span>
              <span className="font-medium text-stone-700">{form.date ? formatDate(form.date) : '—'} u {form.time}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-sand-200">
              <span className="text-stone-400">Cijena</span>
              <span className="font-bold text-blush-600">{selectedService.price} €</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
          <button onClick={onCancel} className="btn-secondary flex-1">Odustani</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Kreiranje...
              </span>
            ) : 'Kreiraj rezervaciju'}
          </button>
        </div>
      </div>
    </div>
  )
}
