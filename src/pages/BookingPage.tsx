import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import CalendarPicker from '../components/booking/CalendarPicker'
import TimeSlotGrid from '../components/booking/TimeSlotGrid'
import EmployeePicker from '../components/booking/EmployeePicker'
import { useAuth } from '../context/AuthContext'

const SERVICES = [
  { id: '1', name: 'Šišanje',         duration: 30,  price: 10, icon: '✂️' },
  { id: '2', name: 'Bojenje kose',    duration: 90,  price: 30, icon: '🎨' },
  { id: '3', name: 'Manikir',         duration: 45,  price: 12, icon: '💅' },
  { id: '4', name: 'Tretman lica',    duration: 60,  price: 20, icon: '🌿' },
  { id: '5', name: 'Depilacija nogu', duration: 60,  price: 17, icon: '🪷' },
]

const EMPLOYEES = [
  { id: '1', name: 'Ana Petrović',  role: 'Frizer & Kolorist', avatar: 'AP' },
  { id: '2', name: 'Maja Jović',    role: 'Kozmetičar',        avatar: 'MJ' },
  { id: '3', name: 'Nina Đorđević', role: 'Manikir & Pedikir', avatar: 'NĐ' },
]

type Step = 'service' | 'employee' | 'datetime' | 'form'
const STEP_ORDER: Step[] = ['service', 'employee', 'datetime', 'form']

interface Props { preselectedServiceId?: string | null; onAuth?: () => void }

