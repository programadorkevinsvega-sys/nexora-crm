import { Injectable } from '@nestjs/common'
import { WebFormsRepository } from '../../domain/repositories/web-forms.repository'
import { WebForm } from '../../domain/entities/web-form.entity'

@Injectable()
export class ListWebFormsUseCase {
  constructor(private readonly repo: WebFormsRepository) {}

  async execute(tenantId: string): Promise<WebForm[]> {
    return this.repo.list(tenantId)
  }
}
