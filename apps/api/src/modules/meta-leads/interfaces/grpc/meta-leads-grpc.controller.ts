import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { GetMetaStatusUseCase } from '../../application/use-cases/get-meta-status.use-case'
import { ConnectMetaPageUseCase } from '../../application/use-cases/connect-meta-page.use-case'
import { UpdateMetaConfigUseCase } from '../../application/use-cases/update-meta-config.use-case'
import { DisconnectMetaUseCase } from '../../application/use-cases/disconnect-meta.use-case'
import { ListMetaLogsUseCase } from '../../application/use-cases/list-meta-logs.use-case'
import { SaveMetaLeadLogUseCase } from '../../application/use-cases/save-meta-lead-log.use-case'

@Controller()
export class MetaLeadsGrpcController {
  constructor(
    private readonly getMetaStatusUseCase: GetMetaStatusUseCase,
    private readonly connectMetaPageUseCase: ConnectMetaPageUseCase,
    private readonly updateMetaConfigUseCase: UpdateMetaConfigUseCase,
    private readonly disconnectMetaUseCase: DisconnectMetaUseCase,
    private readonly listMetaLogsUseCase: ListMetaLogsUseCase,
    private readonly saveMetaLeadLogUseCase: SaveMetaLeadLogUseCase,
  ) {}

  @GrpcMethod('MetaLeadsService', 'GetStatus')
  async getStatus(data: { tenantId: string }) {
    const res = await this.getMetaStatusUseCase.execute(data.tenantId)
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('MetaLeadsService', 'ConnectPage')
  async connectPage(data: { jsonInput: string }) {
    const input = JSON.parse(data.jsonInput)
    const res = await this.connectMetaPageUseCase.execute(input)
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('MetaLeadsService', 'UpdateConfig')
  async updateConfig(data: { jsonInput: string }) {
    const input = JSON.parse(data.jsonInput)
    const res = await this.updateMetaConfigUseCase.execute(input)
    return { json: JSON.stringify(res) }
  }

  @GrpcMethod('MetaLeadsService', 'Disconnect')
  async disconnect(data: { tenantId: string }) {
    await this.disconnectMetaUseCase.execute(data.tenantId)
    return { success: true }
  }

  @GrpcMethod('MetaLeadsService', 'ListLogs')
  async listLogs(data: { tenantId: string; limit?: number }) {
    const logs = await this.listMetaLogsUseCase.execute(data.tenantId, data.limit)
    return {
      jsonItems: logs.map((l) => JSON.stringify(l)),
    }
  }

  @GrpcMethod('MetaLeadsService', 'SaveLog')
  async saveLog(data: { jsonInput: string }) {
    const input = JSON.parse(data.jsonInput)
    const log = await this.saveMetaLeadLogUseCase.execute(input)
    return { json: JSON.stringify(log) }
  }
}
