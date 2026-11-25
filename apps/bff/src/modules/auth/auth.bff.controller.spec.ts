import { AuthBffController } from './auth.bff.controller'
import { ClientGrpc } from '@nestjs/microservices'
import type { Request } from 'express'
import { of } from 'rxjs'

describe('AuthBffController - HTTP REST Gateway E2E Tests', () => {
  let controller: AuthBffController
  let mockGrpcService: { login: jest.Mock; refreshToken: jest.Mock; logout: jest.Mock }
  let mockGrpcClient: { getService: jest.Mock }

  beforeEach(() => {
    mockGrpcService = {
      login: jest.fn().mockReturnValue(of({ json: JSON.stringify({ token: 'jwt-123', user: { id: 'u-1' } }) })),
      refreshToken: jest.fn().mockReturnValue(of({ json: JSON.stringify({ token: 'jwt-refreshed' }) })),
      logout: jest.fn().mockReturnValue(of({ success: true })),
    }
    mockGrpcClient = { getService: jest.fn().mockReturnValue(mockGrpcService) }
    controller = new AuthBffController(mockGrpcClient as unknown as ClientGrpc)
    controller.onModuleInit()
  })

  it('forwards login payload to Auth gRPC service and parses JSON response', async () => {
    const request = { headers: { 'user-agent': 'Jest/Playwright' } } as unknown as Request
    const body = { tenantId: 'tenant-1', email: 'dev@test.com', password: 'secretpassword' }
    const result = await controller.login(body, '127.0.0.1', request)
    expect(result.token).toBe('jwt-123')
    expect(mockGrpcService.login).toHaveBeenCalledWith(expect.objectContaining({
      email: 'dev@test.com',
      ipAddress: '127.0.0.1',
    }))
  })
})