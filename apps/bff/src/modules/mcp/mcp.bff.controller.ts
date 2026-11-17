import { Controller, Get, Post, Req, Res } from '@nestjs/common'
import { McpBffService } from './mcp.bff.service'
import type { Request, Response } from 'express'

@Controller('api/mcp')
export class McpBffController {
  constructor(private readonly service: McpBffService) {}

  @Get('sse')
  async sseConnect(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.service.handleSseConnection(req, res)
  }

  @Post('messages')
  async handleMessage(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.service.handlePostMessage(req, res)
  }
}
