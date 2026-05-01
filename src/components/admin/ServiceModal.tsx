import { useState } from 'react'

export interface ServiceRow {
  id:       string
  name:     string
  icon:     string
  duration: number
  price:    number
  bookings: number
  active:   boolean
}

const ICON_OPTIONS = ['✂️', '🎨', '💅', '🌿', '🪷', '💆', '💇', '🧖', '💋', '✨', '🧴', '🪮']

function Modal({ title, subtitle, onClose, children, footer }: {
  title: string; subtitle?: string; onClose: () => void
  children: React.ReactNode; footer: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-md z-10 max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-stone-900">{title}</h2>
            {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors text-lg">×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">{footer}</div>
      </div>
    </div>
  )
}

interface ServiceFormProps {
  initial?: Partial<ServiceRow>
  onSave:  (row: ServiceRow) => void
  onClose: () => void
  mode:    'create' | 'edit'
}

export function ServiceFormModal({ initial = {}, onSave, onClose, mode }: ServiceFormProps) {
  const [name,     setName]     = useState(initial.name     ?? '')
  const [icon,     setIcon]     = useState(initial.icon     ?? '✂️')
  const [duration, setDuration] = useState(initial.duration ?? 30)
  const [price,    setPrice]    = useState(initial.price    ?? 0)
  const [active,   setActive]   = useState(initial.active   ?? true)
  const [errors,   setErrors]   = useState<Record<string, string>>({})
  const [saving,   setSaving]   = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim())     e.name     = 'Naziv usluge je obavezan.'
    if (duration <= 0)    e.duration = 'Trajanje mora biti veće od 0.'
    if (price < 0)        e.price    = 'Cijena ne može biti negativna.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    setSaving(true)
    setTimeout(() => {
      onSave({
        id:       initial.id       ?? String(Date.now()),
        name:     name.trim(),
        icon,
        duration,
        price,
        bookings: initial.bookings ?? 0,
        active,
      })
      setSaving(false)
    }, 300)
  }

  return (
    <Modal
      title={mode === 'create' ? 'Dodaj uslugu' : 'Uredi uslugu'}
      subtitle={mode === 'edit' ? initial.name : undefined}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1">Odustani</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving
              ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Čuvanje...</span>
              : mode === 'create' ? 'Dodaj uslugu' : 'Sačuvaj izmjene'
            }
          </button>
        </>
      }
    >
      <div className="space-y-4">

        {/* Ikona */}
        <div>
          <label className="t-label block mb-2">Ikona</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map(ic => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                  icon === ic ? 'border-blush-400 bg-blush-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Naziv */}
        <div>
          <label className="t-label block mb-1.5">Naziv usluge</label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setErrors(x => ({ ...x, name: '' })) }}
            placeholder="npr. Šišanje"
            className={`input ${errors.name ? 'input-error' : ''}`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Trajanje i Cijena */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="t-label block mb-1.5">Trajanje (min)</label>
            <input
              type="number"
              min={5}
              step={5}
              value={duration}
              onChange={e => { setDuration(Number(e.target.value)); setErrors(x => ({ ...x, duration: '' })) }}
              className={`input ${errors.duration ? 'input-error' : ''}`}
            />
            {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
          </div>
          <div>
            <label className="t-label block mb-1.5">Cijena (€)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={e => { setPrice(Number(e.target.value)); setErrors(x => ({ ...x, price: '' })) }}
              className={`input ${errors.price ? 'input-error' : ''}`}
            />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>
        </div>

        {/* Status — samo pri editovanju */}
        {mode === 'edit' && (
          <div>
            <label className="t-label block mb-2">Status</label>
            <div className="flex gap-2">
              {[{ val: true, label: 'Aktivna' }, { val: false, label: 'Neaktivna' }].map(opt => (
                <button
                  key={String(opt.val)}
                  onClick={() => setActive(opt.val)}
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

        {/* Pregled */}
        <div className="bg-sand-50 rounded-xl p-4 text-xs space-y-1.5 border border-sand-200">
          <p className="t-label mb-2">Pregled</p>
          <div className="flex justify-between">
            <span className="text-stone-400">Usluga</span>
            <span className="font-medium text-stone-700">{icon} {name || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Trajanje</span>
            <span className="font-medium text-stone-700">{duration} min</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-sand-200">
            <span className="text-stone-400">Cijena</span>
            <span className="font-bold text-blush-600">{price} €</span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
