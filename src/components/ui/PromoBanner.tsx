import { useState } from 'react'

interface Props {
  text: string
  cta?: string
  onCta?: () => void
}

export default function PromoBanner({ text, cta, onCta }: Props) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className="bg-gradient-to-r from-blush-500 via-blush-400 to-brand-400 text-white">
      <div className="max-w-5xl mx-auto px-4 h-10 flex items-center justify-between gap-4">
        {/* Dekorativni elementi */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-white/60 text-xs shrink-0">✦</span>
          <p className="text-xs font-medium truncate">{text}</p>
          {cta && (
            <button
              onClick={onCta}
              className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:no-underline transition-all"
            >
              {cta} →
            </button>
          )}
        </div>

        <button
          onClick={() => setVisible(false)}
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
          aria-label="Zatvori"
        >
          ×
        </button>
      </div>
    </div>
  )
}
