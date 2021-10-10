export interface EmailAccount {
  email: string;
}
export interface PhoneAccount {
  number: string;
  country: string;
}
export interface ThirdPartyAccount {
  google_access_code?: string;
  weixin_access_code?: string;
}
export interface SecurityConfig {
  SPEnabled: number;
  emailExist: number;
  emailVerified: number;
  phoneVerified: number;
}
export interface UserToken {
  access_token: string;
  isset_password: number;
}
export interface UserInfo {
  id?: string;
  name?: string;
  avatar?: string;
  phone_num?: string;
  phone_area?: string;
  email?: string;
  hid?: string;
  isTrader?: number;
  level?: number;
  login_google_verify?: number;
  login_phone_verify?: number;
  securityConfig?: SecurityConfig;
  anti_code?: string;
  google_bind_status?: number;
  google_verify_status?: number;
  transfer_sms_status?: number;
  kyc?: any;
  access_token?: string;
  isset_password?: number;
}
export interface IUserAPIService {
  setToken: (tken: UserToken, exprie_at: string) => void;
  setSocketToken: (token: UserToken, exprie_at: string) => void;
  update: (user: UserInfo, token?:UserToken) => void;
  updateProfile: () => void;
}
export type User = UserInfo | null | 0;