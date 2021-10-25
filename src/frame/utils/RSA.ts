import JSEncrypt from 'jsencrypt';

// buff转字符串
function bin2text(bin: any){
  //@ts-ignore
  return btoa(String.fromCharCode(...new Uint8Array(bin)));
};

// 字符串转buff
export function str2ab(str: string){
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for(let i = 0, strLen = str.length; i < strLen; i++){
    bufView[i] = str.charCodeAt(i);
  };
  return buf;
};

export async function wrapper(obj: any){
  if(typeof obj.then === 'function'){
    return await obj;
  };

  if(obj.oncomplete === null && obj.onerror === null){
    return new Promise((resolve, reject) => {
      obj.oncomplete = (e: any) => resolve(e.target.result);
      obj.onerror = (e: any) => reject(e);
    });
  };

  return Promise.reject();
};

export const createRSA = async function(){
  //@ts-ignore
  if(!window.crypto && !window['msCrypto']){return false};
  //@ts-ignore
  const cryptoObj = window.crypto || window['msCrypto'];
  const rsa = {
    publicKey: '',
    privateKey: '',
  };
  const key = await wrapper(cryptoObj.subtle.generateKey({
    name: 'RSA-OAEP',
    modulusLength: 1024,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: {name: 'SHA-256'}
  }, true, ['encrypt', 'decrypt']));
  let publicKey = key.publicKey;
  let privateKey = key.privateKey;

  publicKey = await wrapper(cryptoObj.subtle.exportKey('spki', publicKey));
  publicKey = bin2text(publicKey);
  const publicLines = Array.apply(null, Array(Math.ceil(publicKey.length / 64))).map((v, i) => {
    return publicKey.slice(i * 64, i * 64 + 64);
  });
  rsa.publicKey = publicLines.join('\n');

  privateKey = await wrapper(cryptoObj.subtle.exportKey('pkcs8', privateKey));
  privateKey = bin2text(privateKey);
  const privateLines = Array.apply(null, Array(Math.ceil(privateKey.length / 64))).map((v, i) => {
    return privateKey.slice(i * 64, i * 64 + 64);
  });
  rsa.privateKey = privateLines.join('\n');
  return rsa;
};

export const encryp = async function (publicKey: string, text: string) {
  const pemheader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';

  let pemContents = publicKey.substring(pemheader.length, publicKey.length - pemFooter.length);
  pemContents = pemContents.replace(/[\r\n]/g, '');

  //@ts-ignore
  const jsEncrypt = new JSEncrypt();
  jsEncrypt.setPublickKey(pemContents);
  const str = jsEncrypt.encrypt(text);
  return str;
}