import { GiftDirection, GiftStatus } from '../../domain/entities/contact-gift.entity'
import { DebtDirection, DebtStatus } from '../../domain/entities/contact-debt.entity'
import { FrequencyType } from '../../domain/entities/contact-reminder.entity'

export class CreateLifeEventCommand {
  constructor(
    readonly tenantId: string,
    readonly contactId: string,
    readonly eventType: string,
    readonly name: string,
    readonly description?: string,
    readonly happenedAt?: string,
    readonly isYearlyRecurring?: boolean,
  ) {}
}

export class CreateGiftCommand {
  constructor(
    readonly tenantId: string,
    readonly contactId: string,
    readonly direction: GiftDirection,
    readonly name: string,
    readonly description?: string,
    readonly url?: string,
    readonly estimatedValue?: number,
    readonly status?: GiftStatus,
    readonly dateGivenOrReceived?: string,
  ) {}
}

export class CreateDebtCommand {
  constructor(
    readonly tenantId: string,
    readonly contactId: string,
    readonly direction: DebtDirection,
    readonly amount: number,
    readonly reason: string,
    readonly status?: DebtStatus,
    readonly dueDate?: string,
  ) {}
}

export class SettleDebtCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class CreateReminderCommand {
  constructor(
    readonly tenantId: string,
    readonly contactId: string,
    readonly title: string,
    readonly description?: string,
    readonly frequencyType?: FrequencyType,
    readonly frequencyInterval?: number,
    readonly nextDueDate?: string,
    readonly isActive?: boolean,
  ) {}
}

export class ToggleReminderCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class AddPetCommand {
  constructor(
    readonly tenantId: string,
    readonly contactId: string,
    readonly petCategory: string,
    readonly name: string,
    readonly breed?: string,
  ) {}
}
