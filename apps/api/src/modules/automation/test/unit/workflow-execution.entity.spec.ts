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
    const execution = WorkflowExecution.start({ ...startProps, initialContext })
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
    expect(advanced.resumeToken).toBeNull()
  })

  it('persists a delay identity and resumes at the next step', () => {
    const execution = WorkflowExecution.start(startProps)
    const resumeAt = new Date(Date.now() + 60_000)
    const waiting = execution.waitForDelay('step_delay', resumeAt, 'resume-token-1')
    expect(waiting.status).toBe('WAITING_DELAY')
    expect(waiting.currentStepId).toBe('step_delay')
    expect(waiting.resumeAt).toEqual(resumeAt)
    expect(waiting.resumeToken).toBe('resume-token-1')

    const resumed = waiting.resumeFromDelay('step_after_delay')
    expect(resumed.status).toBe('RUNNING')
    expect(resumed.currentStepId).toBe('step_after_delay')
    expect(resumed.resumeAt).toBeNull()
    expect(resumed.resumeToken).toBe('resume-token-1')
  })

  it('allows retrying a failed scheduled execution with the same resume token', () => {
    const waiting = WorkflowExecution.start(startProps).waitForDelay(
      'step_delay',
      new Date(Date.now() + 60_000),
      'resume-token-2',
    )
    const failed = waiting.resumeFromDelay('step_after_delay').fail('temporary failure')
    const retried = failed.retry()
    expect(retried.status).toBe('RUNNING')
    expect(retried.currentStepId).toBe('step_after_delay')
    expect(retried.resumeToken).toBe('resume-token-2')
  })

  it('rejects waiting without a future date and retrying a non-scheduled failure', () => {
    const execution = WorkflowExecution.start(startProps)
    expect(() => execution.waitForDelay('step_delay', new Date(Date.now() - 1))).toThrow()
    expect(() => execution.fail('failure').retry()).toThrow()
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
