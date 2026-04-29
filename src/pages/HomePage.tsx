import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import HeroSection from '../components/ui/HeroSection'
import ServiceIcon from '../components/ui/ServiceIcon'

// Fotografije tretmana — Unsplash, stabilni URL-ovi
const PHOTOS = {
  haircut: 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=600&q=80&auto=format&fit=crop',
  color:   'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=600&q=80&auto=format&fit=crop',
  mani:    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&auto=format&fit=crop',
  facial:  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80&auto=format&fit=crop',
  wax:     'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&q=80&auto=format&fit=crop',
}

const SERVICES = [
  {
    id: '1', name: 'Šišanje',         iconType: 'haircut' as const,
    duration: 30,  price: 10,
    desc: 'Muško i žensko šišanje, blow-dry, stilizovanje.',
    photo: PHOTOS.haircut,
    tags: ['Muško', 'Žensko', 'Blow-dry'],
  },
  {
    id: '2', name: 'Bojenje kose',    iconType: 'color' as const,
    duration: 90,  price: 30,
    desc: 'Balayage, pramenovi, puna boja, keratin tretman.',
    photo: PHOTOS.color,
    tags: ['Balayage', 'Pramenovi', 'Keratin'],
  },
  {
    id: '3', name: 'Manikir',         iconType: 'manicure' as const,
    duration: 45,  price: 12,
    desc: 'Klasični manikir, gel lak, nailart ukrasi.',
    photo: PHOTOS.mani,
    tags: ['Klasični', 'Gel', 'Nailart'],
  },
  {
    id: '4', name: 'Tretman lica',    iconType: 'facial' as const,
    duration: 60,  price: 20,
    desc: 'Dubinsko čišćenje, hidratacija, anti-aging maska.',
    photo: PHOTOS.facial,
    tags: ['Čišćenje', 'Hidratacija', 'Anti-aging'],
  },
  {
    id: '5', name: 'Depilacija',      iconType: 'wax' as const,
    duration: 60,  price: 17,
    desc: 'Vosak i šećerna pasta, sve regije tijela.',
    photo: PHOTOS.wax,
    tags: ['Voskom', 'Šećerna pasta', 'Cijelo tijelo'],
  },
]

const TEAM = [
  {
    id: '1', name: 'Ana Petrović',  initials: 'AP',
    role: 'Frizer & Kolorist', exp: '8 god.',
    bio: 'Specijalist za boju kose i moderne tehnike stilizovanja.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80&auto=format&fit=crop&face',
  },
  {
    id: '2', name: 'Maja Jović',    initials: 'MJ',
    role: 'Kozmetičar', exp: '5 god.',
    bio: 'Posvećena njezi kože i modernim tretmanima lica.',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80&auto=format&fit=crop&face',
  },
  {
    id: '3', name: 'Nina Đorđević', initials: 'NĐ',
    role: 'Manikir & Pedikir', exp: '6 god.',
    bio: 'Ljubav prema detaljima i preciznom nailart dizajnu.',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80&auto=format&fit=crop&face',
  },
]

const REVIEWS = [
  { id: '1', author: 'Milica K.',   rating: 5, text: 'Ana je čarobnjak sa kistom! Bojenje kose savršeno, tačno ono što sam zamislila. Svakako se vraćam.' },
  { id: '2', author: 'Stefan M.',   rating: 5, text: 'Brzo, profesionalno, bez čekanja. Šišanje odlično, a osoblje je jako ljubazno.' },
  { id: '3', author: 'Jovana P.',   rating: 5, text: 'Manikir koji traje! Gel lak izdržao skoro tri sedmice bez ljuštenja. Preporučujem svima.' },
]

interface Props {
  onBook: (serviceId: string) => void
}

