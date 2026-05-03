// // src/common/interceptors/request.interceptor.ts

// import {
//     Injectable,
//     NestInterceptor,
//     ExecutionContext,
//     CallHandler,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';

// @Injectable()
// export class RequestInterceptor implements NestInterceptor {
//     intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//         const request = context.switchToHttp().getRequest();
//         // Guardamos el req en el contexto global
//         globalThis.req = request;  // Acceso global a req
//         return next.handle();
//     }
// }

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContext } from '../core/request-context';  // Asegúrate de crear esta ruta

@Injectable()
export class RequestInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // Usamos AsyncLocalStorage en lugar de globalThis
        return new Observable((observer) => {
            RequestContext.run(request, () => {
                next.handle().subscribe({
                    next: (value) => observer.next(value),
                    error: (err) => observer.error(err),
                    complete: () => observer.complete(),
                });
            });
        });
    }
}