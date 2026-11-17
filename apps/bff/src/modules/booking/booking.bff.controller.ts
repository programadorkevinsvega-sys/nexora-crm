import { Controller, Get, Post, Patch, Param, Body, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { BookingBffService } from './booking.bff.service'
import { Public } from '../../common/decorators/public.decorator'
import type {
  BookingLink,
  CreateBookingLink,
  BookingAppointment,
  CreateBookingAppointment,
  AvailableTimeSlot,
} from '@crm/contracts'

@ApiTags('Booking & Scheduling')
@Controller('api/booking')
export class BookingBffController {
  constructor(private readonly service: BookingBffService) {}

  @Post('links')
  @ApiOperation({ summary: 'Crear nuevo enlace público de agendamiento' })
  async createBookingLink(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-user-id') userId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateBookingLink,
  ): Promise<BookingLink> {
    return this.service.createBookingLink(tenantId, userId, dto)
  }

  @Get('links')
  @ApiOperation({ summary: 'Listar enlaces de agendamiento del anfitrión' })
  async listBookingLinks(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-user-id') userId = '00000000-0000-0000-0000-000000000001',
  ): Promise<BookingLink[]> {
    return this.service.listBookingLinks(tenantId, userId)
  }

  @Public()
  @Get('public/:slug')
  @ApiOperation({ summary: 'Obtener información pública del enlace y franjas disponibles' })
  async getPublicBookingPage(
    @Param('slug') slug: string,
  ): Promise<{ link: BookingLink; availableSlots: AvailableTimeSlot[] }> {
    return this.service.getPublicBookingPage(slug)
  }

  @Public()
  @Post('public/:slug/book')
  @ApiOperation({ summary: 'Reservar cita en enlace público y generar enlace Meet/Zoom' })
  async createPublicAppointment(
    @Param('slug') slug: string,
    @Body() dto: CreateBookingAppointment,
  ): Promise<BookingAppointment> {
    return this.service.createPublicAppointment(slug, dto)
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Listar citas programadas para el anfitrión' })
  async listAppointments(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-user-id') userId = '00000000-0000-0000-0000-000000000001',
  ): Promise<BookingAppointment[]> {
    return this.service.listAppointments(tenantId, userId)
  }

  @Patch('appointments/:id/cancel')
  @ApiOperation({ summary: 'Cancelar una cita programada' })
  async cancelAppointment(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<{ success: boolean }> {
    await this.service.cancelAppointment(tenantId, id, reason)
    return { success: true }
  }
}
