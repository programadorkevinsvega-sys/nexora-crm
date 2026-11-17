import { Module } from '@nestjs/common'
import { AutomationController } from './automation.controller'
import { AutomationGrpcController } from '../grpc/automation-grpc.controller'
import {
  CreateWorkflowHandler,
  ActivateWorkflowHandler,
  PauseWorkflowHandler,
  CreateWorkflowVersionHandler,
  TriggerEventHandler,
  CancelExecutionHandler,
} from '../../application/commands/workflow.handlers'
import {
  GetWorkflowHandler,
  ListWorkflowsHandler,
  GetWorkflowExecutionHandler,
  ListWorkflowExecutionsHandler,
} from '../../application/queries/workflow.handlers'
import { WorkflowEngineService } from '../../application/services/workflow-engine.service'
import { WorkflowDefinitionRepository } from '../../domain/repositories/workflow-definition.repository'
import { WorkflowExecutionRepository } from '../../domain/repositories/workflow-execution.repository'
import { DrizzleWorkflowDefinitionRepository } from '../../infrastructure/drizzle-workflow-definition.repository'
import { DrizzleWorkflowExecutionRepository } from '../../infrastructure/drizzle-workflow-execution.repository'
import { AutomationConsumerService } from '../../infrastructure/automation-consumer.service'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [AutomationController, AutomationGrpcController],
  providers: [
    CreateWorkflowHandler,
    ActivateWorkflowHandler,
    PauseWorkflowHandler,
    CreateWorkflowVersionHandler,
    TriggerEventHandler,
    CancelExecutionHandler,
    GetWorkflowHandler,
    ListWorkflowsHandler,
    GetWorkflowExecutionHandler,
    ListWorkflowExecutionsHandler,
    WorkflowEngineService,
    AutomationConsumerService,
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
  exports: [
    WorkflowDefinitionRepository,
    WorkflowExecutionRepository,
    TriggerEventHandler,
  ],
})
export class AutomationModule {}
