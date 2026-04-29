import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type AppRole = 'CLIENT' | 'EMPLOYEE' | 'ADMIN'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: AppRole
      }
    }
  }
}

// ─── requireAuth ─────────────────────────────────────────────────────────────
// Verifikuje Supabase JWT iz Authorization headera.
// Dohvata profil iz `users` tabele i stavlja ga na req.user.
// ─────────────────────────────────────────────────────────────────────────────
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autorizacioni token nije pronađen.' })
  }

  const token = authHeader.slice(7)

  // Supabase verifikuje JWT potpis i rok trajanja
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Token je nevažeći ili je istekao.' })
  }

  // Dohvati role iz naše tabele (Supabase ne čuva custom role)
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, role: true },
  })

  if (!profile) {
    return res.status(401).json({ error: 'Korisnik nije pronađen.' })
  }

  req.user = { id: profile.id, email: profile.email, role: profile.role as AppRole }
  next()
}

// ─── requireRole ─────────────────────────────────────────────────────────────
// Factory koji vraća middleware koji proverava rolu.
// Uvek se koristi POSLE requireAuth.
// ─────────────────────────────────────────────────────────────────────────────
export function requireRole(...roles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Nije autentikovan.' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Pristup odbijen. Potrebna rola: ${roles.join(' ili ')}.`,
      })
    }
    next()
  }
}
