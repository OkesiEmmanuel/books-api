import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface Response {
    message?: string;
    data?: any;
}

@Injectable()
export class ResponseInterceptor<T extends Response> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
        return next.handle().pipe(
            map((data) => ({
                status: 'success',
                message: data?.message ?? 'Request successful.',
                data: data?.data ?? data ?? null,
            })),
        );
    }
}
