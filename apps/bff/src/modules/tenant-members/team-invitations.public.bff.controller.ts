import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
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
  @Get(':token')
  @ApiOperation({ summary: 'Consultar los datos públicos de una invitación válida' })
  async preview(@Param('token') token: string) {
    return this.service.getInvitationPreview(token)
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
