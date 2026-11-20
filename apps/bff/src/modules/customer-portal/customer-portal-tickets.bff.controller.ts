import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { CustomerPortalTicketsBffService } from './customer-portal-tickets.bff.service'

const AddPortalTicketReplySchema = z.object({
  message: z.string().trim().min(1).max(10000),
})

@ApiTags('Portal de clientes - soporte')
@Controller('api/customer-portal/tickets')
export class CustomerPortalTicketsBffController {
  constructor(private readonly service: CustomerPortalTicketsBffService) {}

  @Get(':ticketId')
  @ApiOperation({ summary: 'Consultar un ticket propiedad del contacto autenticado' })
  async getTicket(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.service.getTicket(user, ticketId)
  }

  @Get(':ticketId/replies')
  @ApiOperation({ summary: 'Consultar respuestas públicas de un ticket del cliente' })
  async listReplies(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return { data: await this.service.listReplies(user, ticketId) }
  }

  @Post(':ticketId/replies')
  @ApiOperation({ summary: 'Responder como cliente a un ticket propio' })
  async addReply(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body(createZodPipe(AddPortalTicketReplySchema)) body: z.infer<typeof AddPortalTicketReplySchema>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.service.addReply(user, ticketId, body.message)
  }
}
