import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { CreateTagSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { TagsBffService } from './tags.bff.service'
import type { CreateTag, Tag } from '@crm/contracts'

@Controller('api/tags')
export class TagsBffController {
  constructor(private readonly service: TagsBffService) {}

  @Get()
  async list(
    @Query('search') search?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ data: Tag[] }> {
    const result = await this.service.list({ tenantId: tenantId!, search })
    return { data: result.data }
  }

  @Post()
  async create(
    @Body(createZodPipe(CreateTagSchema)) dto: CreateTag,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Tag> {
    return this.service.create(dto, tenantId!)
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Tag> {
    return this.service.getById(id, tenantId!)
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { name?: string; color?: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Tag> {
    return this.service.update(id, dto, tenantId!)
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.delete(id, tenantId!)
  }
}
