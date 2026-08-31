import { Module } from '@nestjs/common'
import { InteractionsController } from './interactions.controller'
import { InteractionsGrpcController } from '../../interfaces/grpc/interactions-grpc.controller'
import {
  CreateNoteHandler, UpdateNoteHandler, DeleteNoteHandler,
  CreateTaskHandler, UpdateTaskHandler, DeleteTaskHandler,
  CreateCallHandler,
} from '../../application/commands/interactions.handlers'
import {
  GetNoteHandler, ListNotesHandler,
  GetTaskHandler, ListTasksHandler,
  GetCallHandler, ListCallsHandler,
} from '../../application/queries/interactions.handlers'
import { NoteRepository } from '../../domain/repositories/note.repository'
import { TaskRepository } from '../../domain/repositories/task.repository'
import { CallRepository } from '../../domain/repositories/call.repository'
import { DrizzleNoteRepository } from '../../infrastructure/drizzle-note.repository'
import { DrizzleTaskRepository } from '../../infrastructure/drizzle-task.repository'
import { DrizzleCallRepository } from '../../infrastructure/drizzle-call.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [InteractionsController, InteractionsGrpcController],
  providers: [
    CreateNoteHandler,
    UpdateNoteHandler,
    DeleteNoteHandler,
    CreateTaskHandler,
    UpdateTaskHandler,
    DeleteTaskHandler,
    CreateCallHandler,
    GetNoteHandler,
    ListNotesHandler,
    GetTaskHandler,
    ListTasksHandler,
    GetCallHandler,
    ListCallsHandler,
    OutboxService,
    { provide: NoteRepository, useClass: DrizzleNoteRepository },
    { provide: TaskRepository, useClass: DrizzleTaskRepository },
    { provide: CallRepository, useClass: DrizzleCallRepository },
  ],
  exports: [NoteRepository, TaskRepository, CallRepository],
})
export class InteractionsModule {}
