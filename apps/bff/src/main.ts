import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import { GrpcToHttpExceptionFilter } from './common/filters/grpc-exception.filter'
import { setupSwagger } from './common/swagger/swagger.config'

const logger = new Logger('BffBootstrap')

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
  app.useGlobalFilters(new GrpcToHttpExceptionFilter())

  const expressInstance = app.getHttpAdapter().getInstance()
  if (expressInstance && typeof expressInstance.disable === 'function') {
    expressInstance.disable('x-powered-by')
  }

  const swaggerActive = setupSwagger(app)

  const port = process.env.BFF_PORT || 3006
  await app.listen(port)
  logger.log(`BFF running on port ${port}`)
  if (swaggerActive) {
    console.log(`Swagger documentation available at http://localhost:${port}/api/docs`)
  } else {
    console.log(`Swagger documentation disabled for this environment.`)
  }
}
bootstrap()
