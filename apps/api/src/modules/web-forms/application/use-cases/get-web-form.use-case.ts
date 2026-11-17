import { Injectable, NotFoundException } from '@nestjs/common'
import { WebFormsRepository } from '../../domain/repositories/web-forms.repository'
import { WebForm } from '../../domain/entities/web-form.entity'

@Injectable()
export class GetWebFormUseCase {
  constructor(private readonly repo: WebFormsRepository) {}

  async executeById(tenantId: string, id: string): Promise<WebForm> {
    const form = await this.repo.findById(tenantId, id)
    if (!form) throw new NotFoundException(`Form ${id} not found`)
    return form
  }

  async executeBySlug(idOrSlug: string): Promise<WebForm> {
    const form = await this.repo.findBySlugOrId(idOrSlug)
    if (!form) throw new NotFoundException(`Form ${idOrSlug} not found or inactive`)
    return form
  }
}
