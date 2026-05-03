import { config, NEXT_API_APP_NAME } from '@/config';

interface IRefreshTokenResponse {
  success: boolean;
  message: string;
  statusCode?: number;
  data: {
    token: string
  },
}

export const refreshToken = async () => {
  const sessionStorage = localStorage.getItem('session-token')
  const headers: HeadersInit = {
    'Authorization': `Bearer ${sessionStorage}`,
    'app': NEXT_API_APP_NAME,
  };
  const options: RequestInit = {
    method: 'GET',
    headers,
  };
  const data = await fetch(`${config.apiUrl}auth/refresh`, options);
  return await data.json();
};