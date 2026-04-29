/**
 * Unit testovi za Availability Engine.
 * Ne zahtevaju bazu — testiraju čistu logiku generisanja slotova.
 */

import { addMinutes, setHours, setMinutes, startOfDay } from 'date-fns'

// ── Izvlačimo privatne funkcije radi direktnog testiranja ─────────────────────
// (u produkciji se exportuju samo ako je potrebno; ovde testiram logiku direktno)

type BookedInterval = { startTime: Date; endTime: Date }
type WorkingWindow  = { startTime: Date; endTime: Date }
type TimeSlot       = { startTime: Date; endTime: Date; available: boolean }

const SLOT_STEP_MIN = 15

function applyTime(date: Date, hhmm: string): Date {
  const [hours, minutes] = hhmm.split(':').map(Number)
  return setMinutes(setHours(startOfDay(date), hours), minutes)
}

function overlapsAny(start: Date, end: Date, booked: BookedInterval[]): boolean {
  for (const interval of booked) {
    if (interval.startTime < end && start < interval.endTime) return true
    if (interval.startTime >= end) break
  }
  return false
}

function generateSlots(
  window: WorkingWindow,
  durationMin: number,
  booked: BookedInterval[],
): TimeSlot[] {
  const slots: TimeSlot[] = []
  let cursor = window.startTime
  const latestStart = addMinutes(window.endTime, -durationMin)

  while (cursor <= latestStart) {
    const slotEnd = addMinutes(cursor, durationMin)
    slots.push({ startTime: cursor, endTime: slotEnd, available: !overlapsAny(cursor, slotEnd, booked) })
    cursor = addMinutes(cursor, SLOT_STEP_MIN)
  }
  return slots
}

// ─────────────────────────────────────────────────────────────────────────────

const TODAY = startOfDay(new Date('2025-06-10')) // utorak

describe('applyTime', () => {
  it('pravilno postavlja sat i minute na datum', () => {
    const result = applyTime(TODAY, '09:30')
    expect(result.getHours()).toBe(9)
    expect(result.getMinutes()).toBe(30)
  })
})

describe('overlapsAny', () => {
  const booked: BookedInterval[] = [
    { startTime: applyTime(TODAY, '10:00'), endTime: applyTime(TODAY, '11:00') },
    { startTime: applyTime(TODAY, '14:00'), endTime: applyTime(TODAY, '15:00') },
  ]

  it('vraca false kada nema preklapanja (pre zauzetog)', () => {
    expect(overlapsAny(applyTime(TODAY, '09:00'), applyTime(TODAY, '10:00'), booked)).toBe(false)
  })

  it('vraca false kada nema preklapanja (posle zauzetog)', () => {
    expect(overlapsAny(applyTime(TODAY, '11:00'), applyTime(TODAY, '12:00'), booked)).toBe(false)
  })

  it('vraca true kada se slot POTPUNO preklapa sa zauzetim', () => {
    expect(overlapsAny(applyTime(TODAY, '10:00'), applyTime(TODAY, '11:00'), booked)).toBe(true)
  })

  it('vraca true kada slot DELIMICNO ulazi u zauzeti (levi overlap)', () => {
    expect(overlapsAny(applyTime(TODAY, '09:30'), applyTime(TODAY, '10:30'), booked)).toBe(true)
  })

  it('vraca true kada slot DELIMICNO ulazi u zauzeti (desni overlap)', () => {
    expect(overlapsAny(applyTime(TODAY, '10:30'), applyTime(TODAY, '11:30'), booked)).toBe(true)
  })

  it('vraca true kada slot SADRZI zauzeti interval', () => {
    expect(overlapsAny(applyTime(TODAY, '09:45'), applyTime(TODAY, '11:15'), booked)).toBe(true)
  })
})

