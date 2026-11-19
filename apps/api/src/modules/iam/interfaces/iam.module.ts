import { Module } from '@nestjs/common'
import { UsersModule } from '../../users/module.public-api'
import { IamGrpcController } from './grpc/iam-grpc.controller'
import {
  CreateRoleHandler, UpdateRoleHandler, DeleteRoleHandler,
  CreatePermissionHandler,
  AssignPermissionHandler, RemovePermissionHandler,
  AssignRoleHandler, RemoveRoleHandler,
} from '../application/commands/iam.handlers'
import {
  GetRoleHandler, ListRolesHandler,
  ListPermissionsHandler, ListRolePermissionsHandler,
  ListUserRolesHandler, CheckPermissionHandler, GetUserPermissionsHandler,
} from '../application/queries/iam.handlers'
import { IamRepository } from '../domain/repositories/iam.repository'
import { DrizzleIamRepository } from '../infrastructure/drizzle-iam.repository'

@Module({
  imports: [UsersModule],
  controllers: [IamGrpcController],
  providers: [
    CreateRoleHandler,
    UpdateRoleHandler,
    DeleteRoleHandler,
    CreatePermissionHandler,
    AssignPermissionHandler,
    RemovePermissionHandler,
    AssignRoleHandler,
    RemoveRoleHandler,
    GetRoleHandler,
    ListRolesHandler,
    ListPermissionsHandler,
    ListRolePermissionsHandler,
    ListUserRolesHandler,
    CheckPermissionHandler,
    GetUserPermissionsHandler,
    { provide: IamRepository, useClass: DrizzleIamRepository },
  ],
  exports: [IamRepository],
})
export class IamModule {}
