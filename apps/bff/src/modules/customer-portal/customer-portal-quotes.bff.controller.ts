import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { CustomerPortalQuotesBffService } from './customer-portal-quotes.bff.service'

const RejectPortalQuoteSchema = z.object({
  reason: z.string().trim().min(10).max(2000),
})

@ApiTags('Portal de clientes - cotizaciones')
@Controller('api/customer-portal/quotes')
export class CustomerPortalQuotesBffController {
  constructor(private readonly service: CustomerPortalQuotesBffService) {}

  @Get(':quoteId')
  @ApiOperation({ summary: 'Consultar el detalle de una cotización propia del cliente' })
  async getQuote(
    @Param('quoteId', ParseUUIDPipe) quoteId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.service.getQuote(user, quoteId)
  }

  @Post(':quoteId/accept')
  @ApiOperation({ summary: 'Aceptar una cotización enviada al contacto autenticado' })
  async acceptQuote(
    @Param('quoteId', ParseUUIDPipe) quoteId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.service.acceptQuote(user, quoteId)
  }

  @Post(':quoteId/reject')
  @ApiOperation({ summary: 'Rechazar una cotización propia indicando el motivo' })
  async rejectQuote(
    @Param('quoteId', ParseUUIDPipe) quoteId: string,
    @Body(createZodPipe(RejectPortalQuoteSchema)) body: z.infer<typeof RejectPortalQuoteSchema>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.service.rejectQuote(user, quoteId, body.reason)
  }
}
