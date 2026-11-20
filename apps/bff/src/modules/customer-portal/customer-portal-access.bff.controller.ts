import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { Public } from '../../common/decorators/public.decorator'
import { Throttle } from '../../common/decorators/throttle.decorator'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { CustomerPortalAccessBffService } from './customer-portal-access.bff.service'

const TokenSchema = z.object({ token: z.string().min(43).max(43) })
const AcceptSchema = TokenSchema.extend({ password: z.string().min(12).max(72) })
const LoginSchema = z.object({
  tenantId: z.string().uuid(), email: z.string().email().max(255), password: z.string().min(1).max(72),
})
const RefreshSchema = z.object({
  tenantId: z.string().uuid(), refreshToken: z.string().min(20).max(4096),
})

@ApiTags('Acceso al portal de clientes')
@Controller('api/customer-portal')
export class CustomerPortalAccessBffController {
  constructor(private readonly service: CustomerPortalAccessBffService) {}

  @Public()
  @Throttle({ limit: 10, ttl: 60 })
  @Post('invitations/preview')
  @ApiOperation({ summary: 'Validar una invitación pública sin exponer el token en la URL' })
  previewInvitation(@Body(createZodPipe(TokenSchema)) body: z.infer<typeof TokenSchema>) {
    return this.service.previewInvitation(body.token)
  }

  @Public()
  @Throttle({ limit: 5, ttl: 60 })
  @Post('invitations/accept')
  @ApiOperation({ summary: 'Aceptar una invitación verificada y crear credencial de portal' })
  acceptInvitation(@Body(createZodPipe(AcceptSchema)) body: z.infer<typeof AcceptSchema>) {
    return this.service.acceptInvitation(body.token, body.password)
  }

  @Public()
  @Throttle({ limit: 5, ttl: 60 })
  @Post('auth/login')
  login(@Body(createZodPipe(LoginSchema)) body: z.infer<typeof LoginSchema>) {
    return this.service.login(body.tenantId, body.email, body.password)
  }

  @Public()
  @Throttle({ limit: 10, ttl: 60 })
  @Post('auth/refresh')
  refresh(@Body(createZodPipe(RefreshSchema)) body: z.infer<typeof RefreshSchema>) {
    return this.service.refresh(body.tenantId, body.refreshToken)
  }

  @Post('auth/logout')
  logout(@CurrentUser() user: AuthenticatedUser) {
    return this.service.logout(user)
  }
}
