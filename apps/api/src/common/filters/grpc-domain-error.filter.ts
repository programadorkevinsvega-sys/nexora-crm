import { Catch, RpcExceptionFilter } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { RpcException } from '@nestjs/microservices'
import { status as GrpcStatus } from '@grpc/grpc-js'
import { DomainError, NotFoundError, ConflictError, UnauthorizedError, ForbiddenError } from '@crm/shared'

@Catch(DomainError)
export class GrpcDomainErrorFilter implements RpcExceptionFilter<DomainError> {
  catch(exception: DomainError): Observable<any> {
    let code = GrpcStatus.UNKNOWN
    if (exception instanceof NotFoundError) code = GrpcStatus.NOT_FOUND
    else if (exception instanceof ConflictError) code = GrpcStatus.ALREADY_EXISTS
    else if (exception instanceof UnauthorizedError) code = GrpcStatus.UNAUTHENTICATED
    else if (exception instanceof ForbiddenError) code = GrpcStatus.PERMISSION_DENIED
    else code = GrpcStatus.INVALID_ARGUMENT

    return throwError(() => new RpcException({ code, message: exception.message }))
  }
}
