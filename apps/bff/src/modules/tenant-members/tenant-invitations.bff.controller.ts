import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { TenantInvitationsBffService } from './tenant-invitations.bff.service'

@ApiTags('Invitaciones de miembros')
@Controller('api/tenant/team/invitations')
export class TenantInvitationsBffController {
  constructor(private readonly service: TenantInvitationsBffService) {}

  @Post()
  @ApiOperation({ summary: 'Invitar un miembro por correo y asignarle un rol del tenant' })
  async create(
    @Body() body: { email?: string; roleId?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!body?.email || !body?.roleId) {
      throw new BadRequestException('email and roleId are required')
    }
    return this.service.createInvitation(user, body.email, body.roleId)
  }

  @Get()
  @ApiOperation({ summary: 'Listar invitaciones del tenant autenticado' })
  async list(@CurrentUser() user: AuthenticatedUser) {
    return this.service.listInvitations(user)
  }

  @Delete(':invitationId')
  @ApiOperation({ summary: 'Revocar una invitación del tenant autenticado' })
  async revoke(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.revokeInvitation(user, invitationId)
  }

  @Post(':invitationId/resend')
  @ApiOperation({ summary: 'Rotar el token y reenviar una invitación pendiente o expirada' })
  async resend(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.resendInvitation(user, invitationId)
  }
}
