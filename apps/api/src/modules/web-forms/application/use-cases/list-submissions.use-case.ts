import { Injectable } from '@nestjs/common'
import { WebFormsRepository, WebFormSubmissionRecord } from '../../domain/repositories/web-forms.repository'

@Injectable()
export class ListSubmissionsUseCase {
  constructor(private readonly repo: WebFormsRepository) {}

  async execute(tenantId: string, formId: string): Promise<WebFormSubmissionRecord[]> {
    return this.repo.listSubmissions(tenantId, formId)
  }
}
