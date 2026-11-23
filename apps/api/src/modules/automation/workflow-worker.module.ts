import { Module } from '@nestjs/common'
import { OutboxService } from '../../common/outbox/outbox.service'
import { WorkflowEngineService } from './application/services/workflow-engine.service'
import { WorkflowDefinitionRepository } from './domain/repositories/workflow-definition.repository'
import { WorkflowExecutionRepository } from './domain/repositories/workflow-execution.repository'
import { DrizzleWorkflowDefinitionRepository } from './infrastructure/drizzle-workflow-definition.repository'
import { DrizzleWorkflowExecutionRepository } from './infrastructure/drizzle-workflow-execution.repository'
import { WorkflowQueueService } from './infrastructure/workflow-queue.service'
import { WorkflowWorkerService } from './infrastructure/workflow-worker.service'

@Module({
  providers: [
    OutboxService,
    WorkflowEngineService,
    WorkflowQueueService,
    WorkflowWorkerService,
    {
      provide: WorkflowDefinitionRepository,
      useClass: DrizzleWorkflowDefinitionRepository,
    },
    {
      provide: WorkflowExecutionRepository,
      useClass: DrizzleWorkflowExecutionRepository,
    },
  ],
})
export class WorkflowWorkerModule {}
