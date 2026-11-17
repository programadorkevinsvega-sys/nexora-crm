import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { ApiCoreGrpcClient } from './api-core-grpc.client'

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

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'API_CORE_GRPC',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const apiCoreGrpcUrl = configService.get<string>('API_CORE_GRPC_URL')
          if (!apiCoreGrpcUrl) {
            throw new Error('API_CORE_GRPC_URL is required')
          }

          return {
            transport: Transport.GRPC,
            options: {
              package: [
                'crm.common', 'crm.companies', 'crm.contacts', 'crm.pipelines',
                'crm.interactions', 'crm.support_tickets', 'crm.campaigns',
                'crm.contracts', 'crm.sales_teams', 'crm.helpdesk',
                'crm.affiliates', 'crm.personal_crm', 'crm.loyalty', 'crm.tags',
                'crm.automation', 'crm.lead_scoring', 'crm.cpq', 'crm.customer_360', 'crm.inbox',
                'crm.analytics', 'crm.knowledge_base', 'crm.ai', 'crm.developer', 'crm.audit',
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
                resolve(protoPath(), 'automation.proto'),
                resolve(protoPath(), 'lead-scoring.proto'),
                resolve(protoPath(), 'cpq.proto'),
                resolve(protoPath(), 'customer-360.proto'),
                resolve(protoPath(), 'inbox.proto'),
                resolve(protoPath(), 'analytics.proto'),
                resolve(protoPath(), 'knowledge-base.proto'),
                resolve(protoPath(), 'ai.proto'),
                resolve(protoPath(), 'developer.proto'),
                resolve(protoPath(), 'audit.proto'),
                resolve(protoPath(), 'social-inbox.proto'),
                resolve(protoPath(), 'web-forms.proto'),
                resolve(protoPath(), 'meta-leads.proto'),
              ],
              url: apiCoreGrpcUrl,
            },
          }
        },
      },
      {
        name: 'AUTH_GRPC',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const authGrpcUrl = configService.get<string>('AUTH_GRPC_URL') || configService.get<string>('API_CORE_GRPC_URL') || 'localhost:50059'
          return {
            transport: Transport.GRPC,
            options: {
              package: ['crm.common', 'crm.auth'],
              protoPath: [resolve(protoPath(), 'common.proto'), resolve(protoPath(), 'auth.proto')],
              url: authGrpcUrl,
            },
          }
        },
      },
    ]),
  ],
  providers: [ApiCoreGrpcClient],
  exports: [ApiCoreGrpcClient, ClientsModule],
})
export class GrpcClientModule {}
