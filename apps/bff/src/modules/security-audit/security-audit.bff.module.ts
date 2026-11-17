import { Module } from '@nestjs/common'
import { SecurityAuditBffController } from './security-audit.bff.controller'
import { SecurityAuditBffService } from './security-audit.bff.service'

@Module({
  controllers: [SecurityAuditBffController],
  providers: [SecurityAuditBffService],
  exports: [SecurityAuditBffService],
})
export class SecurityAuditBffModule {}
