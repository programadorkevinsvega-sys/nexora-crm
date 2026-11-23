import { McpBffController } from './mcp.bff.controller'
import { McpBffService } from './mcp.bff.service'
import type { Request, Response } from 'express'

describe('McpBffController - Unit Tests', () => {
  let controller: McpBffController
  let mockService: jest.Mocked<McpBffService>

  beforeEach(() => {
    mockService = {
      handleSseConnection: jest.fn().mockResolvedValue(undefined),
      handlePostMessage: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<McpBffService>

    controller = new McpBffController(mockService)
  })

  it('GET /api/mcp/sse should delegate to handleSseConnection', async () => {
    const mockReq = {} as Request
    const mockRes = {} as Response

    await controller.sseConnect(mockReq, mockRes)

    expect(mockService.handleSseConnection).toHaveBeenCalledWith(mockReq, mockRes)
  })

  it('POST /api/mcp/messages should delegate to handlePostMessage', async () => {
    const mockReq = { query: { sessionId: 'sess-1' } } as unknown as Request
    const mockRes = {} as unknown as Response

    await controller.handleMessage(mockReq, mockRes)

    expect(mockService.handlePostMessage).toHaveBeenCalledWith(mockReq, mockRes)
  })
})
