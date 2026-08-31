import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { DomainError, NotFoundError, ConflictError, UnauthorizedError, ForbiddenError } from '@crm/shared'

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
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
