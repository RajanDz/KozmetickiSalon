import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminLayout, { AdminSection } from '../components/layout/AdminLayout'
import StatusBadge from '../components/shared/StatusBadge'
import EmptyState from '../components/shared/EmptyState'
import { TableSkeleton, CardSkeleton } from '../components/shared/Skeleton'
import { StatusKey } from '../design-system/tokens'
import EditAppointmentModal, { AppointmentRow } from '../components/admin/EditAppointmentModal'
import CreateAppointmentModal from '../components/admin/CreateAppointmentModal'
import { EmployeeFormModal, ScheduleModal, RemoveEmployeeModal, EmployeeRow as EmpRow } from '../components/admin/EmployeeModal'

// ─── Mock data ────────────────────────────────────────────────────────────────

const APPOINTMENTS = [
  { id: '1', client: 'Marko Nikolić',   clientInitials: 'MN', service: 'Šišanje',      employee: 'Ana Petrović',  date: '10.06.2025.', time: '10:00', status: 'CONFIRMED' as StatusKey, price: 10 },
  { id: '2', client: 'Jelena Savić',    clientInitials: 'JS', service: 'Bojenje kose', employee: 'Ana Petrović',  date: '10.06.2025.', time: '11:00', status: 'PENDING'   as StatusKey, price: 30 },
  { id: '3', client: 'Stefan Popović',  clientInitials: 'SP', service: 'Manikir',      employee: 'Nina Đorđević', date: '11.06.2025.', time: '09:00', status: 'CONFIRMED' as StatusKey, price: 12 },
  { id: '4', client: 'Ana Đorđević',    clientInitials: 'AĐ', service: 'Tretman lica', employee: 'Maja Jović',    date: '11.06.2025.', time: '14:00', status: 'CANCELLED' as StatusKey, price: 20 },
  { id: '5', client: 'Ivan Mitić',      clientInitials: 'IM', service: 'Šišanje',      employee: 'Ana Petrović',  date: '12.06.2025.', time: '09:30', status: 'PENDING'   as StatusKey, price: 10 },
  { id: '6', client: 'Sara Kovačević',  clientInitials: 'SK', service: 'Manikir',      employee: 'Nina Đorđević', date: '12.06.2025.', time: '11:00', status: 'CONFIRMED' as StatusKey, price: 12 },
]

const EMPLOYEES = [
  { id: '1', name: 'Ana Petrović',  initials: 'AP', role: 'Frizer & Kolorist', appts: 28, revenue: 720,  utilization: 80, active: true,  services: ['Šišanje', 'Bojenje kose', 'Tretman kose'] },
  { id: '2', name: 'Maja Jović',    initials: 'MJ', role: 'Kozmetičar',        appts: 19, revenue: 380,  utilization: 54, active: true,  services: ['Tretman lica', 'Depilacija'] },
  { id: '3', name: 'Nina Đorđević', initials: 'NĐ', role: 'Manikir & Pedikir', appts: 22, revenue: 264,  utilization: 63, active: true,  services: ['Manikir', 'Pedikir'] },
  { id: '4', name: 'Lena Perić',    initials: 'LP', role: 'Frizer',             appts: 0,  revenue: 0,    utilization: 0,  active: false, services: [] },
]

const SERVICES = [
  { id: '1', name: 'Šišanje',         icon: '✂️', duration: 30, price: 10, bookings: 34, active: true  },
  { id: '2', name: 'Bojenje kose',    icon: '🎨', duration: 90, price: 30, bookings: 12, active: true  },
  { id: '3', name: 'Manikir',         icon: '💅', duration: 45, price: 12, bookings: 22, active: true  },
  { id: '4', name: 'Tretman lica',    icon: '🌿', duration: 60, price: 20, bookings: 15, active: true  },
  { id: '5', name: 'Depilacija nogu', icon: '🪷', duration: 60, price: 17, bookings: 8,  active: false },
]

// ─── Sub-stranice ─────────────────────────────────────────────────────────────

