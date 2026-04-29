import { PrismaClient } from '@prisma/client'
import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  addMinutes,
  isBefore,
  isEqual,
  format,
  getDay,
} from 'date-fns'
import type {
  TimeSlot,
  BookedInterval,
  WorkingWindow,
  AvailabilityQuery,
  AvailabilityResult,
} from '../types/availability'

// ─── Mapa JS getDay() → Prisma DayOfWeek enum ────────────────────────────────
const JS_DAY_TO_ENUM: Record<number, string> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
}

// ─── Parsira "HH:MM" u { hours, minutes } ────────────────────────────────────
function parseTime(hhmm: string): { hours: number; minutes: number } {
  const [hours, minutes] = hhmm.split(':').map(Number)
  return { hours, minutes }
}

// ─── Primeni "HH:MM" na konkretan datum ──────────────────────────────────────
function applyTime(date: Date, hhmm: string): Date {
  const { hours, minutes } = parseTime(hhmm)
  return setMinutes(setHours(startOfDay(date), hours), minutes)
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE: da li se [start, end) preklapa sa nekim od zauzetih intervala?
//
// Algoritam: sweep line O(n) — intervali su sortirani po startTime od DB-a.
// Preklapanje postoji ako: bookedStart < slotEnd AND bookedEnd > slotStart
// Ekvivalentno: NOT (slotEnd <= bookedStart OR slotStart >= bookedEnd)
// ─────────────────────────────────────────────────────────────────────────────
function overlapsAny(
  slotStart: Date,
  slotEnd: Date,
  booked: BookedInterval[],
): boolean {
  for (const interval of booked) {
    if (
      isBefore(interval.startTime, slotEnd) &&
      isBefore(slotStart, interval.endTime)
    ) {
      return true
    }
    // Pošto su intervali sortirani: ako je početak intervala >= kraj slota,
    // sve dalje je van dometa — možemo prekinuti petlju.
    if (!isBefore(interval.startTime, slotEnd)) break
  }
  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR SLOTOVA
//
// Ulaz : radno vreme [windowStart, windowEnd), trajanje usluge, zauzeti intervali
// Izlaz: lista slotova svakih SLOT_STEP minuta, označenih kao available/busy
//
// SLOT_STEP = 15 min — standardni granularitet za booking UI.
// Slot je dostupan ako CELA usluga (slot + durationMin) staje u radno vreme
// i ne preklapa se ni sa jednim zauzetim terminom.
// ─────────────────────────────────────────────────────────────────────────────
const SLOT_STEP_MIN = 15

function generateSlots(
  window: WorkingWindow,
  durationMin: number,
  booked: BookedInterval[],
): TimeSlot[] {
  const slots: TimeSlot[] = []
  let cursor = window.startTime
  const latestStart = addMinutes(window.endTime, -durationMin)

  while (isBefore(cursor, latestStart) || isEqual(cursor, latestStart)) {
    const slotEnd = addMinutes(cursor, durationMin)
    slots.push({
      startTime: cursor,
      endTime: slotEnd,
      available: !overlapsAny(cursor, slotEnd, booked),
    })
    cursor = addMinutes(cursor, SLOT_STEP_MIN)
  }

  return slots
}

// ─────────────────────────────────────────────────────────────────────────────
// AVAILABILITY SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export class AvailabilityService {
  constructor(private readonly prisma: PrismaClient) {}

  async getAvailableSlots(query: AvailabilityQuery): Promise<AvailabilityResult> {
    const { employeeId, serviceId, date } = query
    const dayEnum = JS_DAY_TO_ENUM[getDay(date)]

    // ── 1. Paralelno dohvati radno vreme, uslugu i zauzete termine ────────────
    const [workingHours, service, existingAppointments] = await Promise.all([
      this.prisma.workingHours.findUnique({
        where: {
          employeeId_dayOfWeek: {
            employeeId,
            dayOfWeek: dayEnum as any,
          },
        },
      }),

      this.prisma.service.findUnique({
        where: { id: serviceId },
        select: { id: true, durationMin: true, isActive: true },
      }),

      // Samo PENDING i CONFIRMED termini blokiraju slot
      this.prisma.appointment.findMany({
        where: {
          employeeId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          startTime: { gte: startOfDay(date) },
          endTime:   { lte: endOfDay(date) },
        },
        select: { startTime: true, endTime: true },
        orderBy: { startTime: 'asc' }, // mora biti sortirano za sweep-line
      }),
    ])

    // ── 2. Validacija ─────────────────────────────────────────────────────────
    if (!service || !service.isActive) {
      throw new Error(`Usluga (${serviceId}) ne postoji ili nije aktivna.`)
    }

    if (!workingHours || !workingHours.isActive) {
      return this.emptyResult(employeeId, serviceId, date, service.durationMin)
    }

    // ── 3. Konstruiši radni prozor za konkretan datum ─────────────────────────
    const window: WorkingWindow = {
      startTime: applyTime(date, workingHours.startTime),
      endTime:   applyTime(date, workingHours.endTime),
    }

    // ── 4. Generiši slotove ───────────────────────────────────────────────────
    const booked: BookedInterval[] = existingAppointments.map((a) => ({
      startTime: a.startTime,
      endTime:   a.endTime,
    }))

    const slots = generateSlots(window, service.durationMin, booked)

    return {
      employeeId,
      serviceId,
      date: format(date, 'yyyy-MM-dd'),
      durationMin: service.durationMin,
      slots,
    }
  }

  // Convenience: samo slobodni slotovi (za API response)
  async getFreeSlots(query: AvailabilityQuery): Promise<TimeSlot[]> {
    const result = await this.getAvailableSlots(query)
    return result.slots.filter((s) => s.available)
  }

  private emptyResult(
    employeeId: string,
    serviceId: string,
    date: Date,
    durationMin: number,
  ): AvailabilityResult {
    return {
      employeeId,
      serviceId,
      date: format(date, 'yyyy-MM-dd'),
      durationMin,
      slots: [],
    }
  }
}
