import { get, post } from '../frame/utils/http';

const Utf8 = require('crypto-js/enc-utf8');
const Base64 = require('crypto-js/enc-base64');

export const getProfile = () => {
  const url = `proxy/v2/user/account/m_profile`;
  return {
    key: url,
    promise: () => get(url),
  }
}

export const logout = () => {
  return post(`/proxy/account/m_logout`, { body: {} })
}

export const getUserProfile = (uid?: string) => {
  return get(`/proxy/tribe/user/get_user_info`, { body: uid ? { params: { uid: uid } } : {}})
}

export const setPubkey = async (user_id: string) => {
  const url = `/proxy/v2/chat/user/set_pub_key`;
  // const rsa: any = await 
}