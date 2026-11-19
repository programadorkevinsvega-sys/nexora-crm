import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { TenantMembersBffService } from './tenant-members.bff.service'

@ApiTags('Equipo del tenant')
@Controller('api/tenant/team')
export class TenantMembersBffController {
  constructor(private readonly service: TenantMembersBffService) {}

  @Get('members')
  @ApiOperation({ summary: 'Listar usuarios de la empresa autenticada y sus roles' })
  async listMembers(
    @CurrentUser() user: AuthenticatedUser,
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    await this.service.assertTenantAdmin(user)
    const parsedLimit = limit ? Number(limit) : 50
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new BadRequestException('limit must be an integer between 1 and 100')
    }
    return this.service.listMembers(user.tenantId, cursor, search, parsedLimit)
  }

  @Get('roles')
  @ApiOperation({ summary: 'Listar roles asignables dentro de la empresa autenticada' })
  async listRoles(@CurrentUser() user: AuthenticatedUser) {
    await this.service.assertTenantAdmin(user)
    return this.service.listAssignableRoles(user.tenantId)
  }

  @Put('members/:memberId/role')
  @ApiOperation({ summary: 'Reemplazar el rol principal de un miembro del tenant' })
  async replaceMemberRole(
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() body: { roleId?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!body?.roleId) throw new BadRequestException('roleId is required')
    return this.service.replaceMemberRole(user, memberId, body.roleId)
  }
}
