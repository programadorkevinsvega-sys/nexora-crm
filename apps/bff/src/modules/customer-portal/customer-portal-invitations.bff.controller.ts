import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { CustomerPortalAccessBffService } from './customer-portal-access.bff.service'

const InviteSchema = z.object({ contactId: z.string().uuid() })

@ApiTags('Invitaciones al portal de clientes')
@Controller('api/tenant/customer-portal/invitations')
export class CustomerPortalInvitationsBffController {
  constructor(private readonly service: CustomerPortalAccessBffService) {}

  @Post()
  @ApiOperation({ summary: 'Invitar un contacto del tenant al portal de clientes' })
  create(@Body(createZodPipe(InviteSchema)) body: z.infer<typeof InviteSchema>, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createInvitation(user, body.contactId)
  }

  @Get()
  @ApiOperation({ summary: 'Listar invitaciones al portal del tenant autenticado' })
  list(@CurrentUser() user: AuthenticatedUser, @Query('contactId') contactId?: string) {
    if (contactId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(contactId)) {
      throw new BadRequestException('contactId must be a UUID')
    }
    return this.service.listInvitations(user, contactId)
  }

  @Post(':id/resend')
  resend(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.resendInvitation(user, id)
  }

  @Delete(':id')
  revoke(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.revokeInvitation(user, id)
  }
}
