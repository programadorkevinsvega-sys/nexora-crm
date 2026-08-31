import { Module } from '@nestjs/common'
import { PersonalCrmController } from './personal-crm.controller'
import { PersonalCrmGrpcController } from '../grpc/personal-crm-grpc.controller'
import {
  CreateLifeEventHandler,
  CreateGiftHandler,
  CreateDebtHandler,
  SettleDebtHandler,
  CreateReminderHandler,
  ToggleReminderHandler,
  AddPetHandler,
} from '../../application/commands/personal-crm.handlers'
import {
  ListLifeEventsHandler,
  ListGiftsHandler,
  ListDebtsHandler,
  ListRemindersHandler,
  ListPetsHandler,
} from '../../application/queries/personal-crm.handlers'
import { PersonalCrmRepository } from '../../domain/repositories/personal-crm.repository'
import { DrizzlePersonalCrmRepository } from '../../infrastructure/drizzle-personal-crm.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [PersonalCrmController, PersonalCrmGrpcController],
  providers: [
    CreateLifeEventHandler,
    CreateGiftHandler,
    CreateDebtHandler,
    SettleDebtHandler,
    CreateReminderHandler,
    ToggleReminderHandler,
    AddPetHandler,
    ListLifeEventsHandler,
    ListGiftsHandler,
    ListDebtsHandler,
    ListRemindersHandler,
    ListPetsHandler,
    OutboxService,
    { provide: PersonalCrmRepository, useClass: DrizzlePersonalCrmRepository },
  ],
  exports: [PersonalCrmRepository],
})
export class PersonalCrmModule {}
