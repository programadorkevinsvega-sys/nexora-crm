import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class GrpcToHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcToHttpExceptionFilter.name)

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      return response.status(status).json(exception.getResponse())
    }

    const message = exception?.message || 'Internal server error'
    const lowerMessage = message.toLowerCase()

    let status = HttpStatus.INTERNAL_SERVER_ERROR

    if (lowerMessage.includes('not found') || exception?.code === 5) {
      status = HttpStatus.NOT_FOUND
    } else if (lowerMessage.includes('already exists') || exception?.code === 6) {
      status = HttpStatus.CONFLICT
    } else if (lowerMessage.includes('unauthorized') || exception?.code === 16) {
      status = HttpStatus.UNAUTHORIZED
    } else if (lowerMessage.includes('forbidden') || exception?.code === 7) {
      status = HttpStatus.FORBIDDEN
    } else if (
      lowerMessage.includes('invalid') ||
      lowerMessage.includes('bad request') ||
      exception?.code === 3
    ) {
      status = HttpStatus.BAD_REQUEST
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`Unhandled error: ${message}`, exception?.stack)
    }

    return response.status(status).json({
      statusCode: status,
      message: message.replace(/^\d+\s+[A-Z_]+:\s*/, ''),
      timestamp: new Date().toISOString(),
    })
  }
}
