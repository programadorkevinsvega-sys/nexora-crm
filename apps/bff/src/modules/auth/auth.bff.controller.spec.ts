import { AuthBffController } from './auth.bff.controller'
import { of } from 'rxjs'

describe('AuthBffController - HTTP REST Gateway E2E Tests', () => {
  let controller: AuthBffController
  let mockGrpcService: any
  let mockGrpcClient: any

  beforeEach(() => {
    mockGrpcService = {
      login: jest.fn().mockReturnValue(of({ json: JSON.stringify({ token: 'jwt-123', user: { id: 'u-1' } }) })),
      refreshToken: jest.fn().mockReturnValue(of({ json: JSON.stringify({ token: 'jwt-refreshed' }) })),
      logout: jest.fn().mockReturnValue(of({ success: true })),
    }

    mockGrpcClient = {
      getService: jest.fn().mockReturnValue(mockGrpcService),
    }

    controller = new AuthBffController(mockGrpcClient)
    controller.onModuleInit()
  })

  it('should forward login payload to Auth gRPC service and parse JSON response', async () => {
    const mockReq = { headers: { 'user-agent': 'Jest/Playwright' } } as any
    const body = { tenantId: 'tenant-1', email: 'dev@test.com', password: 'secretpassword' }

    const result = await controller.login(body, '127.0.0.1', mockReq)

    expect(result.token).toBe('jwt-123')
    expect(mockGrpcService.login).toHaveBeenCalledWith(expect.objectContaining({
      email: 'dev@test.com',
      ipAddress: '127.0.0.1',
    }))
  })
})
