import { Module } from '@nestjs/common'
import { Customer360Controller } from './customer-360.controller'
import { Customer360GrpcController } from '../grpc/customer-360-grpc.controller'
import { GetCustomer360Handler } from '../../application/queries/customer-360.handlers'
import { Customer360Repository } from '../../domain/repositories/customer-360.repository'
import { DrizzleCustomer360Repository } from '../../infrastructure/drizzle-customer-360.repository'

@Module({
  controllers: [Customer360Controller, Customer360GrpcController],
  providers: [
    GetCustomer360Handler,
    {
      provide: Customer360Repository,
      useClass: DrizzleCustomer360Repository,
    },
  ],
  exports: [Customer360Repository, GetCustomer360Handler],
})
export class Customer360Module {}
