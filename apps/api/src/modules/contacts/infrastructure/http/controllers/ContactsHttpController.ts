import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { CreateContactUseCase } from '../../../application/use-cases/CreateContactUseCase'
import { UpdateContactUseCase } from '../../../application/use-cases/UpdateContactUseCase'
import { DeleteContactUseCase } from '../../../application/use-cases/DeleteContactUseCase'
import { GetContactUseCase } from '../../../application/use-cases/GetContactUseCase'
import { ListContactsUseCase } from '../../../application/use-cases/ListContactsUseCase'
import { TenantId } from '../../../../../common/decorators/tenant-id.decorator'
import { CreateContactInputDto } from '../../../application/dto/CreateContactInputDto'
import { UpdateContactInputDto } from '../../../application/dto/UpdateContactInputDto'

@Controller('contacts')
export class ContactsHttpController {
  constructor(
    private readonly createUseCase: CreateContactUseCase,
    private readonly updateUseCase: UpdateContactUseCase,
    private readonly deleteUseCase: DeleteContactUseCase,
    private readonly getUseCase: GetContactUseCase,
    private readonly listUseCase: ListContactsUseCase,
  ) {}

  @Post()
  async create(@Body() body: Omit<CreateContactInputDto, 'tenantId'>, @TenantId() tenantId: string) {
    return this.createUseCase.execute({ ...body, tenantId })
  }

  @Get()
  async list(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('search') search: string | undefined,
    @Query('leadStatus') leadStatus: string | undefined,
    @Query('companyId') companyId: string | undefined,
    @Query('isStarred') isStarred: string | undefined,
    @TenantId() tenantId: string,
  ) {
    return this.listUseCase.execute({
      tenantId,
      search,
      leadStatus,
      companyId,
      isStarred: isStarred !== undefined ? isStarred === 'true' : undefined,
      cursor,
      limit: limit ? Number(limit) : undefined,
    })
  }

  @Get(':id')
  async get(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.getUseCase.execute({ tenantId, id })
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Omit<UpdateContactInputDto, 'tenantId' | 'id'>,
    @TenantId() tenantId: string,
  ) {
    await this.updateUseCase.execute({ ...body, tenantId, id })
    return { id }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.deleteUseCase.execute({ tenantId, id })
    return { id }
  }
}
