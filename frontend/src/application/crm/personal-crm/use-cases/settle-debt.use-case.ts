import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { DebtRepository } from "@/src/domain/crm/personal-crm/debt.repository"
import type { Debt } from "@/src/domain/crm/personal-crm/debt.entity"

export class SettleDebtUseCase {
  constructor(private repository: DebtRepository) {}

  async execute(id: string): Promise<Result<Debt>> {
    try {
      const debt = await this.repository.settle(id)
      return success(debt)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
