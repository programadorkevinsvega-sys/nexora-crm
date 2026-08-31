import { WorkflowDefinition } from '../../domain/entities/workflow-definition.entity'

describe('WorkflowDefinition Entity', () => {
  const validProps = {
    tenantId: '00000000-0000-0000-0000-000000000001',
    name: 'Lead Welcome Flow',
    description: 'Sends WhatsApp and email to new leads',
    triggerEvent: 'crm.contact.created',
    stepsGraph: [
      { id: 's1', type: 'ACTION' as const, action: 'SEND_WHATSAPP' },
    ],
  }

  it('should initialize workflow in DRAFT status with version 1', () => {
    const workflow = WorkflowDefinition.create(validProps)

    expect(workflow.id).toBeDefined()
    expect(workflow.name).toBe('Lead Welcome Flow')
    expect(workflow.version).toBe(1)
    expect(workflow.status).toBe('DRAFT')
    expect(workflow.triggerEvent).toBe('crm.contact.created')
    expect(workflow.stepsGraph).toHaveLength(1)
  })

  it('should transition status correctly through activate, pause, and archive', () => {
    const workflow = WorkflowDefinition.create(validProps)

    const active = workflow.activate()
    expect(active.status).toBe('ACTIVE')

    const paused = active.pause()
    expect(paused.status).toBe('PAUSED')

    const archived = paused.archive()
    expect(archived.status).toBe('ARCHIVED')
  })

  it('should create an incremented new version in DRAFT status without modifying original', () => {
    const v1 = WorkflowDefinition.create(validProps).activate()
    const v2 = v1.cloneAsNewVersion({ name: 'Lead Welcome Flow v2' })

    expect(v1.version).toBe(1)
    expect(v1.status).toBe('ACTIVE')

    expect(v2.version).toBe(2)
    expect(v2.status).toBe('DRAFT')
    expect(v2.name).toBe('Lead Welcome Flow v2')
    expect(v2.id).not.toBe(v1.id)
  })

  it('should throw error if name or triggerEvent are missing', () => {
    expect(() =>
      WorkflowDefinition.create({ ...validProps, name: '' }),
    ).toThrow('Workflow name is required')

    expect(() =>
      WorkflowDefinition.create({ ...validProps, stepsGraph: [] }),
    ).toThrow('Workflow must contain at least one step in stepsGraph')
  })
})
