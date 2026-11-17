import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // 1. Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff')

    // 2. Prevent clickjacking (allow iframes for public embed routes)
    const isEmbedRoute = req.path.includes('/embed/') || req.path.includes('/public/forms/')
    if (isEmbedRoute) {
      res.removeHeader('X-Frame-Options')
    } else {
      res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    }

    // 3. XSS Filter protection
    res.setHeader('X-XSS-Protection', '1; mode=block')

    // 4. HTTP Strict Transport Security (HSTS)
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    )

    // 5. Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    // 6. Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
    )

    // 7. Remove fingerprinting headers
    res.removeHeader('X-Powered-By')
    res.removeHeader('Server')

    next()
  }
}
