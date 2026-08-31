import { Global, Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { UsersGrpcClient } from './users-grpc.client'
import { IamGrpcClient } from './iam-grpc.client'
import { TenantsGrpcClient } from './tenants-grpc.client'

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

function getGrpcUrl(envKey: string): string {
  return process.env[envKey] || process.env.API_CORE_GRPC_URL || `localhost:${process.env.API_CORE_GRPC_PORT || '50059'}`
}

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'USERS_GRPC',
        useFactory: () => ({
          transport: Transport.GRPC,
          options: {
            package: ['crm.common', 'crm.users'],
            protoPath: [resolve(protoPath(), 'common.proto'), resolve(protoPath(), 'users.proto')],
            url: getGrpcUrl('USERS_GRPC_URL'),
          },
        }),
      },
      {
        name: 'IAM_GRPC',
        useFactory: () => ({
          transport: Transport.GRPC,
          options: {
            package: ['crm.common', 'crm.iam'],
            protoPath: [resolve(protoPath(), 'common.proto'), resolve(protoPath(), 'iam.proto')],
            url: getGrpcUrl('IAM_GRPC_URL'),
          },
        }),
      },
      {
        name: 'TENANTS_GRPC',
        useFactory: () => ({
          transport: Transport.GRPC,
          options: {
            package: ['crm.common', 'crm.tenants'],
            protoPath: [resolve(protoPath(), 'common.proto'), resolve(protoPath(), 'tenants.proto')],
            url: getGrpcUrl('TENANTS_GRPC_URL'),
          },
        }),
      },
    ]),
  ],
  providers: [UsersGrpcClient, IamGrpcClient, TenantsGrpcClient],
  exports: [UsersGrpcClient, IamGrpcClient, TenantsGrpcClient, ClientsModule],
})
export class GrpcClientModule {}
