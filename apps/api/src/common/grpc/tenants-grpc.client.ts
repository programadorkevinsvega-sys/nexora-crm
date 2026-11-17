/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { Inject } from '@nestjs/common'
import { lastValueFrom, Observable } from 'rxjs'

interface TenantGrpcService {
  getById(data: any): Observable<{ json: string }>
  validateTenant(data: any): Observable<{ valid: boolean }>
}

@Injectable()
export class TenantsGrpcClient implements OnModuleInit {
  private readonly logger = new Logger(TenantsGrpcClient.name)
  private service!: TenantGrpcService
  constructor(@Inject('TENANTS_GRPC') private readonly client: ClientGrpc) {}
  onModuleInit(): void { this.service = this.client.getService<TenantGrpcService>('TenantService') }
  async getById(id: string): Promise<any | null> {
    try { const res = await lastValueFrom(this.service.getById({ id })); return res?.json ? JSON.parse(res.json) : null }
    catch (error: any) { this.logger.error(`gRPC tenant getById failed: ${error.message}`); return null }
  }
  async validateTenant(tenantId: string): Promise<boolean> {
    try { const res = await this.getById(tenantId); return res !== null && res.isActive !== false }
    catch { return false }
  }
}
