import {
  Controller, Get, Post, Put, Delete, Param, Body, Headers, ParseUUIDPipe,
} from '@nestjs/common'
import { WebFormsBffService } from './web-forms.bff.service'
import type { CreateWebForm, UpdateWebForm, WebForm } from '@crm/contracts'

@Controller('api/forms')
export class WebFormsBffController {
  constructor(private readonly service: WebFormsBffService) {}

  @Get()
  async list(@Headers('X-Tenant-Id') tenantId: string): Promise<WebForm[]> {
    return this.service.list(tenantId)
  }

  @Post()
  async create(
    @Body() dto: CreateWebForm,
    @Headers('X-Tenant-Id') tenantId: string,
  ): Promise<WebForm> {
    return this.service.create(dto, tenantId)
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId: string,
  ): Promise<WebForm> {
    return this.service.getById(id, tenantId)
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWebForm,
    @Headers('X-Tenant-Id') tenantId: string,
  ): Promise<WebForm> {
    return this.service.update(id, dto, tenantId)
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId: string,
  ): Promise<{ success: boolean }> {
    await this.service.delete(id, tenantId)
    return { success: true }
  }

  @Get(':id/submissions')
  async getSubmissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    return this.service.listSubmissions(id, tenantId)
  }
}
