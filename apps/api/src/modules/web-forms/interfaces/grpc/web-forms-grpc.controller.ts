import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { ListWebFormsUseCase } from '../../application/use-cases/list-web-forms.use-case'
import { GetWebFormUseCase } from '../../application/use-cases/get-web-form.use-case'
import { CreateWebFormUseCase } from '../../application/use-cases/create-web-form.use-case'
import { UpdateWebFormUseCase } from '../../application/use-cases/update-web-form.use-case'
import { DeleteWebFormUseCase } from '../../application/use-cases/delete-web-form.use-case'
import { SubmitWebFormUseCase } from '../../application/use-cases/submit-web-form.use-case'
import { ListSubmissionsUseCase } from '../../application/use-cases/list-submissions.use-case'

@Controller()
export class WebFormsGrpcController {
  constructor(
    private readonly listWebFormsUseCase: ListWebFormsUseCase,
    private readonly getWebFormUseCase: GetWebFormUseCase,
    private readonly createWebFormUseCase: CreateWebFormUseCase,
    private readonly updateWebFormUseCase: UpdateWebFormUseCase,
    private readonly deleteWebFormUseCase: DeleteWebFormUseCase,
    private readonly submitWebFormUseCase: SubmitWebFormUseCase,
    private readonly listSubmissionsUseCase: ListSubmissionsUseCase,
  ) {}

  @GrpcMethod('WebFormsService', 'ListForms')
  async listForms(data: { tenantId: string }) {
    const forms = await this.listWebFormsUseCase.execute(data.tenantId)
    return {
      jsonItems: forms.map((f) => JSON.stringify(f)),
    }
  }

  @GrpcMethod('WebFormsService', 'GetFormById')
  async getFormById(data: { tenantId: string; id: string }) {
    const form = await this.getWebFormUseCase.executeById(data.tenantId, data.id)
    return { json: JSON.stringify(form) }
  }

  @GrpcMethod('WebFormsService', 'GetPublicForm')
  async getPublicForm(data: { idOrSlug: string }) {
    const form = await this.getWebFormUseCase.executeBySlug(data.idOrSlug)
    return { json: JSON.stringify(form) }
  }

  @GrpcMethod('WebFormsService', 'CreateForm')
  async createForm(data: { jsonInput: string }) {
    const input = JSON.parse(data.jsonInput)
    const form = await this.createWebFormUseCase.execute(input)
    return { json: JSON.stringify(form) }
  }

  @GrpcMethod('WebFormsService', 'UpdateForm')
  async updateForm(data: { jsonInput: string }) {
    const input = JSON.parse(data.jsonInput)
    const form = await this.updateWebFormUseCase.execute(input)
    return { json: JSON.stringify(form) }
  }

  @GrpcMethod('WebFormsService', 'DeleteForm')
  async deleteForm(data: { tenantId: string; id: string }) {
    await this.deleteWebFormUseCase.execute(data.tenantId, data.id)
    return { success: true }
  }

  @GrpcMethod('WebFormsService', 'SubmitPublicForm')
  async submitPublicForm(data: { idOrSlug: string; formDataJson: string; ipAddress?: string; userAgent?: string }) {
    const formData = JSON.parse(data.formDataJson)
    const res = await this.submitWebFormUseCase.execute({
      idOrSlug: data.idOrSlug,
      formData,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('WebFormsService', 'ListSubmissions')
  async listSubmissions(data: { tenantId: string; formId: string }) {
    const submissions = await this.listSubmissionsUseCase.execute(data.tenantId, data.formId)
    return {
      jsonItems: submissions.map((s) => JSON.stringify(s)),
    }
  }
}
