import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { CustomerPortalBffService } from './customer-portal.bff.service'

const CreatePortalTicketSchema = z.object({
  subject: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(10000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
})

@ApiTags('Portal de clientes')
@Controller('api/customer-portal')
export class CustomerPortalBffController {
  constructor(private readonly service: CustomerPortalBffService) {}

  @Get('me')
  @ApiOperation({ summary: 'Consultar únicamente los datos del contacto asociado al token de portal' })
  async getMyPortal(@CurrentUser() user?: AuthenticatedUser) {
    return this.service.getMyPortal(user)
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Crear un ticket para el contacto asociado al token de portal' })
  async createTicket(
    @Body(createZodPipe(CreatePortalTicketSchema)) body: z.infer<typeof CreatePortalTicketSchema>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.service.createTicket(user, body)
  }
}
