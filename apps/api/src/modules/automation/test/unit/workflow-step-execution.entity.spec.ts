import { WorkflowStepExecution } from '../../domain/entities/workflow-step-execution.entity'

describe('WorkflowStepExecution Entity', () => {
  const props = {
    tenantId: '00000000-0000-0000-0000-000000000001',
    executionId: '11111111-1111-4111-8111-111111111111',
    stepId: 'send-welcome-email',
  }

  it('derives a stable idempotency key from execution, step, and attempt', () => {
    const step = WorkflowStepExecution.create(props)

    expect(step.attempts).toBe(1)
    expect(step.idempotencyKey).toBe(
      '11111111-1111-4111-8111-111111111111_send-welcome-email_1',
    )
    expect(step.status).toBe('PENDING')
  })

  it('uses a distinct idempotency key for each positive retry attempt', () => {
    const firstAttempt = WorkflowStepExecution.create({ ...props, attempt: 1 })
    const secondAttempt = WorkflowStepExecution.create({ ...props, attempt: 2 })

    expect(firstAttempt.idempotencyKey).not.toBe(secondAttempt.idempotencyKey)
    expect(secondAttempt.idempotencyKey).toBe(
      '11111111-1111-4111-8111-111111111111_send-welcome-email_2',
    )
  })

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid attempt number %s',
    (attempt) => {
      expect(() => WorkflowStepExecution.create({ ...props, attempt })).toThrow(
        'Workflow step attempt must be a positive safe integer',
      )
    },
  )

  it('keeps recorded step output as an isolated frozen snapshot', () => {
    const output = { delivery: { provider: 'smtp' } }
    const step = WorkflowStepExecution.create(props).markSuccess(output)

    output.delivery.provider = 'other-provider'

    expect(step.outputData?.delivery).toEqual({ provider: 'smtp' })
    expect(Object.isFrozen(step.outputData)).toBe(true)
    expect(Object.isFrozen(step.outputData?.delivery)).toBe(true)
  })
})
