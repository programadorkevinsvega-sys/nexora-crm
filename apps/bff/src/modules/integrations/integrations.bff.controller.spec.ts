import { IntegrationsBffController } from './integrations.bff.controller'
import { IntegrationsBffService } from './integrations.bff.service'

describe('IntegrationsBffController - Unit Tests', () => {
  let controller: IntegrationsBffController
  let mockService: jest.Mocked<IntegrationsBffService>

  beforeEach(() => {
    mockService = {
      listStatuses: jest.fn().mockResolvedValue([
        { provider: 'WHATSAPP_CLOUD', isConfigured: true, isEnabled: true },
      ]),
      saveConfig: jest.fn().mockResolvedValue({ ok: true }),
      testIntegration: jest.fn().mockResolvedValue({ success: true, message: 'OK' }),
      deleteConfig: jest.fn().mockResolvedValue({ ok: true }),
    } as unknown as jest.Mocked<IntegrationsBffService>

    controller = new IntegrationsBffController(mockService)
  })

  it('GET /api/integrations should list provider statuses', async () => {
    const mockReq = { headers: {} } as unknown as Parameters<IntegrationsBffController['listStatuses']>[0]
    const res = await controller.listStatuses(mockReq)
    expect(res).toHaveLength(1)
    expect(mockService.listStatuses).toHaveBeenCalled()
  })

  it('POST /api/integrations/WHATSAPP_CLOUD should save config', async () => {
    const mockReq = { headers: {} } as unknown as Parameters<IntegrationsBffController['saveConfig']>[2]
    const body = {
      phoneNumberId: '123456789',
      wabaId: '987654321',
      accessToken: 'EAAB...',
    }
    const res = await controller.saveConfig('WHATSAPP_CLOUD', body, mockReq)
    expect(res.ok).toBe(true)
    expect(mockService.saveConfig).toHaveBeenCalled()
  })

  it('POST /api/integrations/WHATSAPP_CLOUD/test should test connection', async () => {
    const mockReq = { headers: {} } as unknown as Parameters<IntegrationsBffController['testIntegration']>[2]
    const body = { recipient: '+573001234567', testMessage: 'Hola' }
    const res = await controller.testIntegration('WHATSAPP_CLOUD', body, mockReq)
    expect(res.success).toBe(true)
    expect(mockService.testIntegration).toHaveBeenCalled()
  })
})
