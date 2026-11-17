import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  RequestQuoteApprovalHandler,
  DecideQuoteApprovalHandler,
  InitiateSignatureHandler,
  VerifySignatureOtpHandler,
  SubmitSignatureHandler,
} from '../../application/commands/cpq.handlers'
import {
  GetQuoteApprovalHandler,
  ListPendingApprovalsHandler,
  GetSignatureByTokenHandler,
} from '../../application/queries/cpq.handlers'
import {
  RequestQuoteApprovalCommand,
  DecideQuoteApprovalCommand,
  InitiateSignatureCommand,
  VerifySignatureOtpCommand,
  SubmitSignatureCommand,
} from '../../application/commands/cpq.commands'
import {
  ListPendingApprovalsQuery,
  GetSignatureByTokenQuery,
} from '../../application/queries/cpq.queries'
import { CpqMapper } from '../../infrastructure/cpq.mapper'

@Controller()
export class CpqApprovalsSignaturesGrpcController {
  constructor(
    private readonly requestApprovalHandler: RequestQuoteApprovalHandler,
    private readonly decideApprovalHandler: DecideQuoteApprovalHandler,
    private readonly initiateSignatureHandler: InitiateSignatureHandler,
    private readonly verifyOtpHandler: VerifySignatureOtpHandler,
    private readonly submitSignatureHandler: SubmitSignatureHandler,
    private readonly getQuoteApprovalHandler: GetQuoteApprovalHandler,
    private readonly listPendingApprovalsHandler: ListPendingApprovalsHandler,
    private readonly getSignatureByTokenHandler: GetSignatureByTokenHandler,
  ) {}

  @GrpcMethod('CpqService', 'RequestQuoteApproval')
  async requestQuoteApproval(data: {
    tenantId: string
    quoteId: string
    requestedDiscountPercent: number
    requestedByUserId: string
  }) {
    const res = await this.requestApprovalHandler.execute(
      new RequestQuoteApprovalCommand(
        data.tenantId,
        data.quoteId,
        data.requestedDiscountPercent,
        data.requestedByUserId,
      ),
    )
    return { json: JSON.stringify({ id: res.id, status: 'PENDING' }) }
  }

  @GrpcMethod('CpqService', 'DecideQuoteApproval')
  async decideQuoteApproval(data: {
    tenantId: string
    approvalId: string
    approverUserId: string
    status: 'APPROVED' | 'REJECTED'
    rejectionReason?: string
  }) {
    const approval = await this.decideApprovalHandler.execute(
      new DecideQuoteApprovalCommand(
        data.tenantId,
        data.approvalId,
        data.approverUserId,
        data.status,
        data.rejectionReason,
      ),
    )
    return { json: JSON.stringify(CpqMapper.approvalToResponse(approval)) }
  }

  @GrpcMethod('CpqService', 'ListPendingApprovals')
  async listPendingApprovals(data: { tenantId: string }) {
    const approvals = await this.listPendingApprovalsHandler.execute(
      new ListPendingApprovalsQuery(data.tenantId),
    )
    return {
      jsonItems: approvals.map((a) => JSON.stringify(CpqMapper.approvalToResponse(a))),
    }
  }

  @GrpcMethod('CpqService', 'InitiateSignature')
  async initiateSignature(data: {
    tenantId: string
    documentId: string
    signerName: string
    signerEmail: string
    documentType?: 'QUOTE' | 'CONTRACT'
    signerPhone?: string
    expiresInDays?: number
  }) {
    const signature = await this.initiateSignatureHandler.execute(
      new InitiateSignatureCommand(
        data.tenantId,
        data.documentId,
        data.signerName,
        data.signerEmail,
        data.documentType,
        data.signerPhone,
        data.expiresInDays,
      ),
    )
    return { json: JSON.stringify(CpqMapper.signatureToResponse(signature)) }
  }

  @GrpcMethod('CpqService', 'VerifySignatureOtp')
  async verifySignatureOtp(data: { token: string; otpCode: string }) {
    await this.verifyOtpHandler.execute(
      new VerifySignatureOtpCommand(data.token, data.otpCode),
    )
    return {}
  }

  @GrpcMethod('CpqService', 'SubmitSignature')
  async submitSignature(data: {
    token: string
    signatureDataUrl: string
    signerIp?: string
    signerUserAgent?: string
    documentHashSha256?: string
  }) {
    const signed = await this.submitSignatureHandler.execute(
      new SubmitSignatureCommand(
        data.token,
        data.signatureDataUrl,
        data.signerIp,
        data.signerUserAgent,
        data.documentHashSha256,
      ),
    )
    return { json: JSON.stringify(CpqMapper.signatureToResponse(signed)) }
  }

  @GrpcMethod('CpqService', 'GetSignatureByToken')
  async getSignatureByToken(data: { token: string }) {
    const signature = await this.getSignatureByTokenHandler.execute(
      new GetSignatureByTokenQuery(data.token),
    )
    return { json: JSON.stringify(CpqMapper.signatureToResponse(signature)) }
  }
}
