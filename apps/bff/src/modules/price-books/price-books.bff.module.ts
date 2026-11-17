import { Module } from '@nestjs/common'
import { PriceBooksBffController } from './price-books.bff.controller'
import { PriceBooksBffService } from './price-books.bff.service'

@Module({
  controllers: [PriceBooksBffController],
  providers: [PriceBooksBffService],
  exports: [PriceBooksBffService],
})
export class PriceBooksBffModule {}
