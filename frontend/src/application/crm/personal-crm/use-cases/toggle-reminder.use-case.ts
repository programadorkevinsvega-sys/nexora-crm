import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ReminderRepository } from "@/src/domain/crm/personal-crm/reminder.repository"
import type { Reminder } from "@/src/domain/crm/personal-crm/reminder.entity"

export class ToggleReminderUseCase {
  constructor(private repository: ReminderRepository) {}

  async execute(id: string): Promise<Result<Reminder>> {
    try {
      const reminder = await this.repository.toggle(id)
      return success(reminder)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
