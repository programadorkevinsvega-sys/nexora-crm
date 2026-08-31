import { WebForm } from '../entities/web-form.entity'

export interface WebFormSubmissionRecord {
  id: string
  tenantId: string
  formId: string
  contactId: string | null
  payloadJson: Record<string, any>
  ipAddress: string | null
  userAgent: string | null
  submittedAt: Date
}

export abstract class WebFormsRepository {
  abstract list(tenantId: string): Promise<WebForm[]>
  abstract findById(tenantId: string, id: string): Promise<WebForm | null>
  abstract findBySlugOrId(idOrSlug: string): Promise<WebForm | null>
  abstract save(form: WebForm): Promise<void>
  abstract update(form: Partial<WebForm> & { id: string; tenantId: string }): Promise<WebForm>
  abstract delete(tenantId: string, id: string): Promise<void>
  abstract incrementSubmissionsCount(formId: string): Promise<void>
  abstract saveSubmission(submission: WebFormSubmissionRecord): Promise<void>
  abstract listSubmissions(tenantId: string, formId: string): Promise<WebFormSubmissionRecord[]>
}
