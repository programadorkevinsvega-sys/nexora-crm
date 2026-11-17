import { Module } from '@nestjs/common'
import { AuditBffController } from './audit.bff.controller'
import { AuditBffService } from './audit.bff.service'

@Module({
  controllers: [AuditBffController],
  providers: [AuditBffService],
  exports: [AuditBffService],
})
export class AuditBffModule {}