function Overview() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* KPI red */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Danas" value="8" sub="termina" delta="+2 vs jučer" positive />
        <KpiCard label="Ova nedjelja" value="31" sub="termina" delta="+5 vs prošle" positive />
        <KpiCard label="Prihod — jun" value="1.364" sub="€" delta="+12% vs maj" positive />
        <KpiCard label="Na čekanju" value="3" sub="potvrde" delta="2 su hitna" positive={false} />
      </div>

      {/* Dva panela */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Današnji termini */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="t-heading-md">Danas · 10. jun</p>
            <span className="t-caption">8 termina</span>
          </div>
          <ul className="divide-y divide-gray-50">
            {APPOINTMENTS.slice(0, 5).map(a => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xs font-mono font-semibold text-rose-600 w-11 shrink-0">{a.time}</span>
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {a.clientInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.client}</p>
                  <p className="text-xs text-gray-400 truncate">{a.service} · {a.employee}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
          <div className="px-5 py-3 border-t border-gray-50">
            <button className="btn-ghost text-xs w-full">Prikaži sve →</button>
          </div>
        </div>

        {/* Zaposleni utilization */}
        <div className="card lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="t-heading-md">Zaposleni</p>
            <p className="t-caption mt-0.5">Iskorišćenost ovog mjeseca</p>
          </div>
          <ul className="divide-y divide-gray-50 px-5">
            {EMPLOYEES.filter(e => e.active).map(e => (
              <li key={e.id} className="py-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">{e.initials}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-none">{e.name}</p>
                      <p className="text-[11px] text-gray-400">{e.appts} termina</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{(e.revenue / 1000).toFixed(0)}k</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div
                    className="bg-rose-500 h-1 rounded-full transition-all"
                    style={{ width: `${e.utilization}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Appointments() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading]  = useState(false)
  const [rows, setRows]       = useState<AppointmentRow[]>(APPOINTMENTS)
  const [editing, setEditing] = useState<AppointmentRow | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = statusFilter === 'all'
    ? rows
    : rows.filter(a => a.status === statusFilter)

  function handleSave(updated: AppointmentRow) {
    setRows(prev => prev.map(r => r.id === updated.id ? updated : r))
    setEditing(null)
  }

  function handleCancel(id: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' as StatusKey } : r))
  }

  function handleCreate(row: AppointmentRow) {
    setRows(prev => [row, ...prev])
    setCreating(false)
  }

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {[
            { key: 'all',       label: 'Svi' },
            { key: 'PENDING',   label: 'Na čekanju' },
            { key: 'CONFIRMED', label: 'Potvrđeni' },
            { key: 'CANCELLED', label: 'Otkazani' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === f.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1.5 opacity-60">
                  {APPOINTMENTS.filter(a => a.status === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary text-xs">+ Nova rezervacija</button>
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">Klijent</th>
                <th className="table-th">Usluga</th>
                <th className="table-th hidden md:table-cell">Zaposleni</th>
                <th className="table-th hidden lg:table-cell">Datum</th>
                <th className="table-th">Vrijeme</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Cijena</th>
                <th className="table-th" />
              </tr>
            </thead>
            {loading ? (
              <TableSkeleton rows={6} cols={8} />
            ) : filtered.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon="📅" title="Nema rezervacija" description="Ne postoje rezervacije za izabrani filter." />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => (
                  <tr key={a.id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {a.clientInitials}
                        </div>
                        <span className="font-medium text-gray-800">{a.client}</span>
                      </div>
                    </td>
                    <td className="table-td">{a.service}</td>
                    <td className="table-td hidden md:table-cell text-gray-500">{a.employee}</td>
                    <td className="table-td hidden lg:table-cell text-gray-500">{a.date}</td>
                    <td className="table-td">
                      <span className="font-mono text-rose-600 font-medium">{a.time}</span>
                    </td>
                    <td className="table-td"><StatusBadge status={a.status} /></td>
                    <td className="table-td text-right font-semibold text-gray-800">
                      {a.price.toLocaleString()} <span className="text-gray-400 font-normal text-xs">€</span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 justify-end">
                        {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                          <button
                            onClick={() => setEditing(a)}
                            className="btn-ghost text-xs py-1 px-2"
                          >
                            Uredi
                          </button>
                        )}
                        {a.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancel(a.id)}
                            className="btn-danger text-xs py-1 px-2"
                          >
                            Otkaži
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="t-caption">{filtered.length} rezervacija</p>
          <div className="flex items-center gap-1">
            <button className="btn-ghost text-xs py-1">← Preth.</button>
            <span className="text-xs text-gray-400 px-2">1 / 1</span>
            <button className="btn-ghost text-xs py-1 opacity-40" disabled>Sljedeća →</button>
          </div>
        </div>
      </div>

      {editing && (
        <EditAppointmentModal
          appointment={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {creating && (
        <CreateAppointmentModal
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  )
}

function Employees() {
  const [rows,      setRows]      = useState<EmpRow[]>(EMPLOYEES)
  const [creating,  setCreating]  = useState(false)
  const [editing,   setEditing]   = useState<EmpRow | null>(null)
  const [schedule,  setSchedule]  = useState<EmpRow | null>(null)
  const [removing,  setRemoving]  = useState<EmpRow | null>(null)

  function handleCreate(row: EmpRow) {
    setRows(prev => [row, ...prev])
    setCreating(false)
  }

  function handleEdit(row: EmpRow) {
    setRows(prev => prev.map(r => r.id === row.id ? row : r))
    setEditing(null)
  }

  function handleRemove() {
    if (!removing) return
    setRows(prev => prev.map(r => r.id === removing.id ? { ...r, active: false } : r))
    setRemoving(null)
  }

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between">
        <p className="t-caption">{rows.filter(e => e.active).length} aktivnih od {rows.length}</p>
        <button onClick={() => setCreating(true)} className="btn-primary text-xs">+ Dodaj zaposlenog</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map(e => (
          <div key={e.id} className={`card p-5 transition-opacity ${!e.active ? 'opacity-50' : ''}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-sm shrink-0">
                  {e.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{e.name}</p>
                  <p className="text-xs text-gray-400">{e.role}</p>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                e.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {e.active ? 'Aktivan' : 'Neaktivan'}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-base font-bold text-gray-900">{e.appts}</p>
                <p className="text-[10px] text-gray-400">termina</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-base font-bold text-gray-900">{e.revenue ? `${e.revenue}` : '—'}</p>
                <p className="text-[10px] text-gray-400">€</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-base font-bold text-gray-900">{e.utilization}%</p>
                <p className="text-[10px] text-gray-400">iskoriš.</p>
              </div>
            </div>

            {/* Usluge */}
            {e.services.length > 0 ? (
              <div className="flex flex-wrap gap-1 mb-4">
                {e.services.map(s => (
                  <span key={s} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-300 mb-4 italic">Nema dodijeljenih usluga</p>
            )}

            {/* Akcije */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => setSchedule(e)} className="btn-secondary text-xs flex-1 py-1.5">Raspored</button>
              <button onClick={() => setEditing(e)}  className="btn-secondary text-xs flex-1 py-1.5">Uredi</button>
              {e.active && (
                <button onClick={() => setRemoving(e)} className="btn-danger text-xs px-2.5 py-1.5">✕</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {creating && <EmployeeFormModal mode="create" onSave={handleCreate} onClose={() => setCreating(false)} />}
      {editing   && <EmployeeFormModal mode="edit" initial={editing} onSave={handleEdit} onClose={() => setEditing(null)} />}
      {schedule  && <ScheduleModal employee={schedule} onClose={() => setSchedule(null)} />}
      {removing  && <RemoveEmployeeModal employee={removing} onConfirm={handleRemove} onClose={() => setRemoving(null)} />}
    </div>
  )
}

function Services() {
  const [loading] = useState(false)

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="t-caption">{SERVICES.filter(s => s.active).length} aktivnih usluga</p>
        <button className="btn-primary text-xs">+ Dodaj uslugu</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Usluga</th>
              <th className="table-th hidden sm:table-cell">Trajanje</th>
              <th className="table-th">Cijena</th>
              <th className="table-th hidden md:table-cell text-right">Rezervacija</th>
              <th className="table-th">Status</th>
              <th className="table-th" />
            </tr>
          </thead>
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <tbody className="divide-y divide-gray-50">
              {SERVICES.map(s => (
                <tr key={s.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{s.icon}</span>
                      <span className="font-medium text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="table-td hidden sm:table-cell text-gray-500">{s.duration} min</td>
                  <td className="table-td font-semibold text-gray-800">
                    {s.price.toLocaleString()} <span className="text-gray-400 font-normal text-xs">€</span>
                  </td>
                  <td className="table-td hidden md:table-cell text-right">
                    <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">{s.bookings}×</span>
                  </td>
                  <td className="table-td">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {s.active ? 'Aktivna' : 'Neaktivna'}
                    </span>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1 justify-end">
                      <button className="btn-ghost text-xs py-1 px-2">Uredi</button>
                      <button className={`text-xs py-1 px-2 rounded-lg transition-colors ${
                        s.active
                          ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}>
                        {s.active ? 'Deaktiviraj' : 'Aktiviraj'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  )
}

// ─── KPI kartica ──────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, delta, positive }: {
  label: string; value: string; sub: string; delta: string; positive: boolean
}) {
  return (
    <div className="card p-5">
      <p className="t-label mb-3">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
        <span className={`text-[11px] font-medium px-2 py-1 rounded-full mb-0.5 ${
          positive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {delta}
        </span>
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void
}

export default function AdminPage({ onBack }: Props) {
  const [section, setSection] = useState<AdminSection>('overview')

  return (
    <AdminLayout section={section} onSection={setSection} onBack={onBack}>
      {section === 'overview'     && <Overview />}
      {section === 'appointments' && <Appointments />}
      {section === 'employees'    && <Employees />}
      {section === 'services'     && <Services />}
    </AdminLayout>
  )
}
