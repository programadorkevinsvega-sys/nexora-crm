import { Injectable, NotFoundException } from '@nestjs/common'
import { TenantsRepository } from '../../domain/repositories/tenants.repository'
import { TenantLanguage } from '../../domain/entities/config.entity'

export class CreateLanguageCommand {
  constructor(readonly tenantId: string, readonly isoCode: string, readonly name: string, readonly isDefault?: boolean) {}
}

export class UpdateLanguageCommand {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly isoCode?: string,
    readonly name?: string,
    readonly isDefault?: boolean,
    readonly isActive?: boolean,
  ) {}
}

export class DeleteLanguageCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListLanguagesQuery {
  constructor(readonly tenantId: string) {}
}

export class SetDefaultLanguageCommand {
  constructor(readonly tenantId: string, readonly languageId: string) {}
}

@Injectable()
export class CreateLanguageHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: CreateLanguageCommand): Promise<TenantLanguage> {
    const lang = TenantLanguage.create({
      tenantId: cmd.tenantId,
      isoCode: cmd.isoCode,
      name: cmd.name,
      isDefault: cmd.isDefault,
    })
    await this.repo.saveLanguage(lang)
    return lang
  }
}

@Injectable()
export class UpdateLanguageHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: UpdateLanguageCommand): Promise<TenantLanguage> {
    const lang = await this.repo.findLanguageById(cmd.id)
    if (!lang) throw new NotFoundException('Language not found')
    const updated = new TenantLanguage(
      lang.id,
      lang.tenantId,
      cmd.isoCode ?? lang.isoCode,
      cmd.name ?? lang.name,
      cmd.isDefault ?? lang.isDefault,
      cmd.isActive ?? lang.isActive,
      lang.createdAt,
      new Date(),
    )
    await this.repo.saveLanguage(updated)
    return updated
  }
}

@Injectable()
export class DeleteLanguageHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: DeleteLanguageCommand): Promise<void> {
    await this.repo.deleteLanguage(cmd.tenantId, cmd.id)
  }
}

@Injectable()
export class ListLanguagesHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(q: ListLanguagesQuery): Promise<TenantLanguage[]> {
    return this.repo.listLanguages(q.tenantId)
  }
}

@Injectable()
export class SetDefaultLanguageHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: SetDefaultLanguageCommand): Promise<void> {
    await this.repo.setDefaultLanguage(cmd.tenantId, cmd.languageId)
  }
}
