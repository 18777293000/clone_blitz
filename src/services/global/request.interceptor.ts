import { addMiddlewareForHTTP, HttpOptions } from '../../frame/utils/http';
import { bkEventServiceFactory } from '../../common/services/event';
import { enviroment } from '../../enviroments/enviroment';

interface Access {
  type: number,
  id?: string,
}

interface SignedData {
  esign: string,
  signeData: string,
}

const bkevent = bkEventServiceFactory();

const getAccess = (req: HttpOptions): Access => {
  const access = req.body && req.body.esign && (req.body.access || { type: 0, id: '' });
  if(req.body && req.body.access){
    delete req.body.access;
  }
  return access;
}

const getEsign = (req: HttpOptions) => {
  const esign = req.body && req.body.esign;
  if(esign){
    delete req.body.esign;
  }
  return esign === true ? {} : esign || null;
}

const getESHSAs = (req: HttpOptions) => {
  const eshsas = req.body && req.body.ESHSAs;
  if(req.body && req.body.ESHSAs){
    delete req.body.ESHSAs;
  }
  return eshsas;
}

const getVerify = (req: HttpOptions): Access => {
  const verify = req.body && req.body.verify;
  if (req.body && req.body.verify && req.body.esign) {
    delete req.body.verify;
  }
  return verify;
};

const getTonce = (req: HttpOptions): Access => {
  const tonce = req.body && req.body.tonce;
  if (req.body && req.body.tonce) {
    delete req.body.tonce;
  }
  return tonce;
};

const AuthorizationInterceptor = (req: HttpOptions) => {
  const access = getAccess(req);
  const verify = getVerify(req);
  const esign = getEsign(req);
  const ESHSAs = getESHSAs(req);
  const tonce = getTonce(req);
  const reqBody = req.body ? JSON.parse(JSON.stringify(req.body)) : {};
  if(reqBody.token_public){
    delete reqBody.token_public;
  }
  const body: any = { data: reqBody, auth: { access }, esign};
  if(req.body && req.body.token_public){
    body.token_public = req.body.token_public;
  }
  const authReq = access && esign && req.body && Object.assign(req, {body});

  const eshsaReq = access && esign && ESHSAs && tonce && req.body && Object.assign(req, {body:  { data: reqBody, auth: { access, ESHSAs, tonce: tonce  }, esign }});
  const Verify = access && esign && verify  && req.body && Object.assign(req, {body : { data: reqBody, auth: { access, verify, tonce: tonce  }, esign }});
  const result = Verify ? Verify : (ESHSAs ? eshsaReq : authReq ) || req;
  return Object.assign({}, result);
}

//TODO 这里有一个授权Auth类没写，等这写
// const esignInterceptor = (req: HttpOptions) => {
//   const esign = getEsign(req);
//   let secureReq;
//   const { salt, publicKey } = enviroment;
//   if (esign && esign['token']) {
//     secureReq = req.body && Object.assign(req, {body: new Auth('token:' + esign['token'], salt, publicKey).msgToESignedMsg(req.body, esign.sp)})
//   } else if (esign && esign.p) {
//     secureReq = req.body && Object.assign(req, {body: new Auth(esign.p, salt, publicKey).msgToESignedMsg(req.body, esign.sp)})
//   }
//   const newReq = secureReq || req;
//   const data: SignedData = newReq.body.data;
//   if (data && data.hasOwnProperty('esign') && data.hasOwnProperty('signedData')) {
//     return Object.assign({}, newReq, {body: { ...newReq.body, data: JSON.parse(data.signedData || '{}') }});
//   }
//   return newReq;
// }

const setCommonHeaders = (req: HttpOptions) => {
  const { headers } = req;
  const domLang = document.documentElement.getAttribute('lang');
  const navigatorLang = navigator.languages[0] && navigator.languages[0].indexOf('zh') >= 0 ? 'zh' : 'en';
  const lang = domLang || navigatorLang || 'zh';

  return Object.assign(req, {
    headers: Object.assign({}, headers, {
      //@ts-ignore
      'bk-device-id': window['deviceid'] || '',
      //@ts-ignore
      'bk-identity': window['deviceid'] || '',
      'bk-edition': 6,
      'Content-Type': headers['Content-Type'] || 'application/json',
      'Accept-Language': lang,
    })
  })
}

const dataInterceptor = (res: any, originalURL: string = '') => {
  if(+res.code === 0 || res.result === 'success'){
    return res.data || {};
  }else if(!!res.success){
    return res;
  }else if(+res.coe ===23 || +res.code === 36){
    bkevent.dispatch({ type: 'LICENSE.UPDATE', message: originalURL });
    throw(res);
  }else if(+res.code === 2){
    bkevent.dispatch({ type: 'NOT.LOGGED.IN', message: originalURL });
    throw(res);
  }else{
    throw(res);
  }
}

export const initInterceptor = () => {
	addMiddlewareForHTTP(AuthorizationInterceptor, 'request');
  //TODO 方法还没有写
  // addMiddlewareForHTTP(esignInterceptor, 'request');
  addMiddlewareForHTTP(setCommonHeaders, 'request');
  addMiddlewareForHTTP(dataInterceptor, 'response');
}

