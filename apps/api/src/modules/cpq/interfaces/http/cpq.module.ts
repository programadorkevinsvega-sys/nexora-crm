import { Module } from '@nestjs/common'
import { CpqController } from './cpq.controller'
import { CpqProductsGrpcController } from '../grpc/cpq-products-grpc.controller'
import { CpqApprovalsSignaturesGrpcController } from '../grpc/cpq-approvals-signatures-grpc.controller'
import {
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
  RequestQuoteApprovalHandler,
  DecideQuoteApprovalHandler,
  InitiateSignatureHandler,
  VerifySignatureOtpHandler,
  SubmitSignatureHandler,
} from '../../application/commands/cpq.handlers'
import {
  CreateProductTemplateHandler,
  DeleteProductTemplateHandler,
} from '../../application/commands/product-template.handlers'
import {
  GetProductHandler,
  ListProductsHandler,
  GetQuoteApprovalHandler,
  ListPendingApprovalsHandler,
  GetSignatureByTokenHandler,
} from '../../application/queries/cpq.handlers'
import { ListProductTemplatesHandler } from '../../application/queries/product-template.handlers'
import {
  ProductRepository,
  QuoteApprovalRepository,
  ESignatureRepository,
} from '../../domain/repositories/cpq.repository'
import { ProductTemplateRepository } from '../../domain/repositories/product-template.repository'
import {
  DrizzleProductRepository,
  DrizzleQuoteApprovalRepository,
  DrizzleESignatureRepository,
} from '../../infrastructure/drizzle-cpq.repository'
import { DrizzleProductTemplateRepository } from '../../infrastructure/drizzle-product-template.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [CpqController, CpqProductsGrpcController, CpqApprovalsSignaturesGrpcController],
  providers: [
    CreateProductHandler,
    UpdateProductHandler,
    DeleteProductHandler,
    CreateProductTemplateHandler,
    DeleteProductTemplateHandler,
    RequestQuoteApprovalHandler,
    DecideQuoteApprovalHandler,
    InitiateSignatureHandler,
    VerifySignatureOtpHandler,
    SubmitSignatureHandler,
    GetProductHandler,
    ListProductsHandler,
    ListProductTemplatesHandler,
    GetQuoteApprovalHandler,
    ListPendingApprovalsHandler,
    GetSignatureByTokenHandler,
    OutboxService,
    {
      provide: ProductRepository,
      useClass: DrizzleProductRepository,
    },
    {
      provide: ProductTemplateRepository,
      useClass: DrizzleProductTemplateRepository,
    },
    {
      provide: QuoteApprovalRepository,
      useClass: DrizzleQuoteApprovalRepository,
    },
    {
      provide: ESignatureRepository,
      useClass: DrizzleESignatureRepository,
    },
  ],
  exports: [
    ProductRepository,
    ProductTemplateRepository,
    QuoteApprovalRepository,
    ESignatureRepository,
    CreateProductHandler,
    InitiateSignatureHandler,
  ],
})
export class CpqModule {}
