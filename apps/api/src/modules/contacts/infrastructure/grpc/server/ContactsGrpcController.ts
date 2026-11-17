import { Controller, UseFilters } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { GrpcDomainErrorFilter } from '../../../../../common/filters/grpc-domain-error.filter'
import { CreateContactUseCase } from '../../../application/use-cases/CreateContactUseCase'
import { UpdateContactUseCase } from '../../../application/use-cases/UpdateContactUseCase'
import { DeleteContactUseCase } from '../../../application/use-cases/DeleteContactUseCase'
import { GetContactUseCase } from '../../../application/use-cases/GetContactUseCase'
import { ListContactsUseCase } from '../../../application/use-cases/ListContactsUseCase'
import { ContactsProtoMapper } from '../dto/ContactsProtoMapper'

@Controller()
@UseFilters(GrpcDomainErrorFilter)
export class ContactsGrpcController {
  constructor(
    private readonly createUseCase: CreateContactUseCase,
    private readonly updateUseCase: UpdateContactUseCase,
    private readonly deleteUseCase: DeleteContactUseCase,
    private readonly getUseCase: GetContactUseCase,
    private readonly listUseCase: ListContactsUseCase,
  ) {}

  @GrpcMethod('ContactService', 'CreateContact')
  async create(data: any) {
    const input = ContactsProtoMapper.toCreateInput(data)
    const result = await this.createUseCase.execute(input)
    const contact = await this.getUseCase.execute({ tenantId: input.tenantId, id: result.id })
    return { json: JSON.stringify(contact) }
  }

  @GrpcMethod('ContactService', 'GetContact')
  async getById(data: { tenantId?: string; tenant_id?: string; id: string }) {
    const tenantId = data.tenantId || data.tenant_id || ''
    const contact = await this.getUseCase.execute({ tenantId, id: data.id })
    return { json: JSON.stringify(contact) }
  }

  @GrpcMethod('ContactService', 'ListContacts')
  async list(data: any) {
    const input = ContactsProtoMapper.toListInput(data)
    const result = await this.listUseCase.execute(input)
    return {
      jsonItems: result.data.map(c => JSON.stringify(c)),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('ContactService', 'UpdateContact')
  async update(data: any) {
    const input = ContactsProtoMapper.toUpdateInput(data)
    await this.updateUseCase.execute(input)
    return {}
  }

  @GrpcMethod('ContactService', 'DeleteContact')
  async delete(data: { tenantId?: string; tenant_id?: string; id: string }) {
    const tenantId = data.tenantId || data.tenant_id || ''
    await this.deleteUseCase.execute({ tenantId, id: data.id })
    return {}
  }
}
