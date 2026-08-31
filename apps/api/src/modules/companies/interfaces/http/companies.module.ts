import { Module } from '@nestjs/common'
import { CompaniesController } from './companies.controller'
import { CompaniesGrpcController } from '../../interfaces/grpc/companies-grpc.controller'
import { CreateCompanyHandler, UpdateCompanyHandler, DeleteCompanyHandler } from '../../application/commands/company.handlers'
import { GetCompanyHandler, ListCompaniesHandler } from '../../application/queries/company.handlers'
import { CompanyRepository } from '../../domain/repositories/company.repository'
import { DrizzleCompanyRepository } from '../../infrastructure/drizzle-company.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [CompaniesController, CompaniesGrpcController],
  providers: [
    CreateCompanyHandler,
    UpdateCompanyHandler,
    DeleteCompanyHandler,
    GetCompanyHandler,
    ListCompaniesHandler,
    OutboxService,
    { provide: CompanyRepository, useClass: DrizzleCompanyRepository },
  ],
  exports: [CompanyRepository],
})
export class CompaniesModule {}
