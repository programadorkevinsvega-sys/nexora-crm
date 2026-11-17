import { BookingSlotsHelper } from '../booking-slots.helper'

describe('BookingSlotsHelper', () => {
  it('should generate available time slots for a booking link', () => {
    const slots = BookingSlotsHelper.generateSlots({
      id: 'link-1',
      tenantId: 'tenant-1',
      userId: 'user-1',
      slug: 'demo-30min',
      title: 'Demo 30 min',
      durationMinutes: 30,
      locationType: 'GOOGLE_MEET',
      availableDays: [1, 2, 3, 4, 5],
      startHour: '09:00',
      endHour: '12:00',
      bufferMinutes: 15,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    expect(slots.length).toBeGreaterThan(0)
    expect(slots[0]).toHaveProperty('time')
    expect(slots[0]).toHaveProperty('datetime')
    expect(slots[0].available).toBe(true)
  })
})
