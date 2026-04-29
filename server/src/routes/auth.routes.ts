import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../lib/supabase'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()
const prisma = new PrismaClient()

// ─── Zod sheme — jedini izvor istine za validaciju ────────────────────────────

const RegisterSchema = z.object({
  email:     z.string().email('Unesite ispravan email.'),
  password:  z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera.'),
  firstName: z.string().min(1, 'Ime je obavezno.').max(50),
  lastName:  z.string().min(1, 'Prezime je obavezno.').max(50),
  phone:     z.string().regex(/^[0-9+\s()-]{7,15}$/, 'Neispravan broj telefona.').optional(),
})

const LoginSchema = z.object({
  email:    z.string().email('Unesite ispravan email.'),
  password: z.string().min(1, 'Lozinka je obavezna.'),
})

// Pomoćna f-ja za formatiranje Zod grešaka u { field: message } mapu
function formatZodErrors(err: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    err.errors.map(e => [e.path[0] as string, e.message])
  )
}

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: formatZodErrors(parsed.error) })
  }

  const { email, password, firstName, lastName, phone } = parsed.data

  // Kreiraj Supabase Auth korisnika
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // šalje confirmation email
    user_metadata: { first_name: firstName, last_name: lastName },
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      return res.status(409).json({ errors: { email: 'Nalog sa ovim emailom već postoji.' } })
    }
    return res.status(500).json({ errors: { general: 'Greška pri kreiranju naloga.' } })
  }

  // Kreiraj profil u `users` tabeli
  try {
    await prisma.user.create({
      data: {
        id:           authData.user.id,
        email,
        passwordHash: '',          // Auth je na Supabase strani
        firstName,
        lastName,
        phone:        phone ?? null,
        role:         'CLIENT',
      },
    })
  } catch {
    // Cleanup — obrišemo auth korisnika ako profil nije kreiran
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return res.status(500).json({ errors: { general: 'Greška pri čuvanju profila.' } })
  }

  return res.status(201).json({
    message: 'Nalog kreiran. Proverite email za potvrdu.',
  })
})

// ─── POST /auth/login ─────────────────────────────────────────────────────────
// Frontend direktno poziva Supabase SDK za login i dobija JWT.
// Ovaj endpoint služi za server-side validaciju ili alternativni flow.
router.post('/login', async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: formatZodErrors(parsed.error) })
  }

  const { email, password } = parsed.data

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return res.status(401).json({ errors: { general: 'Pogrešan email ili lozinka.' } })
  }

  const profile = await prisma.user.findUnique({
    where: { id: data.user.id },
    select: { id: true, firstName: true, lastName: true, role: true, email: true },
  })

  return res.json({
    accessToken:  data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: profile,
  })
})

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const profile = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true },
  })
  return res.json(profile)
})

// ─── POST /auth/logout ────────────────────────────────────────────────────────
// Supabase invalidira token na svom kraju
router.post('/logout', requireAuth, async (req: Request, res: Response) => {
  const token = req.headers.authorization!.slice(7)
  await supabaseAdmin.auth.admin.signOut(token)
  return res.json({ message: 'Uspešno odjavljivanje.' })
})

export default router