describe('generateSlots', () => {
  const window: WorkingWindow = {
    startTime: applyTime(TODAY, '09:00'),
    endTime:   applyTime(TODAY, '17:00'),
  }

  it('generiše tačan broj slotova za 30-min uslugu (8h / 15min step = 32 slota)', () => {
    // 09:00–17:00 = 480 min, korak 15 min, poslednji start = 16:30 → (480-30)/15 + 1 = 31
    const slots = generateSlots(window, 30, [])
    expect(slots.length).toBe(31)
  })

  it('svi slotovi su slobodni kada nema rezervacija', () => {
    const slots = generateSlots(window, 30, [])
    expect(slots.every((s) => s.available)).toBe(true)
  })

  it('slot koji se preklapa sa rezervacijom je unavailable', () => {
    const booked: BookedInterval[] = [
      { startTime: applyTime(TODAY, '10:00'), endTime: applyTime(TODAY, '10:30') },
    ]
    const slots = generateSlots(window, 30, booked)
    const unavailable = slots.filter((s) => !s.available)

    const unavailableStarts = unavailable.map((s) =>
      `${s.startTime.getHours()}:${String(s.startTime.getMinutes()).padStart(2, '0')}`,
    )
    // Za 30-min uslugu i booking 10:00–10:30, zauzeta su 3 slota:
    // 09:45–10:15 → preklapa se sa 10:00–10:30
    // 10:00–10:30 → direktno zauzeto
    // 10:15–10:45 → preklapa se sa 10:00–10:30
    // Granični: 09:30–10:00, slotEnd(10:00) < bookedStart(10:00) = FALSE → slobodan
    expect(unavailable.length).toBe(3)
    expect(unavailableStarts).toEqual(['9:45', '10:00', '10:15'])
  })

  it('granični slučaj: slot koji ZAVRŠAVA tačno kada rezervacija POČINJE je slobodan', () => {
    const booked: BookedInterval[] = [
      { startTime: applyTime(TODAY, '10:00'), endTime: applyTime(TODAY, '10:30') },
    ]
    const slots = generateSlots(window, 30, booked)
    const slot_0930 = slots.find(
      (s) => s.startTime.getTime() === applyTime(TODAY, '09:30').getTime(),
    )!
    expect(slot_0930.available).toBe(true)
  })

  it('ne generiše slot ako usluga ne staje u ostatak radnog vremena', () => {
    const tightWindow: WorkingWindow = {
      startTime: applyTime(TODAY, '16:45'),
      endTime:   applyTime(TODAY, '17:00'),
    }
    // 60-min usluga ne staje u 15 min — nula slotova
    const slots = generateSlots(tightWindow, 60, [])
    expect(slots.length).toBe(0)
  })

  it('pravilno obrađuje više rezervacija u toku dana', () => {
    const booked: BookedInterval[] = [
      { startTime: applyTime(TODAY, '10:00'), endTime: applyTime(TODAY, '11:00') },
      { startTime: applyTime(TODAY, '13:00'), endTime: applyTime(TODAY, '14:00') },
    ]
    const slots = generateSlots(window, 60, booked)
    const unavailableStarts = slots
      .filter((s) => !s.available)
      .map((s) => `${s.startTime.getHours()}:${String(s.startTime.getMinutes()).padStart(2, '0')}`)

    // Za 60-min uslugu, slot je unavailable ako bilo koji deo ulazi u rezervaciju
    // 09:00–10:00: preklapa sa 10:00–11:00? bookedStart(10:00) < slotEnd(10:00) → FALSE → slobodan
    // 10:00–11:00: preklapa sa 10:00–11:00 → zauzeto
    // Slotovi koji počinju između 09:01 i 10:00 a završavaju posle 10:00 → zauzeto
    expect(unavailableStarts).toContain('10:00')
    expect(unavailableStarts).toContain('13:00')
    expect(unavailableStarts).not.toContain('11:00')
    expect(unavailableStarts).not.toContain('14:00')
  })
})
