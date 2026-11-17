import { Module } from '@nestjs/common'
import { QuotesApprovalBffController } from './quotes-approval.bff.controller'
import { QuotesApprovalBffService } from './quotes-approval.bff.service'

@Module({
  controllers: [QuotesApprovalBffController],
  providers: [QuotesApprovalBffService],
  exports: [QuotesApprovalBffService],
})
export class QuotesApprovalBffModule {}
