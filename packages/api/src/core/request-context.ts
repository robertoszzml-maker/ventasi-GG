import { AsyncLocalStorage } from 'async_hooks';
import { Request } from 'express';

export class RequestContext {
    private static storage = new AsyncLocalStorage<Request>();

    static get currentRequest(): Request | undefined {
        return this.storage.getStore();
    }

    static get currentUser(): any | undefined {
        return this.currentRequest?.user;
    }

    static run(request: Request, callback: () => void): void {
        this.storage.run(request, callback);
    }
}