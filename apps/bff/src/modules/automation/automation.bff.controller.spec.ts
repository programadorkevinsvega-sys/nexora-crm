import { AutomationBffController } from './automation.bff.controller'

describe('AutomationBffController - REST Gateway Tests', () => {
  let controller: AutomationBffController
  let mockService: any

  beforeEach(() => {
    mockService = {
      createWorkflow: jest.fn().mockResolvedValue({
        id: 'wf-1',
        name: 'Welcome Lead Flow',
        version: 1,
        status: 'DRAFT',
      }),
      getWorkflow: jest.fn().mockResolvedValue({
        id: 'wf-1',
        name: 'Welcome Lead Flow',
      }),
      listWorkflows: jest.fn().mockResolvedValue([
        { id: 'wf-1', name: 'Welcome Lead Flow' },
      ]),
      activateWorkflow: jest.fn().mockResolvedValue({
        id: 'wf-1',
        status: 'ACTIVE',
      }),
      pauseWorkflow: jest.fn().mockResolvedValue({
        id: 'wf-1',
        status: 'PAUSED',
      }),
      triggerEvent: jest.fn().mockResolvedValue({ triggeredCount: 1 }),
      getExecution: jest.fn().mockResolvedValue({
        execution: { id: 'exec-1', status: 'RUNNING' },
        steps: [],
      }),
      listExecutions: jest.fn().mockResolvedValue([
        { id: 'exec-1', status: 'RUNNING' },
      ]),
      cancelExecution: jest.fn().mockResolvedValue(undefined),
    }

    controller = new AutomationBffController(mockService)
  })

  it('should call createWorkflow on service when POST /api/automation/workflows is executed', async () => {
    const payload = {
      name: 'Welcome Lead Flow',
      triggerEvent: 'crm.contact.created',
      stepsGraph: [{ id: 's1', type: 'ACTION' as const, action: 'SEND_WHATSAPP' }],
    }
    const result = await controller.create(payload, 'tenant-1')

    expect(mockService.createWorkflow).toHaveBeenCalledWith(payload, 'tenant-1')
    expect(result.id).toBe('wf-1')
  })

  it('should call activateWorkflow on service when POST /api/automation/workflows/:id/activate is executed', async () => {
    const result = await controller.activate('00000000-0000-0000-0000-000000000001', 'tenant-1')

    expect(mockService.activateWorkflow).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001', 'tenant-1')
    expect(result.status).toBe('ACTIVE')
  })

  it('should call triggerEvent when POST /api/automation/trigger is executed', async () => {
    const triggerData = {
      eventName: 'crm.contact.created',
      entityType: 'contact',
      entityId: 'contact-123',
      payload: { name: 'Juan Perez' },
    }
    const result = await controller.trigger(triggerData, 'tenant-1')

    expect(mockService.triggerEvent).toHaveBeenCalledWith(triggerData, 'tenant-1')
    expect(result.triggeredCount).toBe(1)
  })
})
