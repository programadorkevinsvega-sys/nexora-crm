import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { CreateCallSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { InteractionsBffService, CallFilters, PaginatedResult } from './interactions.bff.service'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import type { CreateCall, Call } from '@crm/contracts'

@ApiTags('Interacciones: Registro de Llamadas (Calls)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/calls')
export class CallsBffController {
  constructor(private readonly service: InteractionsBffService) {}

  @Get()
  @ApiOperation({ summary: 'Listar llamadas registradas' })
  @ApiQuery({ name: 'contactId', required: false, description: 'UUID del contacto' })
  @ApiQuery({ name: 'callType', required: false, description: 'INBOUND / OUTBOUND' })
  async listCalls(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('contactId') contactId?: string,
    @Query('callType') callType?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Call>> {
    const filters: CallFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      contactId,
      callType,
    }
    return this.service.listCalls(filters, tenantId!)
  }

  @Post()
  @ApiOperation({ summary: 'Registrar una llamada' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['contactId', 'callType', 'durationSeconds'],
      properties: {
        contactId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        callType: { type: 'string', example: 'OUTBOUND' },
        durationSeconds: { type: 'number', example: 240 },
        notes: { type: 'string', example: 'Llamada de prospección. Cliente interesado en cotización.' },
      },
    },
  })
  async createCall(
    @Body(createZodPipe(CreateCallSchema)) dto: CreateCall,
    @CurrentUser() user?: AuthenticatedUser,
    @Headers('X-Tenant-Id') headerTenantId?: string,
  ): Promise<Call> {
    const tenantId = user?.tenantId || headerTenantId
    const authorUserId = user?.userId || dto.authorUserId || '00000000-0000-0000-0000-000000000002'
    let happenedAt = dto.happenedAt
    if (happenedAt && !happenedAt.includes('T')) {
      happenedAt = new Date(happenedAt).toISOString()
    }
    return this.service.createCall({ ...dto, happenedAt, authorUserId }, tenantId!)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener registro de llamada por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la llamada' })
  async getCall(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Call> {
    return this.service.getCall(id, tenantId!)
  }
}
