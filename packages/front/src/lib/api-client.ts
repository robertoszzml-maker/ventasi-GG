// src/utils/fetchClient.ts
import { config, NEXT_API_APP_NAME } from '@/config';

import { refreshToken } from "./auth.service";
import { triggerToast } from './toast'
import { ApiError } from './api-error'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Creamos una función que gestione las configuraciones globales
const fetchClient = async <T>(
    endpoint: string,
    method: Method,
    body?: T,
): Promise<T> => {
    let response;

    // Leer token fresco de sessionStorage cada vez
    const token = sessionStorage.getItem('tokenAuth') || '';

    const headers: HeadersInit = {
        'Authorization': `Bearer ${token.trim()}`,
        'app': NEXT_API_APP_NAME,
    };

    const options: RequestInit = {
        method,
        headers,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    };
    if (!(body instanceof FormData) && body != null) {
        headers['Content-Type'] = 'application/json';
    }
    response = await fetch(`${config.apiUrl}${endpoint}`, options);
    if (response.status === 409) {
        triggerToast({
            title: 'Conflicto',
            description: 'El recurso no puede ser eliminado porque está en uso.',
            variant: 'destructive'
        })
    }
    if (response.status === 403) {
        triggerToast({
            title: 'Acceso denegado',
            description: 'No tienes permisos para realizar esta acción.',
            variant: 'destructive'
        })
    }
    if ((response.status === 401 || response.status === 403) && endpoint !== 'auth/refresh') {

        const result = await refreshToken()
        if (result?.success && result?.data?.authToken) {
            headers['Authorization'] = `Bearer ${result.data.authToken}`
            sessionStorage.setItem('tokenAuth', result?.data?.authToken)
            localStorage.setItem('session-token', result?.data?.sessionToken)
        } else {
            window.location.href = "/login";
        }
        response = await fetch(`${config.apiUrl}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new ApiError(error?.message || `Error en la solicitud a ${endpoint}`, response.status)
        }
    } else if ((response.status === 401 || response.status === 403) && endpoint === 'auth/refresh') {
        sessionStorage.setItem('tokenAuth', '')
        window.location.href = "/login";
    }

    //TODO: No me captura todos los errores
    if (!response.ok) {
        const error = await response.json();
        throw new ApiError(error?.message || `Error en la solicitud a ${endpoint}`, response.status)
    }
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
        return response.json() as T;
    } else {
        return response.blob() as unknown as T;
    }
};

export default fetchClient;
