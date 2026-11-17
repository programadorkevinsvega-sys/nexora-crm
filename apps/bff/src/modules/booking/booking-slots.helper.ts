import type { BookingLink, AvailableTimeSlot } from '@crm/contracts'

export class BookingSlotsHelper {
  static generateSlots(link: BookingLink): AvailableTimeSlot[] {
    const slots: AvailableTimeSlot[] = []
    const [startH] = link.startHour.split(':').map(Number)
    const [endH] = link.endHour.split(':').map(Number)

    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + dayOffset)
      const dayOfWeek = targetDate.getDay() // 0=Sun, 1=Mon...

      if (!link.availableDays.includes(dayOfWeek)) continue

      for (let h = startH; h < endH; h++) {
        for (const m of [0, 30]) {
          const slotDate = new Date(targetDate)
          slotDate.setHours(h, m, 0, 0)
          const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
          slots.push({
            time: timeStr,
            datetime: slotDate.toISOString(),
            available: true,
          })
        }
      }
    }
    return slots
  }
}
