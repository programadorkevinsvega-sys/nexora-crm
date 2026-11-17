import { z } from 'zod'

export const WorkflowStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'])
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>

export const WorkflowExecutionStatusSchema = z.enum(['RUNNING', 'WAITING_DELAY', 'COMPLETED', 'CANCELLED', 'FAILED'])
export type WorkflowExecutionStatus = z.infer<typeof WorkflowExecutionStatusSchema>

export const WorkflowStepStatusSchema = z.enum(['PENDING', 'EXECUTING', 'SUCCESS', 'FAILED', 'SKIPPED'])
export type WorkflowStepStatus = z.infer<typeof WorkflowStepStatusSchema>

export const StepTypeSchema = z.enum(['ACTION', 'DELAY', 'CONDITION', 'BRANCH', 'WEBHOOK'])
export type StepType = z.infer<typeof StepTypeSchema>

export const WorkflowStepSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  type: StepTypeSchema,
  action: z.string().optional(), // SEND_EMAIL, SEND_WHATSAPP, CREATE_TASK, UPDATE_FIELD
  config: z.record(z.unknown()).optional(),
  duration: z.string().optional(), // e.g. "10m", "24h", "3d"
  condition: z.object({
    field: z.string(),
    operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'IN', 'IS_EMPTY']),
    value: z.unknown(),
  }).optional(),
  nextStepId: z.string().optional(),
  onTrueStepId: z.string().optional(),
  onFalseStepId: z.string().optional(),
})
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>

export const WorkflowDefinitionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  version: z.number().int().positive().default(1),
  status: WorkflowStatusSchema.default('DRAFT'),
  triggerEvent: z.string().min(1).max(150),
  triggerFilter: z.record(z.unknown()).nullable().optional(),
  stepsGraph: z.array(WorkflowStepSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>

export const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  triggerEvent: z.string().min(1).max(150),
  triggerFilter: z.record(z.unknown()).optional(),
  stepsGraph: z.array(WorkflowStepSchema),
})
export type CreateWorkflow = z.infer<typeof CreateWorkflowSchema>

export const UpdateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: WorkflowStatusSchema.optional(),
  triggerEvent: z.string().min(1).max(150).optional(),
  triggerFilter: z.record(z.unknown()).optional(),
  stepsGraph: z.array(WorkflowStepSchema).optional(),
})
export type UpdateWorkflow = z.infer<typeof UpdateWorkflowSchema>

export const WorkflowExecutionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  workflowId: z.string().uuid(),
  version: z.number().int().positive(),
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
  status: WorkflowExecutionStatusSchema,
  currentStepId: z.string().min(1),
  contextData: z.record(z.unknown()).nullable().optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable().optional(),
  cancelledAt: z.string().datetime().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
})
export type WorkflowExecution = z.infer<typeof WorkflowExecutionSchema>

export const WorkflowStepExecutionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  executionId: z.string().uuid(),
  stepId: z.string().min(1),
  idempotencyKey: z.string().min(1),
  status: WorkflowStepStatusSchema,
  attempts: z.number().int().positive().default(1),
  outputData: z.record(z.unknown()).nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable().optional(),
})
export type WorkflowStepExecution = z.infer<typeof WorkflowStepExecutionSchema>
