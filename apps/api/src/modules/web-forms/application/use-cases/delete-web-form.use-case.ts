import { Injectable, NotFoundException } from '@nestjs/common'
import { WebFormsRepository } from '../../domain/repositories/web-forms.repository'

@Injectable()
export class DeleteWebFormUseCase {
  constructor(private readonly repo: WebFormsRepository) {}

  async execute(tenantId: string, id: string): Promise<void> {
    const existing = await this.repo.findById(tenantId, id)
    if (!existing) throw new NotFoundException(`Form ${id} not found`)
    await this.repo.delete(tenantId, id)
  }
}
