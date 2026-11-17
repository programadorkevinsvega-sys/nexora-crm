import { Module } from '@nestjs/common'
import { UsersCoreGrpcController } from './grpc/users-core-grpc.controller'
import { UsersProfileDevicesGrpcController } from './grpc/users-profile-devices-grpc.controller'
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
import { UserRepository } from '../domain/repositories/user.repository'
import { DrizzleUserRepository } from '../infrastructure/drizzle-user.repository'

@Module({
  controllers: [UsersCoreGrpcController, UsersProfileDevicesGrpcController],
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
    { provide: UserRepository, useClass: DrizzleUserRepository },
  ],
  exports: [UserRepository],
})
export class UsersModule {}
