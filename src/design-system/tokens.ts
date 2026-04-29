// Jedini izvor istine za sve vizuelne vrijednosti.
// Tailwind klase se grade od ovih tokena — ne koristiti magične vrijednosti direktno u komponentama.

export const color = {
  brand:       'rose-600',
  brandHover:  'rose-700',
  brandLight:  'rose-50',
  brandBorder: 'rose-100',
  brandMuted:  'rose-200',

  textPrimary:   'gray-900',
  textSecondary: 'gray-500',
  textMuted:     'gray-400',
  textInverse:   'white',

  surface:       'white',
  surfaceSubtle: 'gray-50',
  border:        'gray-200',
  borderStrong:  'gray-300',

  success: 'emerald-600',
  warning: 'amber-500',
  danger:  'red-500',
  info:    'sky-500',
} as const

export const status = {
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  PENDING:   { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'  },
  CANCELLED: { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400'    },
  COMPLETED: { bg: 'bg-gray-100',   text: 'text-gray-500',    dot: 'bg-gray-400'   },
} as const

export type StatusKey = keyof typeof status

export const radius = {
  sm:   'rounded-lg',
  md:   'rounded-xl',
  lg:   'rounded-2xl',
  full: 'rounded-full',
} as const

export const shadow = {
  sm:  'shadow-sm',
  md:  'shadow-md',
  card: 'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
} as const
