interface DataVerify {
  operationName: string;
  value: string;
}

interface PayloadToken {
  uid: number;
  nombre: string;
  role: number;
}

export interface PayloadTokenWithRefreshToken extends PayloadToken {
  refreshToken: string
}

interface UserWithToken {
  id: number;
  email: string;
  mailAddress?: string;
  active?: number;
  avatar?: string;
  refreshToken?: string;
  accessToken?: string;
  password: string;
  // createdAt: Date;
  // updateAt?: Date;
  // deletedAt?: Date;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface VerifyData {
  [x: string]: boolean;
}

interface ResponseAuth {
  success: boolean;
  message: string;
  state: string;
}

export {
  DataVerify, PayloadToken, ResponseAuth, Tokens, UserWithToken, VerifyData
};

