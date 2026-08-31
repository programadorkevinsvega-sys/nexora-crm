import { Module } from '@nestjs/common'
import { AuthBffController } from './auth.bff.controller'

@Module({
  controllers: [AuthBffController],
})
export class AuthBffModule {}
