import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { AppModule } from './app.module'

function loadRootEnv(): void {
  const envPath = resolve(__dirname, '../../../.env')
  const loadEnvFile = (process as NodeJS.Process & { loadEnvFile?: (path?: string) => void }).loadEnvFile

  if (typeof loadEnvFile === 'function') {
    loadEnvFile(envPath)
  }
}

loadRootEnv()

function protoPath(): string {
  const candidates = [
    resolve(__dirname, '../../../../packages/contracts/grpc'),
    resolve(__dirname, '../../../packages/contracts/grpc'),
    resolve(__dirname, '../../packages/contracts/grpc'),
    resolve(process.cwd(), 'packages/contracts/grpc'),
    resolve(process.cwd(), '../../packages/contracts/grpc'),
    resolve(process.cwd(), '../packages/contracts/grpc'),
  ]
  for (const c of candidates) {
    if (existsSync(resolve(c, 'common.proto'))) {
      return c
    }
  }
  return resolve(process.cwd(), 'packages', 'contracts', 'grpc')
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableShutdownHooks()

  const grpcPort = process.env.API_CORE_GRPC_PORT || '50059'
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

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  })

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: [
        'crm.common', 'crm.companies', 'crm.contacts', 'crm.pipelines',
        'crm.interactions', 'crm.support_tickets', 'crm.campaigns',
        'crm.contracts', 'crm.sales_teams', 'crm.helpdesk',
        'crm.affiliates', 'crm.personal_crm', 'crm.loyalty', 'crm.tags',
        'crm.auth', 'crm.users', 'crm.tenants', 'crm.iam',
        'crm.notifications', 'crm.audit', 'crm.storage', 'crm.scheduler',
        'crm.automation', 'crm.lead_scoring', 'crm.cpq', 'crm.customer_360', 'crm.inbox',
        'crm.analytics', 'crm.knowledge_base', 'crm.ai', 'crm.developer',
        'crm.social_inbox', 'crm.web_forms', 'crm.meta_leads',
      ],
      protoPath: [
        resolve(protoPath(), 'common.proto'),
        resolve(protoPath(), 'companies.proto'),
        resolve(protoPath(), 'contacts.proto'),
        resolve(protoPath(), 'pipelines.proto'),
        resolve(protoPath(), 'interactions.proto'),
        resolve(protoPath(), 'support-tickets.proto'),
        resolve(protoPath(), 'campaigns.proto'),
        resolve(protoPath(), 'contracts.proto'),
        resolve(protoPath(), 'sales-teams.proto'),
        resolve(protoPath(), 'helpdesk.proto'),
        resolve(protoPath(), 'affiliates.proto'),
        resolve(protoPath(), 'personal-crm.proto'),
        resolve(protoPath(), 'loyalty.proto'),
        resolve(protoPath(), 'tags.proto'),
        resolve(protoPath(), 'auth.proto'),
        resolve(protoPath(), 'users.proto'),
        resolve(protoPath(), 'tenants.proto'),
        resolve(protoPath(), 'iam.proto'),
        resolve(protoPath(), 'notifications.proto'),
        resolve(protoPath(), 'audit.proto'),
        resolve(protoPath(), 'storage.proto'),
        resolve(protoPath(), 'scheduler.proto'),
        resolve(protoPath(), 'automation.proto'),
        resolve(protoPath(), 'lead-scoring.proto'),
        resolve(protoPath(), 'cpq.proto'),
        resolve(protoPath(), 'customer-360.proto'),
        resolve(protoPath(), 'inbox.proto'),
        resolve(protoPath(), 'analytics.proto'),
        resolve(protoPath(), 'knowledge-base.proto'),
        resolve(protoPath(), 'ai.proto'),
        resolve(protoPath(), 'developer.proto'),
        resolve(protoPath(), 'social-inbox.proto'),
        resolve(protoPath(), 'web-forms.proto'),
        resolve(protoPath(), 'meta-leads.proto'),
      ],
      url: `0.0.0.0:${grpcPort}`,
    },
  })

  await app.startAllMicroservices()

  const port = process.env.PORT || 3005
  await app.listen(port)
  console.log(`Monolito Modular API running on port ${port} (gRPC on ${grpcPort})`)
}
bootstrap()
