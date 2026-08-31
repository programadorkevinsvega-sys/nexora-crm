import { AuditLog } from '../../domain/entities/audit.entity'

describe('Audit Domain Entity', () => {
  it('should create audit log with complete traceability fields', () => {
    const log = AuditLog.create({
      tenantId: 'tenant-1',
      entityType: 'Deal',
      entityId: 'deal-999',
      action: 'STAGE_CHANGE',
      fieldName: 'stageId',
      oldValue: 'stage-qualification',
      newValue: 'stage-closed-won',
      changedByUserId: 'rep-42',
      moduleName: 'pipelines',
      correlationId: 'req-corr-12345',
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 Chrome/120',
      metadata: { previousAmount: 50000, newAmount: 50000 },
    })

    expect(log.id).toBeDefined()
    expect(log.entityType).toBe('Deal')
    expect(log.action).toBe('STAGE_CHANGE')
    expect(log.oldValue).toBe('stage-qualification')
    expect(log.newValue).toBe('stage-closed-won')
    expect(log.correlationId).toBe('req-corr-12345')
    expect(log.createdAt).toBeInstanceOf(Date)
  })
})
