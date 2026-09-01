import { Injectable, NotFoundException } from '@nestjs/common'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'
import { NotificationTemplate, ChannelType } from '../domain/entities/notification.entity'

export class CreateTemplateCommand {
  constructor(
    readonly tenantId: string | undefined,
    readonly channelType: ChannelType,
    readonly templateKey: string,
    readonly subjectTemplate: string,
    readonly bodyTemplate: string,
    readonly variables?: string[],
    readonly locale?: string,
  ) {}
}

export class UpdateTemplateCommand {
  constructor(
    readonly id: string,
    readonly subjectTemplate?: string,
    readonly bodyTemplate?: string,
    readonly variables?: string[],
    readonly locale?: string,
  ) {}
}

export class DeleteTemplateCommand {
  constructor(readonly id: string) {}
}

export class ListTemplatesQuery {
  constructor(readonly tenantId?: string) {}
}

export class GetTemplateQuery {
  constructor(readonly id: string) {}
}

export class RenderTemplateQuery {
  constructor(
    readonly templateId: string,
    readonly variables: Record<string, unknown>,
  ) {}
}

@Injectable()
export class CreateTemplateHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(cmd: CreateTemplateCommand): Promise<NotificationTemplate> {
    const template = NotificationTemplate.create({
      tenantId: cmd.tenantId,
      channelType: cmd.channelType,
      templateKey: cmd.templateKey,
      subjectTemplate: cmd.subjectTemplate,
      bodyTemplate: cmd.bodyTemplate,
      variables: cmd.variables,
      locale: cmd.locale,
    })
    await this.repo.saveTemplate(template)
    return template
  }
}

@Injectable()
export class UpdateTemplateHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(cmd: UpdateTemplateCommand): Promise<NotificationTemplate> {
    const template = await this.repo.findTemplateById(cmd.id)
    if (!template) throw new NotFoundException('Template not found')
    const updated = new NotificationTemplate(
      template.id,
      template.tenantId,
      template.channelType,
      template.templateKey,
      cmd.subjectTemplate ?? template.subjectTemplate,
      cmd.bodyTemplate ?? template.bodyTemplate,
      cmd.variables ?? template.variables,
      cmd.locale ?? template.locale,
      template.createdAt,
      new Date(),
    )
    await this.repo.saveTemplate(updated)
    return updated
  }
}

@Injectable()
export class DeleteTemplateHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(cmd: DeleteTemplateCommand): Promise<void> {
    await this.repo.deleteTemplate(cmd.id)
  }
}

@Injectable()
export class ListTemplatesHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(q: ListTemplatesQuery): Promise<NotificationTemplate[]> {
    return this.repo.listTemplates(q.tenantId)
  }
}

@Injectable()
export class GetTemplateHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(q: GetTemplateQuery): Promise<NotificationTemplate> {
    const template = await this.repo.findTemplateById(q.id)
    if (!template) throw new NotFoundException('Template not found')
    return template
  }
}

@Injectable()
export class RenderTemplateHandler {
  constructor(private readonly repo: NotificationsRepository) {}

  async execute(q: RenderTemplateQuery): Promise<{ subject: string; body: string }> {
    const template = await this.repo.findTemplateById(q.templateId)
    if (!template) throw new NotFoundException('Template not found')
    let subject = template.subjectTemplate
    let body = template.bodyTemplate
    for (const [key, value] of Object.entries(q.variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      subject = subject.replace(regex, String(value))
      body = body.replace(regex, String(value))
    }
    return { subject, body }
  }
}
