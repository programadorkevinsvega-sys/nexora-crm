import { isSwaggerEnabled, setupSwagger } from './swagger.config'
import { SwaggerModule } from '@nestjs/swagger'
import type { INestApplication } from '@nestjs/common'

jest.mock('@nestjs/swagger', () => {
  const original = jest.requireActual('@nestjs/swagger')
  return {
    ...original,
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({}),
      setup: jest.fn(),
    },
  }
})

describe('Swagger Security Configuration', () => {
  const originalEnv = { ...process.env }
  beforeEach(() => {
    process.env = { ...originalEnv }
    jest.clearAllMocks()
  })
  afterAll(() => { process.env = originalEnv })

  describe('isSwaggerEnabled', () => {
    it('returns false when SWAGGER_ENABLED=false regardless of environment', () => {
      expect(isSwaggerEnabled({ NODE_ENV: 'development', SWAGGER_ENABLED: 'false' })).toBe(false)
      expect(isSwaggerEnabled({ NODE_ENV: 'production', SWAGGER_ENABLED: 'false' })).toBe(false)
    })
    it('returns false in production when SWAGGER_ENABLED is not set', () => {
      expect(isSwaggerEnabled({ NODE_ENV: 'production' })).toBe(false)
    })
    it('returns true in development by default', () => {
      expect(isSwaggerEnabled({ NODE_ENV: 'development' })).toBe(true)
    })
    it('returns true in production when explicitly SWAGGER_ENABLED=true', () => {
      expect(isSwaggerEnabled({ NODE_ENV: 'production', SWAGGER_ENABLED: 'true' })).toBe(true)
    })
  })

  describe('setupSwagger', () => {
    it('does not mount swagger when disabled', () => {
      process.env.NODE_ENV = 'production'
      delete process.env.SWAGGER_ENABLED
      const mockApp = { getHttpAdapter: jest.fn() } as unknown as INestApplication
      expect(setupSwagger(mockApp)).toBe(false)
      expect(SwaggerModule.createDocument).not.toHaveBeenCalled()
      expect(SwaggerModule.setup).not.toHaveBeenCalled()
    })
    it('mounts swagger when enabled', () => {
      process.env.NODE_ENV = 'development'
      delete process.env.SWAGGER_ENABLED
      const mockApp = { getHttpAdapter: jest.fn() } as unknown as INestApplication
      expect(setupSwagger(mockApp)).toBe(true)
      expect(SwaggerModule.createDocument).toHaveBeenCalled()
      expect(SwaggerModule.setup).toHaveBeenCalled()
    })
  })
})