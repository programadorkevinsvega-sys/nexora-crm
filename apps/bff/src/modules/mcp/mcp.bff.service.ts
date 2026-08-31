import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { createNexusMcpServer, SSEServerTransport } from '@crm/mcp-server'
import type { Request, Response } from 'express'

@Injectable()
export class McpBffService {
  private readonly logger = new Logger(McpBffService.name)
  private readonly transports = new Map<string, SSEServerTransport>()

  async handleSseConnection(req: Request, res: Response): Promise<void> {
    const authHeader = (req.headers['authorization'] || '') as string
    const apiKeyHeader = (req.headers['x-api-key'] || '') as string
    const rawKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (apiKeyHeader || '')

    const transport = new SSEServerTransport('/api/mcp/messages', res)
    const sessionId = transport.sessionId
    this.transports.set(sessionId, transport)

    this.logger.log(`New MCP SSE client connected. SessionId: ${sessionId}`)

    const { server } = createNexusMcpServer({
      apiKey: rawKey,
      baseUrl: 'http://localhost:3006',
    })

    req.on('close', () => {
      this.logger.log(`MCP SSE client disconnected. SessionId: ${sessionId}`)
      this.transports.delete(sessionId)
    })

    await server.connect(transport)
  }

  async handlePostMessage(req: Request, res: Response): Promise<void> {
    const sessionId = req.query.sessionId as string
    if (!sessionId) {
      throw new NotFoundException('Missing sessionId query parameter for MCP message')
    }

    const transport = this.transports.get(sessionId)
    if (!transport) {
      throw new NotFoundException(`No active MCP SSE session found for sessionId: ${sessionId}`)
    }

    await transport.handlePostMessage(req, res)
  }
}
