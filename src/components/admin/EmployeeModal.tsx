import { useState } from 'react'

// ─── Tipovi ───────────────────────────────────────────────────────────────────

export interface EmployeeRow {
  id:          string
  name:        string
  initials:    string
  role:        string
  appts:       number
  revenue:     number
  utilization: number
  active:      boolean
  services:    string[]
}

const ALL_SERVICES = ['Šišanje', 'Bojenje kose', 'Manikir', 'Tretman lica', 'Depilacija nogu', 'Pedikir', 'Tretman kose']

function makeInitials(name: string) {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Zajednički modalni wrapper ───────────────────────────────────────────────

function Modal({ title, subtitle, onClose, children, footer }: {
  title: string; subtitle?: string; onClose: () => void
  children: React.ReactNode; footer: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-md z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-stone-900">{title}</h2>
            {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors text-lg">×</button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">{footer}</div>
      </div>
    </div>
  )
}

// ─── DODAJ / UREDI zaposlenog ─────────────────────────────────────────────────

interface EmployeeFormProps {
  initial?: Partial<EmployeeRow>
  onSave:   (row: EmployeeRow) => void
  onClose:  () => void
  mode:     'create' | 'edit'
}

export function EmployeeFormModal({ initial = {}, onSave, onClose, mode }: EmployeeFormProps) {
  const [firstName, setFirstName] = useState(initial.name?.split(' ')[0] ?? '')
  const [lastName,  setLastName]  = useState(initial.name?.split(' ').slice(1).join(' ') ?? '')
  const [role,      setRole]      = useState(initial.role ?? '')
  const [services,  setServices]  = useState<string[]>(initial.services ?? [])
  const [active,    setActive]    = useState(initial.active ?? true)
  const [errors,    setErrors]    = useState<Record<string, string>>({})
  const [saving,    setSaving]    = useState(false)

  function toggleService(s: string) {
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!firstName.trim()) e.firstName = 'Ime je obavezno.'
    if (!lastName.trim())  e.lastName  = 'Prezime je obavezno.'
    if (!role.trim())      e.role      = 'Specijalizacija je obavezna.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    setSaving(true)
    const fullName = `${firstName.trim()} ${lastName.trim()}`
    setTimeout(() => {
      onSave({
        id:          initial.id ?? String(Date.now()),
        name:        fullName,
        initials:    makeInitials(fullName),
        role,
        appts:       initial.appts       ?? 0,
        revenue:     initial.revenue     ?? 0,
        utilization: initial.utilization ?? 0,
        active,
        services,
      })
      setSaving(false)
    }, 300)
  }

  return (
    <Modal
      title={mode === 'create' ? 'Dodaj zaposlenog' : 'Uredi zaposlenog'}
      subtitle={mode === 'edit' ? initial.name : undefined}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1">Odustani</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving
              ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Čuvanje...</span>
              : mode === 'create' ? 'Dodaj zaposlenog' : 'Sačuvaj izmjene'
            }
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Ime i prezime */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="t-label block mb-1.5">Ime</label>
            <input value={firstName} onChange={e => { setFirstName(e.target.value); setErrors(x => ({ ...x, firstName: '' })) }}
              placeholder="Ana" className={`input ${errors.firstName ? 'input-error' : ''}`} />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="t-label block mb-1.5">Prezime</label>
            <input value={lastName} onChange={e => { setLastName(e.target.value); setErrors(x => ({ ...x, lastName: '' })) }}
              placeholder="Petrović" className={`input ${errors.lastName ? 'input-error' : ''}`} />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Specijalizacija */}
        <div>
          <label className="t-label block mb-1.5">Specijalizacija</label>
          <input value={role} onChange={e => { setRole(e.target.value); setErrors(x => ({ ...x, role: '' })) }}
            placeholder="npr. Frizer & Kolorist" className={`input ${errors.role ? 'input-error' : ''}`} />
          {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
        </div>

        {/* Usluge */}
        <div>
          <label className="t-label block mb-2">Usluge koje pruža</label>
          <div className="flex flex-wrap gap-2">
            {ALL_SERVICES.map(s => (
              <button key={s} onClick={() => toggleService(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  services.includes(s)
                    ? 'bg-blush-500 text-white border-blush-500'
                    : 'border-gray-200 text-stone-500 hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Status — samo pri editovanju */}
        {mode === 'edit' && (
          <div>
            <label className="t-label block mb-2">Status</label>
            <div className="flex gap-2">
              {[{ val: true, label: 'Aktivan' }, { val: false, label: 'Neaktivan' }].map(opt => (
                <button key={String(opt.val)} onClick={() => setActive(opt.val)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                    active === opt.val
                      ? opt.val ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-red-50 border-red-300 text-red-600'
                      : 'border-gray-200 text-stone-400 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── RASPORED zaposlenog ──────────────────────────────────────────────────────

const DAYS = [
  { key: 'MON', label: 'Ponedjeljak' },
  { key: 'TUE', label: 'Utorak'      },
  { key: 'WED', label: 'Srijeda'     },
  { key: 'THU', label: 'Četvrtak'    },
  { key: 'FRI', label: 'Petak'       },
  { key: 'SAT', label: 'Subota'      },
  { key: 'SUN', label: 'Nedjelja'    },
]

interface DaySchedule {
  active: boolean
  start:  string
  end:    string
}

type Schedule = Record<string, DaySchedule>

const DEFAULT_SCHEDULE: Schedule = {
  MON: { active: true,  start: '09:00', end: '17:00' },
  TUE: { active: true,  start: '09:00', end: '17:00' },
  WED: { active: true,  start: '09:00', end: '17:00' },
  THU: { active: true,  start: '09:00', end: '17:00' },
  FRI: { active: true,  start: '09:00', end: '17:00' },
  SAT: { active: false, start: '09:00', end: '14:00' },
  SUN: { active: false, start: '09:00', end: '14:00' },
}

interface ScheduleProps {
  employee: EmployeeRow
  onClose:  () => void
}

export function ScheduleModal({ employee, onClose }: ScheduleProps) {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE)
  const [saving, setSaving] = useState(false)

  function update(day: string, field: keyof DaySchedule, value: string | boolean) {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  function handleSave() {
    setSaving(true)
    // Zamijeni sa stvarnim API pozivom
    setTimeout(() => { setSaving(false); onClose() }, 400)
  }

  const activeDays = Object.values(schedule).filter(d => d.active).length

  return (
    <Modal
      title="Radno vrijeme"
      subtitle={`${employee.name} · ${activeDays} radnih dana`}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1">Odustani</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving
              ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Čuvanje...</span>
              : 'Sačuvaj raspored'
            }
          </button>
        </>
      }
    >
      <div className="space-y-2">
        {DAYS.map(({ key, label }) => {
          const day = schedule[key]
          return (
            <div key={key}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                day.active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              {/* Toggle */}
              <button
                onClick={() => update(key, 'active', !day.active)}
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${day.active ? 'bg-blush-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${day.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>

              {/* Dan */}
              <span className={`text-sm font-medium w-24 shrink-0 ${day.active ? 'text-stone-800' : 'text-stone-400'}`}>
                {label}
              </span>

              {/* Vremena */}
              {day.active ? (
                <div className="flex items-center gap-2 ml-auto">
                  <input type="time" value={day.start} onChange={e => update(key, 'start', e.target.value)}
                    className="input py-1 px-2 text-xs w-24 text-center" />
                  <span className="text-stone-300 text-xs">—</span>
                  <input type="time" value={day.end} onChange={e => update(key, 'end', e.target.value)}
                    className="input py-1 px-2 text-xs w-24 text-center" />
                </div>
              ) : (
                <span className="ml-auto text-xs text-stone-300">Neradni dan</span>
              )}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

// ─── POTVRDA BRISANJA ─────────────────────────────────────────────────────────

interface RemoveProps {
  employee: EmployeeRow
  onConfirm: () => void
  onClose:   () => void
}

export function RemoveEmployeeModal({ employee, onConfirm, onClose }: RemoveProps) {
  const [saving, setSaving] = useState(false)

  function handleConfirm() {
    setSaving(true)
    setTimeout(() => { onConfirm(); setSaving(false) }, 300)
  }

  return (
    <Modal title="Ukloni zaposlenog" onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1">Odustani</button>
          <button onClick={handleConfirm} disabled={saving}
            className="flex-1 btn-primary bg-red-500 hover:bg-red-600">
            {saving
              ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Brisanje...</span>
              : 'Da, ukloni'
            }
          </button>
        </>
      }
    >
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-2xl">
          ⚠️
        </div>
        <p className="text-sm font-semibold text-stone-900 mb-2">
          Ukloniti <span className="text-blush-600">{employee.name}</span>?
        </p>
        <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
          Zaposleni će biti označen kao neaktivan i neće se pojavljivati pri zakazivanju.
          Istorija rezervacija ostaje sačuvana.
        </p>
      </div>
    </Modal>
  )
}