export default function HomePage({ onBook }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-sand-50">

      {/* Hero */}
      <HeroSection onBook={() => selectedId ? onBook(selectedId) : document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} />

      {/* Usluge */}
      <section id="services" className="py-20">
        <div className="max-w-5xl mx-auto px-4">

          {/* Sekcija header */}
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="t-label mb-2">Naše usluge</p>
              <h2 className="t-display text-2xl font-bold text-stone-900">
                Odaberite tretman
              </h2>
            </div>
            {selectedId && (
              <button onClick={() => onBook(selectedId)} className="btn-primary">
                Zakaži izabranu uslugu →
              </button>
            )}
          </div>

          {/* Service grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map(s => (
              <ServiceCard
                key={s.id}
                service={s}
                selected={selectedId === s.id}
                onSelect={() => setSelectedId(prev => prev === s.id ? null : s.id)}
              />
            ))}

            {/* CTA kartica — popunjava grid */}
            <div className="card-sand flex flex-col items-center justify-center p-8 text-center min-h-[240px] border-dashed">
              <div className="w-10 h-10 rounded-full bg-sand-200 flex items-center justify-center mb-3 text-sand-500 text-lg">+</div>
              <p className="text-sm font-semibold text-stone-600 mb-1">Niste pronašli?</p>
              <p className="text-xs text-stone-400 mb-4">Kontaktirajte nas za prilagođenu uslugu.</p>
              <a href="tel:+38267000000" className="btn-secondary text-xs">
                Pozovite nas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Promo banner — sezonska ponuda */}
      <section className="py-0">
        <div className="max-w-5xl mx-auto px-4 mb-0">
          <div className="rounded-3xl overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80&auto=format&fit=crop"
              alt="Ljeto u salonu"
              className="w-full h-56 object-cover object-center"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/40 to-transparent" />
            {/* Tekst */}
            <div className="absolute inset-0 flex items-center px-8 lg:px-12">
              <div className="max-w-xs">
                <span className="inline-block text-[10px] font-bold text-blush-300 uppercase tracking-widest mb-2">
                  Ljetna akcija
                </span>
                <h3 className="text-white text-2xl font-bold leading-tight mb-3 t-display">
                  -20% na sve tretmane lica
                </h3>
                <p className="text-white/70 text-sm mb-5">
                  Važeće do kraja avgusta 2025.
                </p>
                <button
                  onClick={() => { setSelectedId('4'); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="btn-primary bg-white !text-stone-900 hover:!bg-sand-50 text-xs"
                >
                  Iskoristi popust
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tim */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-10">
            <p className="t-label mb-2">Upoznajte nas</p>
            <h2 className="t-display text-2xl font-bold text-stone-900">Naš tim</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TEAM.map(e => (
              <div key={e.id} className="card overflow-hidden group">
                {/* Fotografija */}
                <div className="h-48 overflow-hidden bg-sand-100">
                  <img
                    src={e.photo}
                    alt={e.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                {/* Info */}
                <div className="p-5">
                  <p className="text-sm font-semibold text-stone-900">{e.name}</p>
                  <p className="text-xs text-blush-500 font-medium mt-0.5 mb-2">{e.role}</p>
                  <p className="text-xs text-stone-400 leading-relaxed">{e.bio}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                    <span className="text-[11px] text-stone-400">Iskustvo: {e.exp}</span>
                    <button
                      onClick={() => onBook(SERVICES[0].id)}
                      className="text-xs font-semibold text-blush-500 hover:text-blush-600 transition-colors"
                    >
                      Zakaži →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recenzije */}
      <section className="bg-white py-20 section-divider">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-10">
            <p className="t-label mb-2">Recenzije</p>
            <div className="flex items-end gap-4">
              <h2 className="t-display text-2xl font-bold text-stone-900">Šta kažu klijenti</h2>
              <div className="flex items-center gap-1 mb-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
                <span className="text-sm font-semibold text-stone-700 ml-1">4.9</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWS.map(r => (
              <div key={r.id} className="card-sand p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-stone-700 leading-relaxed mb-4">"{r.text}"</p>
                <p className="text-xs font-semibold text-stone-500">{r.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-br from-blush-500 to-brand-500">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="t-display text-2xl font-bold text-white mb-3">
            Spremi za novi izgled?
          </h2>
          <p className="text-white/70 text-sm mb-8 max-w-sm mx-auto">
            Slobodnih termina ima i ovaj tjedan. Rezerviši za manje od minute.
          </p>
          <button
            onClick={() => onBook(SERVICES[0].id)}
            className="btn-primary bg-white !text-stone-900 hover:!bg-sand-50 px-8 py-3"
          >
            Zakaži termin
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blush-500 rounded-md flex items-center justify-center text-xs font-bold">B</div>
              <span className="text-sm font-semibold">Bella Salon</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Profesionalni kozmetički salon u Podgorici. Tu smo za vaš savršen izgled svakog dana.
            </p>
          </div>
          <div>
            <p className="t-label text-stone-500 mb-3">Kontakt</p>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>Ul. Njegoševa 14, Podgorica</li>
              <li>+382 67 000 000</li>
              <li>info@bellasalon.me</li>
            </ul>
          </div>
          <div>
            <p className="t-label text-stone-500 mb-3">Radno vrijeme</p>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>Pon – Pet: 09:00 – 19:00</li>
              <li>Subota: 09:00 – 15:00</li>
              <li>Nedjelja: Zatvoreno</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <p className="text-xs text-stone-600">© 2025 Bella Salon. Sva prava zadržana.</p>
            <p className="text-xs text-stone-600">Podgorica, Crna Gora</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── ServiceCard ──────────────────────────────────────────────────────────────

function ServiceCard({ service, selected, onSelect }: {
  service: typeof SERVICES[0]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`card-hover text-left overflow-hidden flex flex-col group transition-all duration-200 ${
        selected ? 'ring-2 ring-blush-400 border-blush-300 shadow-card-md' : ''
      }`}
    >
      {/* Fotografija */}
      <div className="h-36 overflow-hidden relative bg-sand-100">
        <img
          src={service.photo}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {selected && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blush-500 flex items-center justify-center shadow-md">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <ServiceIcon type={service.iconType} size={28} />
            <p className="text-sm font-semibold text-stone-900">{service.name}</p>
          </div>
        </div>
        <p className="text-xs text-stone-400 leading-relaxed mb-3 flex-1">{service.desc}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {service.tags.map(tag => (
            <span key={tag} className="text-[10px] bg-sand-100 text-stone-500 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <span className="text-[11px] text-stone-400">{service.duration} min</span>
          <span className="text-sm font-bold text-blush-600">{service.price} €</span>
        </div>
      </div>
    </button>
  )
}
