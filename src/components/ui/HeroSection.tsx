interface Props {
  onBook: () => void
}

// Realne Unsplash fotografije — kozmetički salon, prirodno osvjetljenje
const SALON_PHOTO = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=80&auto=format&fit=crop'
const ACCENT_PHOTO_1 = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80&auto=format&fit=crop'
const ACCENT_PHOTO_2 = 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80&auto=format&fit=crop'

export default function HeroSection({ onBook }: Props) {
  return (
    <section className="bg-gradient-to-br from-sand-50 via-blush-50 to-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-16 lg:py-24 items-center">

          {/* Lijeva strana — tekst */}
          <div className="order-2 lg:order-1">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-white border border-sand-200 rounded-full px-3 py-1 mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blush-400" />
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Online zakazivanje
              </span>
            </div>

            {/* Naslov */}
            <h1 className="t-display font-bold text-stone-900 leading-tight mb-5"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
            >
              Tvoja ljepota,<br />
              <em className="not-italic text-blush-500">tvoj termin</em>
            </h1>

            <p className="t-body text-stone-500 max-w-sm mb-8 leading-relaxed">
              Profesionalni salon u srcu Podgorice. Biraj uslugu, zaposlenog i termin koji odgovara tebi — sve za manje od minute.
            </p>

            {/* CTA grupa */}
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={onBook} className="btn-primary px-7 py-3 text-sm">
                Zakaži termin
              </button>
              <a
                href="#services"
                onClick={e => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) }}
                className="btn-secondary px-5 py-3 text-sm"
              >
                Pogledaj usluge
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-5 mt-8 pt-8 border-t border-sand-200">
              <div>
                <p className="text-xl font-bold text-stone-900">500+</p>
                <p className="text-[11px] text-stone-400">zadovoljnih klijenata</p>
              </div>
              <div className="w-px h-8 bg-sand-200" />
              <div>
                <p className="text-xl font-bold text-stone-900">4.9</p>
                <p className="text-[11px] text-stone-400">prosječna ocjena</p>
              </div>
              <div className="w-px h-8 bg-sand-200" />
              <div>
                <p className="text-xl font-bold text-stone-900">8 god.</p>
                <p className="text-[11px] text-stone-400">iskustva</p>
              </div>
            </div>
          </div>

          {/* Desna strana — fotografije */}
          <div className="order-1 lg:order-2 relative">

            {/* Glavna fotografija */}
            <div className="relative rounded-3xl overflow-hidden shadow-card-lg aspect-[4/5] max-h-[520px]">
              <img
                src={SALON_PHOTO}
                alt="Bella Salon unutrašnjost"
                className="w-full h-full object-cover"
                loading="eager"
              />
              {/* Blagi overlay za bolji kontrast s akcentnim kartovima */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>

            {/* Floating kartica — sljedeći termin */}
            <div className="absolute -bottom-4 -left-4 lg:-left-8 bg-white rounded-2xl shadow-card-lg p-4 flex items-center gap-3 min-w-[180px] border border-sand-100">
              <div className="w-9 h-9 rounded-full bg-blush-100 flex items-center justify-center shrink-0 text-sm">✦</div>
              <div>
                <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Sljedeći slobodan</p>
                <p className="text-sm font-semibold text-stone-900">Danas 14:30</p>
              </div>
            </div>

            {/* Floating kartica — ocjena */}
            <div className="absolute -top-3 -right-3 lg:-right-6 bg-white rounded-2xl shadow-card-lg p-3 border border-sand-100">
              <div className="flex items-center gap-1 mb-1">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>
              <p className="text-xs font-semibold text-stone-800">4.9 / 5.0</p>
              <p className="text-[10px] text-stone-400">248 recenzija</p>
            </div>

            {/* Accent slike — kolažni efekat */}
            <div className="hidden xl:block absolute top-16 -right-14 w-24 h-28 rounded-2xl overflow-hidden shadow-card-md border-2 border-white rotate-3">
              <img src={ACCENT_PHOTO_1} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="hidden xl:block absolute bottom-24 -right-10 w-20 h-24 rounded-2xl overflow-hidden shadow-card-md border-2 border-white -rotate-2">
              <img src={ACCENT_PHOTO_2} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>

            {/* Dekorativni blur krug */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blush-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  )
}
