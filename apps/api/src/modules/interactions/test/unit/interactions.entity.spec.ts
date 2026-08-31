import { Note } from '../../domain/entities/note.entity'
import { Task } from '../../domain/entities/task.entity'
import { Call } from '../../domain/entities/call.entity'

describe('Interactions Domain Entities', () => {
  describe('Note Entity', () => {
    it('should create and update note content linked to contact or deal', () => {
      const note = Note.create({
        tenantId: 'tenant-1',
        content: 'Customer requested follow up on Monday',
        authorUserId: 'rep-1',
        contactId: 'contact-1',
      })

      expect(note.id).toBeDefined()
      expect(note.content).toBe('Customer requested follow up on Monday')

      const updated = note.update({ content: 'Customer rescheduled for Wednesday' })
      expect(updated.content).toBe('Customer rescheduled for Wednesday')
      expect(note.content).toBe('Customer requested follow up on Monday') // immutability
    })
  })

  describe('Task Entity', () => {
    it('should create task with pending status and toggle completion', () => {
      const dueDate = new Date('2026-10-15T09:00:00Z')
      const task = Task.create({
        tenantId: 'tenant-1',
        title: 'Send Revised Contract',
        dueDate,
        assignedUserId: 'rep-1',
      })

      expect(task.isCompleted).toBe(false)
      expect(task.dueDate).toEqual(dueDate)

      const completed = task.update({ isCompleted: true })
      expect(completed.isCompleted).toBe(true)
    })
  })

  describe('Call Entity', () => {
    it('should record phone call metadata and duration', () => {
      const call = Call.create({
        tenantId: 'tenant-1',
        contactId: 'contact-1',
        callType: 'INBOUND',
        durationSeconds: 320,
        summary: 'Demo walkthrough completed successfully',
        happenedAt: new Date(),
        authorUserId: 'rep-1',
      })

      expect(call.callType).toBe('INBOUND')
      expect(call.durationSeconds).toBe(320)
    })
  })
})
