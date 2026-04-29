interface Props {
  type: 'haircut' | 'color' | 'manicure' | 'facial' | 'wax'
  size?: number
  className?: string
}

const ICONS = {
  haircut: (
    <svg viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#fdf2f4"/>
      {/* Makaze */}
      <path d="M12 14c0 2.2 1.8 4 4 4s4-1.8 4-4-1.8-4-4-4-4 1.8-4 4z" stroke="#dd4672" strokeWidth="1.5" fill="none"/>
      <path d="M12 26c0 2.2 1.8 4 4 4s4-1.8 4-4-1.8-4-4-4-4 1.8-4 4z" stroke="#dd4672" strokeWidth="1.5" fill="none"/>
      <path d="M16 18l12-4" stroke="#dd4672" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 22l12 4" stroke="#dd4672" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  color: (
    <svg viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#fdf6f0"/>
      {/* Četkica + kapljica */}
      <path d="M14 10l4 4-8 8a2 2 0 002.83 2.83L21 16l4 4" stroke="#c45a2c" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M26 8l-4 4" stroke="#c45a2c" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M26 28c0 2.2-1 4-3 4s-3-1.8-3-4c0-1.5 3-6 3-6s3 4.5 3 6z" fill="#e38a56" opacity="0.7"/>
    </svg>
  ),
  manicure: (
    <svg viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#fdf2f4"/>
      {/* Ruka / nokti */}
      <rect x="14" y="22" width="4"  height="8" rx="2" fill="#f2a3b3"/>
      <rect x="19" y="20" width="4"  height="10" rx="2" fill="#e97090"/>
      <rect x="24" y="22" width="4"  height="8" rx="2" fill="#f2a3b3"/>
      <path d="M13 22v-4a1 1 0 012 0v4" stroke="#dd4672" strokeWidth="1.2"/>
      <path d="M18 20v-5a1 1 0 012 0v5" stroke="#dd4672" strokeWidth="1.2"/>
      <path d="M23 22v-4a1 1 0 012 0v4" stroke="#dd4672" strokeWidth="1.2"/>
    </svg>
  ),
  facial: (
    <svg viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#faf8f5"/>
      {/* Lice */}
      <circle cx="20" cy="18" r="8" stroke="#9e7544" strokeWidth="1.5" fill="none"/>
      <circle cx="17" cy="17" r="1.5" fill="#9e7544" opacity="0.6"/>
      <circle cx="23" cy="17" r="1.5" fill="#9e7544" opacity="0.6"/>
      <path d="M17 21.5c.8 1 1.5 1.5 3 1.5s2.2-.5 3-1.5" stroke="#9e7544" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Listić */}
      <path d="M28 10c0 0 4-1 4 3s-4 3-4 3" stroke="#b88e5a" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  ),
  wax: (
    <svg viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#fdf6f0"/>
      {/* Noga + traka */}
      <path d="M16 28c0 0 0-12 4-12s4 12 4 12" stroke="#c45a2c" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <rect x="13" y="18" width="14" height="4" rx="2" fill="#e38a56" opacity="0.7"/>
      <path d="M13 20h14" stroke="#c45a2c" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  ),
}

export default function ServiceIcon({ type, size = 48, className = '' }: Props) {
  return (
    <div style={{ width: size, height: size }} className={`shrink-0 ${className}`}>
      {ICONS[type]}
    </div>
  )
}
