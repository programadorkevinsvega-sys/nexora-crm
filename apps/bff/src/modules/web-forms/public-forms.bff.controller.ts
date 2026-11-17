import {
  Controller, Get, Post, Param, Body, Req, Headers, Ip,
} from '@nestjs/common'
import type { Request } from 'express'
import { Public } from '../../common/decorators/public.decorator'
import { Throttle } from '../../common/decorators/throttle.decorator'
import { WebFormsBffService } from './web-forms.bff.service'
import type { WebForm } from '@crm/contracts'

@Public()
@Throttle({ limit: 20, ttl: 60 })
@Controller('api/public/forms')
export class PublicFormsBffController {
  constructor(private readonly service: WebFormsBffService) {}

  @Get(':idOrSlug')
  async getPublicForm(@Param('idOrSlug') idOrSlug: string): Promise<WebForm> {
    return this.service.getPublicForm(idOrSlug)
  }

  @Post(':idOrSlug/submit')
  async submitForm(
    @Param('idOrSlug') idOrSlug: string,
    @Body() body: Record<string, any>,
    @Req() req: Request,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const formData = body.formData || body
    return this.service.submitPublic(idOrSlug, formData, ip || req.ip, userAgent)
  }
}
