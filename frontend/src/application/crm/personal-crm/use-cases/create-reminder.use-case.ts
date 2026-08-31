import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ReminderRepository } from "@/src/domain/crm/personal-crm/reminder.repository"
import type { Reminder, ReminderCreateInput } from "@/src/domain/crm/personal-crm/reminder.entity"

export class CreateReminderUseCase {
  constructor(private repository: ReminderRepository) {}

  async execute(data: ReminderCreateInput): Promise<Result<Reminder>> {
    try {
      const reminder = await this.repository.create(data)
      return success(reminder)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
