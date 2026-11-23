import { Module } from '@nestjs/common'
import { NatsModule } from '../../../common/nats/nats.module'
import { OutboxService } from '../../../common/outbox/outbox.service'
import { WorkflowEngineService } from '../application/services/workflow-engine.service'
import { WorkflowDefinitionRepository } from '../domain/repositories/workflow-definition.repository'
import { WorkflowExecutionRepository } from '../domain/repositories/workflow-execution.repository'
import { DrizzleWorkflowDefinitionRepository } from './drizzle-workflow-definition.repository'
import { DrizzleWorkflowExecutionRepository } from './drizzle-workflow-execution.repository'
import { WorkflowRuntimeWorker } from './workflow-runtime.worker'

@Module({
  imports: [NatsModule],
  providers: [
    WorkflowRuntimeWorker,
    WorkflowEngineService,
    OutboxService,
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
