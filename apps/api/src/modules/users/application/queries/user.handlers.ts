import { Injectable } from '@nestjs/common'
import { NotFoundError } from '@crm/shared'
import { UserRepository } from '../../domain/repositories/user.repository'
import { GetUserQuery, FindByEmailQuery, ListUsersQuery, GetProfileQuery, ListOAuthLinksQuery, ListDevicesQuery } from './user.queries'

@Injectable()
export class GetUserHandler {
  constructor(private readonly repo: UserRepository) {}

  async execute(query: GetUserQuery) {
    const user = await this.repo.findById(query.tenantId, query.id)
    if (!user) throw new NotFoundError('User', query.id)
    return user
  }
}

@Injectable()
export class FindByEmailHandler {
  constructor(private readonly repo: UserRepository) {}

  async execute(query: FindByEmailQuery) {
    const user = await this.repo.findByEmail(query.tenantId, query.email.toLowerCase().trim())
    if (!user) throw new NotFoundError('User', query.email)
    return user
  }
}

@Injectable()
export class ListUsersHandler {
  constructor(private readonly repo: UserRepository) {}

  async execute(query: ListUsersQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}

@Injectable()
export class GetProfileHandler {
  constructor(private readonly repo: UserRepository) {}

  async execute(query: GetProfileQuery) {
    const user = await this.repo.findById(query.tenantId, query.userId)
    if (!user) throw new NotFoundError('User', query.userId)

    if (user.profileType === 'NATURAL_PERSON') {
      const profile = await this.repo.getNaturalPersonProfile(user.profileId)
      if (!profile) throw new NotFoundError('NaturalPersonProfile', user.profileId)
      return { profileType: 'NATURAL_PERSON' as const, profile }
    }

    const profile = await this.repo.getLegalEntityProfile(user.profileId)
    if (!profile) throw new NotFoundError('LegalEntityProfile', user.profileId)
    return { profileType: 'LEGAL_ENTITY' as const, profile }
  }
}

@Injectable()
export class ListOAuthLinksHandler {
  constructor(private readonly repo: UserRepository) {}

  async execute(query: ListOAuthLinksQuery) {
    return this.repo.listOAuthLinks(query.userId)
  }
}

@Injectable()
export class ListDevicesHandler {
  constructor(private readonly repo: UserRepository) {}

  async execute(query: ListDevicesQuery) {
    return this.repo.listDevices(query.userId)
  }
}
