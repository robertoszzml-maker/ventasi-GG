// Forzar la URL correcta con /v1/ al final
const API_URL = 'http://localhost:3001/v1/';

export const NEXT_PUBLIC_API_URL = API_URL;
export const NEXT_STORE_GLOBAL = process.env.NEXT_PUBLIC_STORE_GLOBAL ?? 'global-store'
export const NEXT_API_APP_NAME = process.env.NEXT_PUBLIC_API_APP_NAME ?? 'app_name'
export const NEXT_API_COOKIE_NAME = process.env.NEXT_PUBLIC_API_COOKIE_NAME ?? 'local_session'
export const NEXT_API_OPTION_NAME = process.env.NEXT_PUBLIC_API_OPTION_NAME ?? 'local_option'
export const NEXT_PUBLIC_API_COOKIE_USER_DATA = process.env.NEXT_PUBLIC_API_COOKIE_USER_DATA ?? 'userData'
export const NEXT_PUBLIC_API_COOKIE_USER_MENU = process.env.NEXT_PUBLIC_API_COOKIE_USER_MENU ?? 'menuData'
export const NEXT_PUBLIC_API_COOKIE_USER_TEAM = process.env.NEXT_PUBLIC_API_COOKIE_USER_TEAM ?? 'teamData'

export const config = {
    apiUrl: API_URL,
    get token() {
        const token = sessionStorage.getItem('tokenAuth')
        return token || ''; // Deberías adaptar esto según cómo gestionas el token
    }
}