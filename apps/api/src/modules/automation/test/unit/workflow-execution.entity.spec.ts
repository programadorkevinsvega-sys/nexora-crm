import { WorkflowExecution } from '../../domain/entities/workflow-execution.entity'

describe('WorkflowExecution Entity', () => {
  const startProps = {
    tenantId: '00000000-0000-0000-0000-000000000001',
    workflowId: 'wf-1',
    version: 1,
    entityType: 'contact',
    entityId: 'contact-1',
    initialStepId: 'step_1',
    initialContext: { leadScore: 85, country: 'Colombia' },
  }

  it('should initialize an execution in RUNNING status', () => {
    const execution = WorkflowExecution.start(startProps)

    expect(execution.id).toBeDefined()
    expect(execution.status).toBe('RUNNING')
    expect(execution.currentStepId).toBe('step_1')
    expect(execution.contextData?.leadScore).toBe(85)
    expect(execution.startedAt).toBeDefined()
    expect(execution.completedAt).toBeNull()
  })

  it('should advance to next step correctly', () => {
    const execution = WorkflowExecution.start(startProps)
    const advanced = execution.advanceTo('step_2', { leadScore: 85, whatsappSent: true })

    expect(advanced.currentStepId).toBe('step_2')
    expect(advanced.status).toBe('RUNNING')
    expect(advanced.contextData?.whatsappSent).toBe(true)
  })

  it('should transition to WAITING_DELAY on delay step', () => {
    const execution = WorkflowExecution.start(startProps)
    const delayed = execution.waitForDelay('step_delay_24h')

    expect(delayed.status).toBe('WAITING_DELAY')
    expect(delayed.currentStepId).toBe('step_delay_24h')
  })

  it('should complete, cancel, or fail with appropriate timestamps', () => {
    const execution = WorkflowExecution.start(startProps)

    const completed = execution.complete()
    expect(completed.status).toBe('COMPLETED')
    expect(completed.completedAt).toBeDefined()

    const cancelled = execution.cancel('Customer converted early')
    expect(cancelled.status).toBe('CANCELLED')
    expect(cancelled.cancelledAt).toBeDefined()
    expect(cancelled.errorMessage).toBe('Customer converted early')

    const failed = execution.fail('API timeout on webhook')
    expect(failed.status).toBe('FAILED')
    expect(failed.errorMessage).toBe('API timeout on webhook')
  })
})
