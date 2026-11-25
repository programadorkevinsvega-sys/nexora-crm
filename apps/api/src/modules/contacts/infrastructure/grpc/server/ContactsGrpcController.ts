import { Controller, UseFilters } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { GrpcDomainErrorFilter } from '../../../../../common/filters/grpc-domain-error.filter'
import { CreateContactUseCase } from '../../../application/use-cases/CreateContactUseCase'
import { UpdateContactUseCase } from '../../../application/use-cases/UpdateContactUseCase'
import { DeleteContactUseCase } from '../../../application/use-cases/DeleteContactUseCase'
import { GetContactUseCase } from '../../../application/use-cases/GetContactUseCase'
import { ListContactsUseCase } from '../../../application/use-cases/ListContactsUseCase'
import { ContactsProtoMapper } from '../dto/ContactsProtoMapper'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function contactIdentity(input: unknown): { tenantId: string; id: string } {
  if (!isRecord(input)) throw new TypeError('Contact identity request must be an object')
  const tenantId = input.tenantId ?? input.tenant_id
  if (typeof tenantId !== 'string' || tenantId.trim().length === 0) throw new TypeError('tenantId is required')
  if (typeof input.id !== 'string' || input.id.trim().length === 0) throw new TypeError('id is required')
  return { tenantId, id: input.id }
}

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
  async create(data: unknown) {
    const input = ContactsProtoMapper.toCreateInput(data)
    const result = await this.createUseCase.execute(input)
    const contact = await this.getUseCase.execute({ tenantId: input.tenantId, id: result.id })
    return { json: JSON.stringify(contact) }
  }

  @GrpcMethod('ContactService', 'GetContact')
  async getById(data: unknown) {
    const identity = contactIdentity(data)
    const contact = await this.getUseCase.execute(identity)
    return { json: JSON.stringify(contact) }
  }

  @GrpcMethod('ContactService', 'ListContacts')
  async list(data: unknown) {
    const input = ContactsProtoMapper.toListInput(data)
    const result = await this.listUseCase.execute(input)
    return {
      jsonItems: result.data.map(c => JSON.stringify(c)),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('ContactService', 'UpdateContact')
  async update(data: unknown) {
    const input = ContactsProtoMapper.toUpdateInput(data)
    await this.updateUseCase.execute(input)
    return {}
  }

  @GrpcMethod('ContactService', 'DeleteContact')
  async delete(data: unknown) {
    await this.deleteUseCase.execute(contactIdentity(data))
    return {}
  }
}
