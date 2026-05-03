// export const getUser = () => globalThis.req?.user;  // Accede al req desde el contexto global
import { RequestContext } from '../core/request-context';

export const getUser = () => {
    return RequestContext.currentUser;  // Accedemos desde el contexto seguro
};