export default function BookingPage({ preselectedServiceId, onAuth }: Props) {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [step, setStep]             = useState<Step>(preselectedServiceId ? 'employee' : 'service')
  const [serviceId, setServiceId]   = useState<string | null>(preselectedServiceId ?? null)
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [date, setDate]             = useState<Date | null>(null)
  const [time, setTime]             = useState<string | null>(null)
  const [form, setForm]             = useState({ firstName: '', lastName: '', phone: '', email: '', notes: '' })
  const [forSelf, setForSelf]       = useState(true)
  const [submitted, setSubmitted]   = useState(false)

  // Kad se korisnik učita i odabrao je "Moji podaci", popuni formu
  useEffect(() => {
    if (user && forSelf) {
      setForm(f => ({
        ...f,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        phone:     user.phone ?? f.phone,
      }))
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleForSelf() {
    if (user) {
      setForm(f => ({
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        phone:     user.phone ?? f.phone,
        notes:     f.notes,
      }))
    }
    setForSelf(true)
  }

  function handleForOther() {
    setForm(f => ({ firstName: '', lastName: '', phone: '', email: '', notes: f.notes }))
    setForSelf(false)
  }

  const service  = SERVICES.find(s => s.id === serviceId)
  const employee = EMPLOYEES.find(e => e.id === employeeId)
  const stepIdx  = STEP_ORDER.indexOf(step)

  const STEP_LABELS: Record<Step, string> = {
    service:  `1. ${t('booking.step_service')}`,
    employee: `2. ${t('booking.step_employee')}`,
    datetime: `3. ${t('booking.step_datetime')}`,
    form:     `4. ${t('booking.step_form')}`,
  }

  function canProceed() {
    if (step === 'service')  return !!serviceId
    if (step === 'employee') return !!employeeId
    if (step === 'datetime') return !!date && !!time
    if (step === 'form')     return !!form.firstName && !!form.lastName && !!form.phone
    return false
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('booking.success_title')}</h2>
          <p className="text-gray-500 mb-6">{t('booking.success_subtitle', { email: form.email || t('form.placeholders.email') })}</p>
          <div className="bg-rose-50 rounded-2xl p-5 text-left text-sm space-y-2 mb-8">
            <Row label={t('booking.summary_service')}  value={`${service?.icon} ${service?.name}`} />
            <Row label={t('booking.summary_employee')} value={employee?.name ?? ''} />
            <Row label={t('booking.summary_date')}     value={date?.toLocaleDateString('sr-Latn-ME', { weekday: 'long', day: 'numeric', month: 'long' }) ?? ''} />
            <Row label={t('booking.summary_time')}     value={`${time} (${service?.duration} min)`} />
            <Row label={t('booking.summary_price')}    value={t('services.price', { amount: service?.price.toLocaleString() })} />
          </div>
          <button
            onClick={() => { setSubmitted(false); setStep('service'); setServiceId(null); setEmployeeId(null); setDate(null); setTime(null) }}
            className="bg-rose-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-700 transition-colors"
          >
            {t('booking.book_another')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Stepper */}
        <div className="flex items-center gap-1 mb-10 overflow-x-auto pb-2">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className="flex items-center gap-1 shrink-0">
              <div className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                s === step ? 'bg-rose-600 text-white'
                : STEP_ORDER.indexOf(s) < stepIdx ? 'bg-rose-100 text-rose-600'
                : 'bg-gray-100 text-gray-400'
              }`}>
                {STEP_LABELS[s]}
              </div>
              {i < 3 && <span className="text-gray-300">›</span>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8">

          {/* Korak 1: Usluga */}
          {step === 'service' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('booking.select_service')}</h2>
              <div className="space-y-3">
                {SERVICES.map(s => (
                  <button key={s.id} onClick={() => setServiceId(s.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      serviceId === s.id ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-500">{t('services.duration', { min: s.duration })}</p>
                    </div>
                    <span className="font-bold text-rose-600">{t('services.price', { amount: s.price.toLocaleString() })}</span>
                    {serviceId === s.id && <span className="text-rose-500">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Korak 2: Zaposleni */}
          {step === 'employee' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t('booking.select_employee')}</h2>
              <p className="text-sm text-gray-400 mb-6">
                {t('booking.summary_service')}: <strong>{service?.icon} {service?.name}</strong>
              </p>
              <EmployeePicker employees={EMPLOYEES} selected={employeeId} onSelect={setEmployeeId} />
            </div>
          )}

          {/* Korak 3: Datum i vreme */}
          {step === 'datetime' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t('booking.step_datetime')}</h2>
              <p className="text-sm text-gray-400 mb-6">{service?.icon} {service?.name} · {employee?.name}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('booking.select_date')}</p>
                  <CalendarPicker selected={date} onSelect={(d) => { setDate(d); setTime(null) }} />
                </div>
                {date && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {t('booking.free_slots', { date: date.toLocaleDateString('sr-Latn-ME', { day: 'numeric', month: 'short' }) })}
                    </p>
                    <TimeSlotGrid slots={[]} selected={time} onSelect={setTime} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Korak 4: Forma */}
          {step === 'form' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('booking.your_details')}</h2>

              {/* Promo bannerica — samo za neprijavljene */}
              {!user && (
                <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-5">
                  <span className="text-rose-400 mt-0.5 shrink-0">✦</span>
                  <p className="text-xs text-rose-700 leading-relaxed flex-1">
                    Registracijom naloga možete pratiti vašu istoriju rezervacija i biti u toku sa online popustima.{' '}
                    {onAuth && (
                      <button onClick={onAuth} className="font-semibold underline underline-offset-2 hover:no-underline transition-all">
                        Registruj se
                      </button>
                    )}
                  </p>
                </div>
              )}

              {/* Toggle — samo za prijavljene korisnike */}
              {user && (
                <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                  <button
                    onClick={handleForSelf}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      forSelf ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>👤</span> Moji podaci
                  </button>
                  <button
                    onClick={handleForOther}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      !forSelf ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>👥</span> Za drugu osobu
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label={t('form.first_name')}
                    value={form.firstName}
                    onChange={v => setForm(f => ({ ...f, firstName: v }))}
                    placeholder={t('form.placeholders.first_name')}
                    locked={user !== null && forSelf}
                  />
                  <Field
                    label={t('form.last_name')}
                    value={form.lastName}
                    onChange={v => setForm(f => ({ ...f, lastName: v }))}
                    placeholder={t('form.placeholders.last_name')}
                    locked={user !== null && forSelf}
                  />
                </div>
                <Field
                  label={t('form.phone')}
                  value={form.phone}
                  onChange={v => setForm(f => ({ ...f, phone: v }))}
                  placeholder={t('form.placeholders.phone')}
                  type="tel"
                  locked={user !== null && forSelf && !!user.phone}
                />
                <Field
                  label={t('form.email_optional')}
                  value={form.email}
                  onChange={v => setForm(f => ({ ...f, email: v }))}
                  placeholder={t('form.placeholders.email')}
                  type="email"
                  locked={user !== null && forSelf}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.notes_label')}</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={t('booking.notes_placeholder')} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer: nazad / nastavi */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            {step === 'form' && (
              <div className="bg-rose-50 rounded-2xl p-4 text-sm mb-6 space-y-2">
                <Row label={t('booking.summary_service')}  value={`${service?.icon} ${service?.name}`} />
                <Row label={t('booking.summary_employee')} value={employee?.name ?? ''} />
                <Row label={t('booking.summary_date')}     value={date?.toLocaleDateString('sr-Latn-ME', { weekday: 'short', day: 'numeric', month: 'short' }) ?? ''} />
                <Row label={t('booking.summary_time')}     value={`${time} — ${service?.duration} min`} />
                <Row label={t('booking.summary_price')}    value={t('services.price', { amount: service?.price.toLocaleString() })} />
              </div>
            )}
            <div className="flex items-center justify-between">
              {stepIdx > 0
                ? <button onClick={() => setStep(STEP_ORDER[stepIdx - 1])} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">{t('booking.back')}</button>
                : <div />
              }
              <button
                disabled={!canProceed()}
                onClick={() => step === 'form' ? setSubmitted(true) : setStep(STEP_ORDER[stepIdx + 1])}
                className={`px-8 py-3 rounded-full font-semibold text-sm transition-all ${
                  canProceed() ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-md' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {step === 'form' ? t('booking.confirm_booking') : t('booking.next')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', locked = false }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; locked?: boolean
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {locked && <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">iz naloga</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => !locked && onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={locked}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${
          locked
            ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-default'
            : 'border-gray-200 focus:ring-2 focus:ring-rose-300'
        }`}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}
