import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateInvitationHandler,
  CreateInvitationCommand,
  ListInvitationsHandler,
  ListInvitationsCommand,
  RevokeInvitationHandler,
  RevokeInvitationCommand,
  ResendInvitationHandler,
  ResendInvitationCommand,
  PrepareInvitationAcceptanceHandler,
  PrepareInvitationAcceptanceCommand,
  CompleteInvitationAcceptanceHandler,
  CompleteInvitationAcceptanceCommand,
} from '../../application/commands/invitation.handlers'
import {
  GetInvitationByTokenHandler,
  GetInvitationByTokenQuery,
} from '../../application/commands/invitation.handlers'

@Controller()
export class UsersInvitationsGrpcController {
  constructor(
    private readonly createHandler: CreateInvitationHandler,
    private readonly listHandler: ListInvitationsHandler,
    private readonly revokeHandler: RevokeInvitationHandler,
    private readonly resendHandler: ResendInvitationHandler,
    private readonly getByTokenHandler: GetInvitationByTokenHandler,
    private readonly prepareAcceptanceHandler: PrepareInvitationAcceptanceHandler,
    private readonly completeAcceptanceHandler: CompleteInvitationAcceptanceHandler,
  ) {}

  @GrpcMethod('UserService', 'CreateInvitation')
  async create(data: { tenantId: string; email: string; roleId: string; invitedBy: string }) {
    const result = await this.createHandler.execute(
      new CreateInvitationCommand(data.tenantId, data.email, data.roleId, data.invitedBy),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('UserService', 'ListInvitations')
  async list(data: { tenantId: string }) {
    const result = await this.listHandler.execute(new ListInvitationsCommand(data.tenantId))
    return { jsonItems: result.map((item) => JSON.stringify(item)) }
  }

  @GrpcMethod('UserService', 'RevokeInvitation')
  async revoke(data: { tenantId: string; invitationId: string }) {
    const result = await this.revokeHandler.execute(
      new RevokeInvitationCommand(data.tenantId, data.invitationId),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('UserService', 'ResendInvitation')
  async resend(data: { tenantId: string; invitationId: string }) {
    const result = await this.resendHandler.execute(
      new ResendInvitationCommand(data.tenantId, data.invitationId),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('UserService', 'GetInvitationByToken')
  async getByToken(data: { token: string }) {
    const result = await this.getByTokenHandler.execute(new GetInvitationByTokenQuery(data.token))
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('UserService', 'PrepareInvitationAcceptance')
  async prepareAcceptance(data: {
    token: string
    firstName: string
    lastName: string
    password: string
  }) {
    const result = await this.prepareAcceptanceHandler.execute(
      new PrepareInvitationAcceptanceCommand(data.token, data.firstName, data.lastName, data.password),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('UserService', 'CompleteInvitationAcceptance')
  async completeAcceptance(data: { tenantId: string; invitationId: string; userId: string }) {
    const result = await this.completeAcceptanceHandler.execute(
      new CompleteInvitationAcceptanceCommand(data.tenantId, data.invitationId, data.userId),
    )
    return { json: JSON.stringify(result) }
  }
}
