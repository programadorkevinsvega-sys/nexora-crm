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


  it('stores an isolated deeply frozen context snapshot', () => {
    const initialContext = { customer: { segment: 'enterprise' } }
    const execution = WorkflowExecution.start({
      ...startProps,
      initialContext,
    })

    initialContext.customer.segment = 'consumer'

    expect(execution.contextData?.customer).toEqual({ segment: 'enterprise' })
    expect(Object.isFrozen(execution.contextData)).toBe(true)
    expect(Object.isFrozen(execution.contextData?.customer)).toBe(true)
  })

  it('requires a positive integer source version', () => {
    expect(() => WorkflowExecution.start({ ...startProps, version: 0 })).toThrow(
      'Workflow execution version must be a positive integer',
    )
    expect(() => WorkflowExecution.start({ ...startProps, version: 1.5 })).toThrow(
      'Workflow execution version must be a positive integer',
    )
  })

  it('should advance to next step correctly', () => {
    const execution = WorkflowExecution.start(startProps)
    const advanced = execution.advanceTo('step_2', { leadScore: 85, whatsappSent: true })

    expect(advanced.currentStepId).toBe('step_2')
    expect(advanced.status).toBe('RUNNING')
    expect(advanced.contextData?.whatsappSent).toBe(true)
  })

  it('persists the delay due time and resumes from the next step', () => {
    const execution = WorkflowExecution.start(startProps)
    const resumeAt = new Date(Date.now() + 60_000)
    const delayed = execution.waitForDelay('step_delay_24h', resumeAt)

    expect(delayed.status).toBe('WAITING_DELAY')
    expect(delayed.currentStepId).toBe('step_delay_24h')
    expect(delayed.resumeAt).toEqual(resumeAt)

    const resumed = delayed.resumeFromDelay('step_2')
    expect(resumed.status).toBe('RUNNING')
    expect(resumed.currentStepId).toBe('step_2')
    expect(resumed.resumeAt).toBeNull()
  })

  it('does not resume an unscheduled legacy WAITING_DELAY execution', () => {
    const execution = WorkflowExecution.start(startProps)
    const legacyWaiting = new WorkflowExecution(
      execution.id,
      execution.tenantId,
      execution.workflowId,
      execution.version,
      execution.entityType,
      execution.entityId,
      'WAITING_DELAY',
      'step_delay_legacy',
      execution.contextData,
      execution.startedAt,
      null,
      null,
      null,
    )

    expect(() => legacyWaiting.resumeFromDelay('step_2')).toThrow(
      'Only a scheduled workflow delay can be resumed',
    )
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
