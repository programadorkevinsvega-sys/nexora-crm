import { Module } from '@nestjs/common'
import { UsersCoreGrpcController } from './grpc/users-core-grpc.controller'
import { UsersProfileDevicesGrpcController } from './grpc/users-profile-devices-grpc.controller'
import { UsersInvitationsGrpcController } from './grpc/users-invitations.grpc.controller'
import {
  CreateUserHandler, UpdateUserHandler, DeleteUserHandler,
  UpdateNaturalPersonProfileHandler, UpdateLegalEntityProfileHandler,
  LinkOAuthHandler, UnlinkOAuthHandler,
  RegisterDeviceHandler, UpdateDeviceHandler, RemoveDeviceHandler,
} from '../application/commands/user.handlers'
import {
  GetUserHandler, FindByEmailHandler, ListUsersHandler,
  GetProfileHandler, ListOAuthLinksHandler, ListDevicesHandler,
} from '../application/queries/user.handlers'
import {
  CreateInvitationHandler, ListInvitationsHandler, RevokeInvitationHandler,
  ResendInvitationHandler, PrepareInvitationAcceptanceHandler,
  CompleteInvitationAcceptanceHandler,
} from '../application/commands/invitation.handlers'
import { GetInvitationByTokenHandler } from '../application/commands/invitation.handlers'
import { UserRepository } from '../domain/repositories/user.repository'
import { UserInvitationRepository } from '../domain/repositories/user-invitation.repository'
import { DrizzleUserRepository } from '../infrastructure/drizzle-user.repository'
import { DrizzleUserInvitationRepository } from '../infrastructure/drizzle-user-invitation.repository'

@Module({
  controllers: [
    UsersCoreGrpcController,
    UsersProfileDevicesGrpcController,
    UsersInvitationsGrpcController,
  ],
  providers: [
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    UpdateNaturalPersonProfileHandler,
    UpdateLegalEntityProfileHandler,
    LinkOAuthHandler,
    UnlinkOAuthHandler,
    RegisterDeviceHandler,
    UpdateDeviceHandler,
    RemoveDeviceHandler,
    GetUserHandler,
    FindByEmailHandler,
    ListUsersHandler,
    GetProfileHandler,
    ListOAuthLinksHandler,
    ListDevicesHandler,
    CreateInvitationHandler,
    ListInvitationsHandler,
    RevokeInvitationHandler,
    ResendInvitationHandler,
    GetInvitationByTokenHandler,
    PrepareInvitationAcceptanceHandler,
    CompleteInvitationAcceptanceHandler,
    { provide: UserRepository, useClass: DrizzleUserRepository },
    { provide: UserInvitationRepository, useClass: DrizzleUserInvitationRepository },
  ],
  exports: [UserRepository, UserInvitationRepository],
})
export class UsersModule {}
