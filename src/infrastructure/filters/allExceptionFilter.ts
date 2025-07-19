import { ExceptionFilter, Catch, ArgumentsHost, HttpException, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        console.error("❌ Unhandled Exception:", exception);

        if (exception instanceof HttpException) {
            response.status(exception.getStatus()).json(exception.getResponse());
        } else {
            response.status(500).json({
                statusCode: 500,
                message: 'Internal Server Error',
            });
        }
    }
}