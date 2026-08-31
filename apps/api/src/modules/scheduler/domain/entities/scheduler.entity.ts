import { randomUUID } from 'crypto'

export class ScheduledTask {
  constructor(
    readonly id: string, readonly tenantId: string | null,
    readonly name: string, readonly description: string | null,
    readonly cronExpression: string, readonly taskType: string,
    readonly targetService: string | null, readonly targetEndpoint: string | null,
    readonly targetPayload: Record<string, unknown> | null,
    readonly enabled: boolean, readonly maxRetries: number,
    readonly timeoutSeconds: number | null, readonly createdByUserId: string | null,
    readonly lastRunAt: Date | null, readonly nextRunAt: Date | null,
    readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    tenantId?: string; name: string; description?: string; cronExpression: string
    taskType: string; targetService?: string; targetEndpoint?: string
    targetPayload?: Record<string, unknown>; enabled?: boolean
    maxRetries?: number; timeoutSeconds?: number; createdByUserId?: string
  }): ScheduledTask {
    return new ScheduledTask(randomUUID(), props.tenantId ?? null, props.name,
      props.description ?? null, props.cronExpression, props.taskType,
      props.targetService ?? null, props.targetEndpoint ?? null,
      props.targetPayload ?? null, props.enabled ?? true, props.maxRetries ?? 3,
      props.timeoutSeconds ?? null, props.createdByUserId ?? null,
      null, null, new Date(), new Date())
  }
}

export class TaskExecution {
  constructor(
    readonly id: string, readonly taskId: string, readonly tenantId: string | null,
    readonly status: string, readonly startedAt: Date,
    readonly finishedAt: Date | null, readonly resultPayload: Record<string, unknown> | null,
    readonly errorMessage: string | null, readonly attemptNumber: number,
  ) {}
}

export class Reminder {
  constructor(
    readonly id: string, readonly tenantId: string | null,
    readonly userId: string, readonly title: string, readonly description: string | null,
    readonly entityType: string | null, readonly entityId: string | null,
    readonly remindAt: Date, readonly reminded: boolean, readonly notified: boolean,
    readonly repeatInterval: string | null, readonly repeatCount: number | null,
    readonly repeatRemaining: number | null, readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    tenantId?: string; userId: string; title: string; description?: string
    entityType?: string; entityId?: string; remindAt: Date
    repeatInterval?: string; repeatCount?: number
  }): Reminder {
    return new Reminder(randomUUID(), props.tenantId ?? null, props.userId,
      props.title, props.description ?? null, props.entityType ?? null,
      props.entityId ?? null, props.remindAt, false, false,
      props.repeatInterval ?? null, props.repeatCount ?? null, props.repeatCount ?? null,
      new Date(), new Date())
  }
}

export class SlaConfig {
  constructor(
    readonly id: string, readonly tenantId: string,
    readonly name: string, readonly entityType: string,
    readonly conditionField: string | null, readonly conditionOperator: string | null,
    readonly conditionValue: string | null,
    readonly responseTimeMinutes: number, readonly resolutionTimeMinutes: number | null,
    readonly escalationUserId: string | null, readonly escalationEmail: string | null,
    readonly enabled: boolean, readonly createdAt: Date, readonly updatedAt: Date,
  ) {}
  static create(props: {
    tenantId: string; name: string; entityType: string
    conditionField?: string; conditionOperator?: string; conditionValue?: string
    responseTimeMinutes: number; resolutionTimeMinutes?: number
    escalationUserId?: string; escalationEmail?: string; enabled?: boolean
  }): SlaConfig {
    return new SlaConfig(randomUUID(), props.tenantId, props.name, props.entityType,
      props.conditionField ?? null, props.conditionOperator ?? null,
      props.conditionValue ?? null, props.responseTimeMinutes,
      props.resolutionTimeMinutes ?? null, props.escalationUserId ?? null,
      props.escalationEmail ?? null, props.enabled ?? true, new Date(), new Date())
  }
}

export class SlaViolation {
  constructor(
    readonly id: string, readonly slaConfigId: string, readonly tenantId: string,
    readonly entityType: string, readonly entityId: string,
    readonly violationType: string, readonly detectedAt: Date,
    readonly respondedAt: Date | null, readonly resolvedAt: Date | null,
    readonly escalatedAt: Date | null, readonly status: string,
    readonly notes: string | null,
  ) {}
}
