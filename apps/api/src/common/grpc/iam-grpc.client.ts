/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { Inject } from '@nestjs/common'
import { lastValueFrom, Observable } from 'rxjs'

interface IamGrpcService {
  checkPermission(data: any): Observable<{ allowed: boolean }>
  getUserRoles(data: any): Observable<{ jsonItems: string[]; nextCursor?: string }>
}

@Injectable()
export class IamGrpcClient implements OnModuleInit {
  private readonly logger = new Logger(IamGrpcClient.name)
  private service!: IamGrpcService
  constructor(@Inject('IAM_GRPC') private readonly client: ClientGrpc) {}
  onModuleInit(): void { this.service = this.client.getService<IamGrpcService>('IamService') }
  async checkPermission(tenantId: string, userId: string, permission: string): Promise<{ allowed: boolean }> {
    try { const res = await lastValueFrom(this.service.checkPermission({ tenantId, userId, permission })); return { allowed: res?.allowed ?? false } }
    catch { return { allowed: false } }
  }
  async getUserRoles(tenantId: string, userId: string): Promise<any[]> {
    try { const res = await lastValueFrom(this.service.getUserRoles({ tenantId, userId })); return res?.jsonItems?.map((j: string) => JSON.parse(j)) ?? [] }
    catch { return [] }
  }
}
