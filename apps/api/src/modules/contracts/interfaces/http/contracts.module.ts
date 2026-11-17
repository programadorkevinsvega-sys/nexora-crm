import { Module } from '@nestjs/common'
import { ContractsController } from './contracts.controller'
import { ContractsGrpcController } from '../grpc/contracts-grpc.controller'
import { CreateQuoteHandler, SendQuoteHandler, AcceptQuoteHandler, RejectQuoteHandler } from '../../application/commands/quote.handlers'
import { CreateContractHandler, UpdateContractHandler, RenewContractHandler, UpdateContractStatusHandler } from '../../application/commands/contract.handlers'
import { GetQuoteHandler, ListQuotesHandler } from '../../application/queries/quote.handlers'
import { GetContractHandler, ListContractsHandler } from '../../application/queries/contract.handlers'
import { QuoteRepository } from '../../domain/repositories/quote.repository'
import { ContractRepository } from '../../domain/repositories/contract.repository'
import { DrizzleQuoteRepository } from '../../infrastructure/drizzle-quote.repository'
import { DrizzleContractRepository } from '../../infrastructure/drizzle-contract.repository'
import { ContractsConsumerService } from '../../infrastructure/contracts-consumer.service'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [ContractsController, ContractsGrpcController],
  providers: [
    CreateQuoteHandler,
    SendQuoteHandler,
    AcceptQuoteHandler,
    RejectQuoteHandler,
    CreateContractHandler,
    UpdateContractHandler,
    RenewContractHandler,
    UpdateContractStatusHandler,
    GetQuoteHandler,
    ListQuotesHandler,
    GetContractHandler,
    ListContractsHandler,
    ContractsConsumerService,
    OutboxService,
    { provide: QuoteRepository, useClass: DrizzleQuoteRepository },
    { provide: ContractRepository, useClass: DrizzleContractRepository },
  ],
  exports: [QuoteRepository, ContractRepository],
})
export class ContractsModule {}
