import { Injectable } from '@nestjs/common'
import { AffiliateProgramRepository } from '../../domain/repositories/affiliate-program.repository'
import { AffiliateRepository } from '../../domain/repositories/affiliate.repository'
import { CommissionRepository } from '../../domain/repositories/commission.repository'
import { NotFoundError, ConflictError } from '@crm/shared'
import {
  GetProgramQuery,
  ListProgramsQuery,
  GetAffiliateQuery,
  ListAffiliatesQuery,
  GetCommissionsQuery,
  GetPayoutsQuery,
} from './affiliate.queries'

@Injectable()
export class GetProgramHandler {
  constructor(private readonly repo: AffiliateProgramRepository) {}

  async execute(query: GetProgramQuery) {
    const program = await this.repo.findById(query.tenantId, query.id)
    if (!program) throw new NotFoundError('Affiliate Program', query.id)
    return program
  }
}

@Injectable()
export class ListProgramsHandler {
  constructor(private readonly repo: AffiliateProgramRepository) {}

  async execute(query: ListProgramsQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}

@Injectable()
export class GetAffiliateHandler {
  constructor(private readonly repo: AffiliateRepository) {}

  async execute(query: GetAffiliateQuery) {
    const affiliate = await this.repo.findById(query.tenantId, query.id)
    if (!affiliate) throw new NotFoundError('Affiliate', query.id)
    return affiliate
  }
}

@Injectable()
export class ListAffiliatesHandler {
  constructor(private readonly repo: AffiliateRepository) {}

  async execute(query: ListAffiliatesQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}

@Injectable()
export class GetCommissionsHandler {
  constructor(private readonly repo: CommissionRepository) {}

  async execute(query: GetCommissionsQuery) {
    return this.repo.listCommissions(query.tenantId, query.filter)
  }
}

@Injectable()
export class GetPayoutsHandler {
  constructor(private readonly repo: CommissionRepository) {}

  async execute(query: GetPayoutsQuery) {
    return this.repo.listPayouts(query.tenantId, query.filter)
  }
}
