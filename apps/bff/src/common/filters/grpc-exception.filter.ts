import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'

interface GrpcExceptionShape {
  message?: unknown
  code?: unknown
  stack?: unknown
}

function exceptionShape(value: unknown): GrpcExceptionShape {
  if (typeof value !== 'object' || value === null) return {}
  return value as GrpcExceptionShape
}

@Catch()
export class GrpcToHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcToHttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      return response.status(status).json(exception.getResponse())
    }

    const grpcError = exceptionShape(exception)
    const message = typeof grpcError.message === 'string' ? grpcError.message : 'Internal server error'
    const code = typeof grpcError.code === 'number' ? grpcError.code : undefined
    const stack = typeof grpcError.stack === 'string' ? grpcError.stack : undefined
    const lowerMessage = message.toLowerCase()

    let status = HttpStatus.INTERNAL_SERVER_ERROR

    if (lowerMessage.includes('not found') || code === 5) {
      status = HttpStatus.NOT_FOUND
    } else if (lowerMessage.includes('already exists') || code === 6) {
      status = HttpStatus.CONFLICT
    } else if (lowerMessage.includes('unauthorized') || code === 16) {
      status = HttpStatus.UNAUTHORIZED
    } else if (lowerMessage.includes('forbidden') || code === 7) {
      status = HttpStatus.FORBIDDEN
    } else if (
      lowerMessage.includes('invalid') ||
      lowerMessage.includes('bad request') ||
      code === 3
    ) {
      status = HttpStatus.BAD_REQUEST
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`Unhandled error: ${message}`, stack)
    }

    return response.status(status).json({
      statusCode: status,
      message: message.replace(/^\d+\s+[A-Z_]+:\s*/, ''),
      timestamp: new Date().toISOString(),
    })
  }
}
