import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../../common/decorators/public.decorator'
import { Throttle } from '../../common/decorators/throttle.decorator'
import { TenantInvitationsBffService } from './tenant-invitations.bff.service'

@ApiTags('Aceptación de invitaciones')
@Controller('api/team-invitations')
export class TeamInvitationsPublicBffController {
  constructor(private readonly service: TenantInvitationsBffService) {}

  @Public()
  @Throttle({ limit: 10, ttl: 60 })
  @Post('preview')
  @ApiOperation({ summary: 'Consultar los datos públicos de una invitación válida sin incluir el token en la URL' })
  async preview(@Body() body: { token?: string }) {
    if (!body?.token) throw new BadRequestException('token is required')
    return this.service.getInvitationPreview(body.token)
  }

  @Public()
  @Throttle({ limit: 5, ttl: 60 })
  @Post('accept')
  @ApiOperation({ summary: 'Aceptar una invitación y activar una cuenta de miembro' })
  async accept(@Body() body: {
    token?: string; firstName?: string; lastName?: string; password?: string
  }) {
    if (!body?.token || !body.firstName || !body.lastName || !body.password) {
      throw new BadRequestException('token, firstName, lastName and password are required')
    }
    return this.service.acceptInvitation({
      token: body.token,
      firstName: body.firstName,
      lastName: body.lastName,
      password: body.password,
    })
  }
}
