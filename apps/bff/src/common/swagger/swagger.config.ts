import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Request, Response, NextFunction } from 'express'

export function isSwaggerEnabled(
  env: { NODE_ENV?: string; SWAGGER_ENABLED?: string } = process.env,
): boolean {
  const isProduction = env.NODE_ENV === 'production'
  return (
    env.SWAGGER_ENABLED === 'true' ||
    (!isProduction && env.SWAGGER_ENABLED !== 'false')
  )
}

export function setupSwagger(app: INestApplication): boolean {
  if (!isSwaggerEnabled(process.env)) {
    return false
  }

  const swaggerUser = process.env.SWAGGER_USER
  const swaggerPass = process.env.SWAGGER_PASSWORD

  if (swaggerUser && swaggerPass) {
    const httpAdapter = app.getHttpAdapter()
    httpAdapter.use('/api/docs', (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization || ''
      if (!authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Nexora Swagger Documentation"')
        return res.status(401).send('Authentication required to access API documentation')
      }
      const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf8')
      const [user, pass] = credentials.split(':')
      if (user !== swaggerUser || pass !== swaggerPass) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Nexora Swagger Documentation"')
        return res.status(401).send('Invalid documentation credentials')
      }
      return next()
    })
  }

  const config = new DocumentBuilder()
    .setTitle('CRM API & BFF Gateway')
    .setDescription('REST API Documentation for CRM Services & Frontend Gateway')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  return true
}
