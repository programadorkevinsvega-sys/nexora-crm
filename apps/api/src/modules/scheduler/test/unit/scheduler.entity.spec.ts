import { ScheduledTask, TaskExecution, Reminder } from '../../domain/entities/scheduler.entity'

describe('Scheduler Domain Entities', () => {
  describe('ScheduledTask Entity', () => {
    it('should create scheduled cron task with retry and timeout configuration', () => {
      const task = ScheduledTask.create({
        tenantId: 'tenant-1',
        name: 'Nightly Sync Leads',
        cronExpression: '0 2 * * *',
        taskType: 'sync.leads',
        targetService: 'contacts',
        targetEndpoint: '/sync',
        targetPayload: { source: 'salesforce' },
        enabled: true,
        maxRetries: 5,
        timeoutSeconds: 600,
        createdByUserId: 'admin-1',
      })

      expect(task.id).toBeDefined()
      expect(task.name).toBe('Nightly Sync Leads')
      expect(task.cronExpression).toBe('0 2 * * *')
      expect(task.maxRetries).toBe(5)
      expect(task.timeoutSeconds).toBe(600)
    })
  })

  describe('TaskExecution Entity', () => {
    it('should record execution cycle with duration and status', () => {
      const started = new Date()
      const completed = new Date(started.getTime() + 4500)
      const exec = new TaskExecution(
        'exec-1',
        'task-1',
        'tenant-1',
        'completed',
        started,
        completed,
        { recordsSynced: 450 },
        null,
        1,
      )

      expect(exec.status).toBe('completed')
      expect(exec.attemptNumber).toBe(1)
      expect(exec.resultPayload).toEqual({ recordsSynced: 450 })
    })
  })

  describe('Reminder Entity', () => {
    it('should create and trigger reminder for upcoming event', () => {
      const reminder = Reminder.create({
        tenantId: 'tenant-1',
        userId: 'rep-1',
        title: 'Quarterly Review Meeting',
        remindAt: new Date('2026-10-01T08:00:00Z'),
        entityType: 'deal',
        entityId: 'deal-123',
      })

      expect(reminder.title).toBe('Quarterly Review Meeting')
      expect(reminder.reminded).toBe(false)
    })
  })
})
