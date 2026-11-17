import { Module } from '@nestjs/common'
import { MetaLeadsGrpcController } from './interfaces/grpc/meta-leads-grpc.controller'
import { MetaLeadsRepository } from './domain/repositories/meta-leads.repository'
import { DrizzleMetaLeadsRepository } from './infrastructure/persistence/drizzle/drizzle-meta-leads.repository'
import { GetMetaStatusUseCase } from './application/use-cases/get-meta-status.use-case'
import { ConnectMetaPageUseCase } from './application/use-cases/connect-meta-page.use-case'
import { UpdateMetaConfigUseCase } from './application/use-cases/update-meta-config.use-case'
import { DisconnectMetaUseCase } from './application/use-cases/disconnect-meta.use-case'
import { ListMetaLogsUseCase } from './application/use-cases/list-meta-logs.use-case'
import { SaveMetaLeadLogUseCase } from './application/use-cases/save-meta-lead-log.use-case'

@Module({
  controllers: [MetaLeadsGrpcController],
  providers: [
    { provide: MetaLeadsRepository, useClass: DrizzleMetaLeadsRepository },
    GetMetaStatusUseCase,
    ConnectMetaPageUseCase,
    UpdateMetaConfigUseCase,
    DisconnectMetaUseCase,
    ListMetaLogsUseCase,
    SaveMetaLeadLogUseCase,
  ],
  exports: [
    GetMetaStatusUseCase,
    ConnectMetaPageUseCase,
    UpdateMetaConfigUseCase,
    DisconnectMetaUseCase,
    ListMetaLogsUseCase,
    SaveMetaLeadLogUseCase,
  ],
})
export class MetaLeadsModule {}
