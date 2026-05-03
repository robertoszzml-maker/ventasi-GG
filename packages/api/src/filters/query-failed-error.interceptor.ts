import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { FastifyReply } from 'fastify';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
    catch(exception: QueryFailedError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();

        const mysqlMessage = (exception as any).message;


        if (mysqlMessage.includes('Cannot delete or update a parent row')) {
            return response.status(HttpStatus.CONFLICT).send({
                statusCode: HttpStatus.CONFLICT,
                message: 'El recurso no puede ser eliminado porque está en uso.',
                error: 'ForeignKeyConstraintViolation',
                details: mysqlMessage
            });
        }

        // Otro error SQL
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: mysqlMessage,
        });
    }
}