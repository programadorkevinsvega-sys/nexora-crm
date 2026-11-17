import { SlaPrioritySchema, SlaActionTypeSchema } from '@crm/contracts'

describe('SLA Contracts & Logic', () => {
  it('should validate SLA priority levels', () => {
    expect(SlaPrioritySchema.parse('CRITICAL')).toBe('CRITICAL')
    expect(SlaPrioritySchema.parse('HIGH')).toBe('HIGH')
    expect(SlaPrioritySchema.parse('MEDIUM')).toBe('MEDIUM')
    expect(SlaPrioritySchema.parse('LOW')).toBe('LOW')
  })

  it('should validate escalation action types', () => {
    expect(SlaActionTypeSchema.parse('NOTIFY_MANAGER')).toBe('NOTIFY_MANAGER')
    expect(SlaActionTypeSchema.parse('REASSIGN_TEAM')).toBe('REASSIGN_TEAM')
    expect(SlaActionTypeSchema.parse('PAGE_ON_CALL')).toBe('PAGE_ON_CALL')
  })
})
