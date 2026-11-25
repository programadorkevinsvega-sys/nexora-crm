import { SecurityHeadersMiddleware } from './security-headers.middleware'
import type { Request, Response } from 'express'

describe('SecurityHeadersMiddleware', () => {
  let middleware: SecurityHeadersMiddleware

  beforeEach(() => {
    middleware = new SecurityHeadersMiddleware()
  })

  it('sets standard security headers on regular API requests', () => {
    const headers: Record<string, string> = {}
    const req = { path: '/api/contacts' } as unknown as Request
    const res = {
      setHeader: jest.fn((k: string, v: string) => { headers[k] = v }),
      removeHeader: jest.fn((k: string) => { delete headers[k] }),
    } as unknown as Response
    const next = jest.fn()

    middleware.use(req, res, next)

    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['X-Frame-Options']).toBe('SAMEORIGIN')
    expect(headers['X-XSS-Protection']).toBe('1; mode=block')
    expect(headers['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains; preload')
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By')
    expect(res.removeHeader).toHaveBeenCalledWith('Server')
    expect(next).toHaveBeenCalled()
  })

  it('allows embedding for public embed and forms routes', () => {
    const req = { path: '/api/public/forms/contacto-web' } as unknown as Request
    const res = {
      setHeader: jest.fn(),
      removeHeader: jest.fn(),
    } as unknown as Response
    const next = jest.fn()

    middleware.use(req, res, next)

    expect(res.removeHeader).toHaveBeenCalledWith('X-Frame-Options')
    expect(next).toHaveBeenCalled()
  })
})
