import { get, post } from 'frame/utils/http';
import { createRSA } from 'frame/utils/RSA';

export const getOTCPairs = (lang = 'zh') => {
  const url = `/proxy/v2/otc/index/m_pairs?local=${lang}`;
  return {
    key: url,
    promise: () => get(url),
  };
};

export const queryADPrice = (params: {
  adId: string,
  shift_account: 1| 0,
}) => {
  const url = `/proxy/v2/otc/order/m_inquire_ad_price`;
  return {
    key: url,
    promise: () => post(url, { body: params })
  }
};

export const addOTCOrder = (params: {
  userid: string;
  access_token: string;
  hash: string;             // 询价hash
  type: string;             // 1 按额买 2 按量买
  value: string;
  paymentType?: string;     // 买单 paymentType 必须 卖单 可以不传
  safePw?: string;
}) => {
  params = JSON.parse(JSON.stringify(params));
  const esign: any = { token: params.access_token };
  if(params.safePw){
    esign.sp = params.safePw;
  };
  const paramsObj: any ={
    hash: params.hash,
    type: params.type,
    value: params.value,
    paymentType: params.paymentType,
    access: { type: 0, id: params.userid },
    shift_account: 1,
    esign,
  };
  const url = `/proxy/v2/otc/order/m_place_ad_order`;
  return {
    key: url,
    promise: () => post(url, { body: paramsObj })
  }
}