import { Module, Logger } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthLoginGrpcController } from './grpc/auth-login-grpc.controller'
import { AuthMfaSecurityGrpcController } from './grpc/auth-mfa-security-grpc.controller'
import { AuthHttpController } from './http/auth-http.controller'
import { RegisterHandler } from '../application/commands/register.handler'
import {
  LoginHandler, RefreshTokenHandler, LogoutHandler, ChangePasswordHandler,
  SetupMfaHandler, VerifyMfaHandler, GetRecoveryCodesHandler, RegenerateRecoveryCodesHandler,
  UpdatePasswordPolicyHandler, CreateIpRestrictionHandler, DeleteIpRestrictionHandler,
  RevokeSessionHandler, CreateOAuthProviderHandler, DeleteOAuthProviderHandler,
  UserLookupService,
} from '../application/commands/auth.handlers'
import {
  GetPasswordPolicyHandler, ListSessionsHandler, ListIpRestrictionsHandler,
  ListOAuthProvidersHandler, VerifyTokenHandler,
} from '../application/queries/auth.handlers'
import { AuthRepository } from '../domain/repositories/auth.repository'
import { DrizzleAuthRepository } from '../infrastructure/drizzle-auth.repository'
import { GrpcUserLookupService } from '../infrastructure/grpc-user-lookup.service'

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET
        if (!secret) {
          Logger.error('JWT_SECRET environment variable is required', 'AuthModule')
          throw new Error('JWT_SECRET environment variable is required')
        }
        return { secret, signOptions: { expiresIn: '15m' } }
      },
    }),
  ],
  controllers: [AuthLoginGrpcController, AuthMfaSecurityGrpcController, AuthHttpController],
  providers: [
    RegisterHandler,
    LoginHandler,
    RefreshTokenHandler,
    LogoutHandler,
    ChangePasswordHandler,
    SetupMfaHandler,
    VerifyMfaHandler,
    GetRecoveryCodesHandler,
    RegenerateRecoveryCodesHandler,
    UpdatePasswordPolicyHandler,
    CreateIpRestrictionHandler,
    DeleteIpRestrictionHandler,
    RevokeSessionHandler,
    CreateOAuthProviderHandler,
    DeleteOAuthProviderHandler,
    GetPasswordPolicyHandler,
    ListSessionsHandler,
    ListIpRestrictionsHandler,
    ListOAuthProvidersHandler,
    VerifyTokenHandler,
    { provide: AuthRepository, useClass: DrizzleAuthRepository },
    { provide: UserLookupService, useClass: GrpcUserLookupService },
  ],
  exports: [AuthRepository, JwtModule, UserLookupService],
})
export class AuthModule {}
