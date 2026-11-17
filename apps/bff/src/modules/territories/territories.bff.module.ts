import { Module } from '@nestjs/common'
import { TerritoriesBffController } from './territories.bff.controller'
import { TerritoriesBffService } from './territories.bff.service'

@Module({
  controllers: [TerritoriesBffController],
  providers: [TerritoriesBffService],
  exports: [TerritoriesBffService],
})
export class TerritoriesBffModule {}
