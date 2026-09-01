import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { status as GrpcStatus } from '@grpc/grpc-js'
import { throwError } from 'rxjs'
import { Response } from 'express'
import { DomainError, NotFoundError, ConflictError, UnauthorizedError, ForbiddenError } from '@crm/shared'

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    if (host.getType() === 'rpc') {
      let code = GrpcStatus.UNKNOWN
      if (exception instanceof NotFoundError) code = GrpcStatus.NOT_FOUND
      else if (exception instanceof ConflictError) code = GrpcStatus.ALREADY_EXISTS
      else if (exception instanceof UnauthorizedError) code = GrpcStatus.UNAUTHENTICATED
      else if (exception instanceof ForbiddenError) code = GrpcStatus.PERMISSION_DENIED
      else code = GrpcStatus.INVALID_ARGUMENT

      return throwError(() => new RpcException({ code, message: exception.message }))
    }

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = this.getStatus(exception)

    response.status(status).json({
      error: 'domain_error',
      code: exception.code,
      message: exception.message,
    })
  }

  private getStatus(error: DomainError): number {
    if (error instanceof NotFoundError) return HttpStatus.NOT_FOUND
    if (error instanceof ConflictError) return HttpStatus.CONFLICT
    if (error instanceof UnauthorizedError) return HttpStatus.UNAUTHORIZED
    if (error instanceof ForbiddenError) return HttpStatus.FORBIDDEN
    return HttpStatus.UNPROCESSABLE_ENTITY
  }
}
