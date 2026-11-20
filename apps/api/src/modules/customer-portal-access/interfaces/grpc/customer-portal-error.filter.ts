import { Catch, HttpException, RpcExceptionFilter } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { status as GrpcStatus } from '@grpc/grpc-js'
import { Observable, throwError } from 'rxjs'

@Catch()
export class CustomerPortalGrpcErrorFilter implements RpcExceptionFilter<unknown> {
  catch(exception: unknown): Observable<any> {
    let code = GrpcStatus.INTERNAL
    let message = 'Internal server error'

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus()
      const response = exception.getResponse()
      const payload = typeof response === 'string' ? response : response as { message?: unknown }
      const candidate = typeof payload === 'string' ? payload : payload.message
      message = Array.isArray(candidate) ? candidate.join(', ') :
        typeof candidate === 'string' ? candidate : exception.message

      if (statusCode === 400 || statusCode === 422) code = GrpcStatus.INVALID_ARGUMENT
      else if (statusCode === 401) code = GrpcStatus.UNAUTHENTICATED
      else if (statusCode === 403) code = GrpcStatus.PERMISSION_DENIED
      else if (statusCode === 404) code = GrpcStatus.NOT_FOUND
      else if (statusCode === 409) code = GrpcStatus.ALREADY_EXISTS
      else if (statusCode === 429) code = GrpcStatus.RESOURCE_EXHAUSTED
    }

    return throwError(() => new RpcException({ code, message }))
  }
}
