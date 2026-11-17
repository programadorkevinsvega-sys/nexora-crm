import { Module, OnModuleInit } from '@nestjs/common'
import { OutboxModule } from '../../../common/outbox/outbox.module'
import { SchedulerGrpcController } from './grpc/scheduler-grpc.controller'
import {
  CreateTaskHandler, UpdateTaskHandler, DeleteTaskHandler, ExecuteTaskHandler,
  ListTasksHandler, GetTaskHandler, ListExecutionsHandler,
  CreateReminderHandler, UpdateReminderHandler, DeleteReminderHandler,
  ListRemindersHandler, GetReminderHandler,
  CreateSlaConfigHandler, UpdateSlaConfigHandler, DeleteSlaConfigHandler,
  ListSlaConfigsHandler, CheckSlaViolationsHandler, ListSlaViolationsHandler, ResolveSlaViolationHandler,
  ProcessDueTasksHandler, ProcessDueRemindersHandler,
} from '../application/handlers'
import { SchedulerRepository } from '../domain/repositories/scheduler.repository'
import { DrizzleSchedulerRepository } from '../infrastructure/drizzle-scheduler.repository'

@Module({
  imports: [OutboxModule],
  controllers: [SchedulerGrpcController],
  providers: [
    CreateTaskHandler, UpdateTaskHandler, DeleteTaskHandler, ExecuteTaskHandler,
    ListTasksHandler, GetTaskHandler, ListExecutionsHandler,
    CreateReminderHandler, UpdateReminderHandler, DeleteReminderHandler,
    ListRemindersHandler, GetReminderHandler,
    CreateSlaConfigHandler, UpdateSlaConfigHandler, DeleteSlaConfigHandler,
    ListSlaConfigsHandler, CheckSlaViolationsHandler, ListSlaViolationsHandler, ResolveSlaViolationHandler,
    ProcessDueTasksHandler, ProcessDueRemindersHandler,
    { provide: SchedulerRepository, useClass: DrizzleSchedulerRepository },
  ],
})
export class SchedulerDomainModule implements OnModuleInit {
  constructor(
    private readonly processDueTasks: ProcessDueTasksHandler,
    private readonly processDueReminders: ProcessDueRemindersHandler,
  ) {}
  async onModuleInit(): Promise<void> {
    setInterval(() => { this.processDueTasks.execute().catch(() => {}) }, 60000)
    setInterval(() => { this.processDueReminders.execute().catch(() => {}) }, 30000)
  }
}
