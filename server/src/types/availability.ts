export interface TimeSlot {
  startTime: Date
  endTime: Date
  available: boolean
}

export interface BookedInterval {
  startTime: Date
  endTime: Date
}

export interface WorkingWindow {
  startTime: Date  // konkretni datum + sat početka radnog vremena
  endTime: Date    // konkretni datum + sat kraja radnog vremena
}

export interface AvailabilityQuery {
  employeeId: string
  serviceId: string
  date: Date       // samo datum, vreme se ignoriše
}

export interface AvailabilityResult {
  employeeId: string
  serviceId: string
  date: string        // "YYYY-MM-DD"
  durationMin: number
  slots: TimeSlot[]
}
