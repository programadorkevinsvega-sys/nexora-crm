import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3006'
  const allowedOrigins = corsOrigin.includes(',')
    ? corsOrigin.split(',').map((o) => o.trim())
    : [corsOrigin]

  if (!allowedOrigins.includes('http://localhost:3000')) {
    allowedOrigins.push('http://localhost:3000')
  }
  if (!allowedOrigins.includes('http://localhost:3006')) {
    allowedOrigins.push('http://localhost:3006')
  }

  app.enableCors({ origin: allowedOrigins, credentials: true })

  app.use((req: any, _res: any, next: any) => {
    if (req.query?.tenantId && req.query.tenantId !== 'undefined' && req.query.tenantId !== 'null') {
      req.headers['x-tenant-id'] = req.query.tenantId
    }
    if (!req.headers['x-tenant-id'] || req.headers['x-tenant-id'] === 'undefined' || req.headers['x-tenant-id'] === 'null') {
      req.headers['x-tenant-id'] = '00000000-0000-0000-0000-000000000001'
    }
    next()
  })

  const config = new DocumentBuilder()
    .setTitle('CRM API & BFF Gateway')
    .setDescription('REST API Documentation for CRM Services & Frontend Gateway')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .addApiKey({ type: 'apiKey', name: 'X-Tenant-Id', in: 'header' }, 'X-Tenant-Id')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.BFF_PORT || 3006
  await app.listen(port)
  console.log(`BFF running on port ${port}`)
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`)
}
bootstrap()

