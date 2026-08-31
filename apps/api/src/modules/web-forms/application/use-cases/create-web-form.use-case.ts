import { Injectable } from '@nestjs/common'
import { WebFormsRepository } from '../../domain/repositories/web-forms.repository'
import { WebForm, FormField } from '../../domain/entities/web-form.entity'

export interface CreateWebFormDto {
  tenantId: string
  name: string
  slug?: string
  title?: string
  description?: string
  fields?: FormField[]
  buttonText?: string
  successMessage?: string
  redirectUrl?: string
  leadSource?: string
  defaultLeadStatus?: string
  defaultTags?: string[]
  assignToUserId?: string
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  borderRadius?: string
  customCss?: string
  isActive?: boolean
}

@Injectable()
export class CreateWebFormUseCase {
  constructor(private readonly repo: WebFormsRepository) {}

  async execute(dto: CreateWebFormDto): Promise<WebForm> {
    const slug = (dto.slug || `form-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-_]/g, '-')
    const form = WebForm.create({
      ...dto,
      slug,
    })
    await this.repo.save(form)
    return form
  }
}
