import { Injectable, NotFoundException } from '@nestjs/common'
import { WebFormsRepository } from '../../domain/repositories/web-forms.repository'
import { WebForm } from '../../domain/entities/web-form.entity'

@Injectable()
export class UpdateWebFormUseCase {
  constructor(private readonly repo: WebFormsRepository) {}

  async execute(dto: Partial<WebForm> & { id: string; tenantId: string }): Promise<WebForm> {
    const existing = await this.repo.findById(dto.tenantId, dto.id)
    if (!existing) throw new NotFoundException(`Form ${dto.id} not found`)

    const slug = dto.slug ? dto.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-') : undefined
    return this.repo.update({
      ...dto,
      slug,
    })
  }
}
