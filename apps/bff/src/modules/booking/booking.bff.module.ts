import { Module } from '@nestjs/common'
import { BookingBffController } from './booking.bff.controller'
import { BookingBffService } from './booking.bff.service'

@Module({
  controllers: [BookingBffController],
  providers: [BookingBffService],
  exports: [BookingBffService],
})
export class BookingBffModule {}
