import { get, post } from '../frame/utils/http';
import { createRSA } from '../frame/utils/RSA';
import { JSEncrypt } from 'jsencrypt';
import { getOSInfo, getBrowserInfo } from '../frame/utils/tools';
import { Auth } from '../frame/utils/auth';
import { enviroment } from '../enviroments/enviroment';

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
  const rsa: any = await createRSA();
  const publicKey = '-----BEGIN PUBLIC KEY-----\n' + rsa.publicKey + '\n-----END PUBLIC KEY-----';
  const wordArray = Utf8.parse(publicKey);
  return post(url, { body: { user_id, pub_key: Base64.stringify(wordArray) } })
}

export const getRobotCheck = () => {
  return get(`/proxy/v2/system/common/get_robot_check_pre`);
};

export const isNeedDoubleVerify = (params: {
  type: 'email'| 'phone_num';
  username: string;
}) => {
  return post(`/proxy/v2/user/account/m_login_verify_setting`, { body: params });
};

export const setDeviceInfo = () => {
  const params = {
    plateform: getOSInfo(),
    //@ts-ignore
    uuid: window['deviceid'] || 'bitkan-trade',
    model: getBrowserInfo(),
  };
  return post(`/proxy/v2/user/account/m_set_device_info`, {body: params});
};


export const generateSocketToken = () => {
  const url = `/proxy/v2/user/account/m_generate_socket_token`;
  return {
    key: url,
    promise: () => post(url, {
			//@ts-ignore
      body: {device_id: window['deviceid'] || 'bitkan-trade'}
    })
  }
};

export const signIn = async (reqUser: any, isSecondVerify = 0) => {
  const type = reqUser.phoneNumber ? 2 : 1;
  const id = type === 2 ? (reqUser.areaCode.replace("+", "00") + reqUser.phoneNumber) : reqUser.email;
  const rsa: any = await createRSA();
  const publicKey = '-----BEGIN PUBLIC KEY-----\n' + rsa.publicKey + '\n-----END PUBLIC KEY-----';
  const wordArray = Utf8.parse(publicKey);

  const geetObj = reqUser.geetest_challenge? {geetest_challenge: reqUser.geetest_challenge, geetest_validate: reqUser.geetest_validate, geetest_seccode: reqUser.geetest_seccode } :{};
  const verifyCode = (reqUser.sms_code || reqUser.ga_code || reqUser.email_code) ? (reqUser.sms_code ?{sms_code:reqUser.sms_code}: reqUser.ga_code ? {ga_code:reqUser.ga_code} : {email_code:reqUser.email_code}):{};
  const params = Object.assign({
    msgId: 0,
    access: { type, id },
    esign: Object.assign(JSON.parse(JSON.stringify(verifyCode)), { p: reqUser.password }, JSON.parse(JSON.stringify(geetObj))),
    token_publick: Base64.stringify(wordArray),
  }, verifyCode, geetObj);

  const loginUrl = !isSecondVerify ? `/proxy/v2/user/account/w_login` : `/proxy/v2/user/account/w_second_verify_login` ;
  return post(loginUrl, { body: params }).then(response => {
    if(response.code && response.code !== 0){
      return response;
    }
    //@ts-ignore
    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(rsa.privateKey);
    response.user.access_token = decrypt.decrypt(response.user.access_token);
    return response;
  })
};

export const queryPhoneCode = (params: any) => {
  let params1 = Object.assign({ time: Math.floor(new Date().getTime() / 1000) + '' }, params);
  let signatureArr: any[] = [];
  for(const key in params1){
    if(key){
      signatureArr.push(params1[key]);
    }
  };
  signatureArr = signatureArr.sort();
  const signature = Auth.HmacSHA256(JSON.stringify(signatureArr), enviroment.verifySalt);
  params1 = Object.assign({signature: signature}, params1);
  return post(`/proxy/v2/user/account/m_get_phone_code`, {body: params1});
};

//邮箱验证码：邮箱注册/忘记密码(需要人机校验)
export const getEmailVerifyCode = (params: any) => {
  return post(`/proxy/v2/user/account/w_get_email_verify_code`, {body: params});
}
