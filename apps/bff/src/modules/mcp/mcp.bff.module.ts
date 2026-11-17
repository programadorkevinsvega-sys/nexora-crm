import { Module } from '@nestjs/common'
import { McpBffController } from './mcp.bff.controller'
import { McpBffService } from './mcp.bff.service'

@Module({
  controllers: [McpBffController],
  providers: [McpBffService],
  exports: [McpBffService],
})
export class McpBffModule {}
