import JSEncrypt from 'jsencrypt';

export interface SignedData {
  esign: string;
  signedData: string;
}

const AES        = require('crypto-js/aes'),
      MD5        = require('crypto-js/md5'),
      Utf8       = require('crypto-js/enc-utf8'),
      Base64     = require('crypto-js/enc-base64'),
      HmacSHA256 = require('crypto-js/hmac-sha256');

export class Auth {
  private readonly HUP: string;
  constructor(password: string, private readonly salt: string, private readonly publicKey: string, private isWebSignup = false) {
    if (password.indexOf('token') >= 0) {
      this.HUP = password.split('token:')[1];
    } else {
      this.HUP = this.calcHup(password);
    }
  }

  static HmacSHA256(secretKey: string, data: string): string {
    return String(HmacSHA256(secretKey, data));
  }

  static Utf8Parse(string: string): string {
    return Utf8.parse(string);
  }

  static Base64(string: string): string {
    return Base64.stringify(string);
  }

  static MD5(string: string): string {
    return String(MD5(string))
  }

  calcHup(password: string): string {
    return this.hashBySalt(String(MD5(password)));
  }

  msgToESignedMsg(msg: any, sp?: string): SignedData {
    if (!msg.auth.tonce) {
      msg.auth.tonce = new Date().getTime();
    }
    if (sp) {
      msg.auth.ESHSP = this.eshsp(this.hashBySalt(sp), String(msg.auth.tonce));
    }
    const signedData = JSON.stringify(msg);
    return {
      signedData: signedData,
      esign     : this.esign(signedData),
    };
  }

  ehsp(sp: string): string {
    return this.rsaAesEncrypt(this.hashBySalt(sp));
  }

  ehup(): string {
    return this.rsaAesEncrypt(this.HUP);
  }

  ehsas(answers: Array<{ id: number; content: string; }>) {
    return answers.map(answer => ({
      id  : answer.id,
      EHSA: this.rsaAesEncrypt(this.hashBySalt(answer.content)),
    }));
  }

  eshsas(answers: Array<{ id: number; content: string; }>, tonce: string) {
    return answers.map(answer => ({
      id   : answer.id,
      ESHSA: this.rsaAesEncrypt(Auth.HmacSHA256(tonce, this.hashBySalt(answer.content)))
    }));
  }

  signData(data: string) {
    return this.sign(data);
  }

  esignDecrypt(data: string, metaData: any) {
    return this.rsaAesDecrypt(data);
  }

  private rsaEncrypt(data: string) {
    const crt = new JSEncrypt({});
    crt.setPublicKey(this.publicKey);
    return crt.encrypt(data);
  }

  private rsaDecrypt(data: any) {
    const crt = new JSEncrypt({});
    crt.setPrivateKey(this.publicKey);
    return crt.decrypt(data);
  }

  private hashBySalt(data: string) {
    return String(HmacSHA256(data, this.salt));
  }

  private esign(data: string) {
    return this.rsaAesEncrypt(this.sign(data));
  }

  private sign(data: string) {
    return String(HmacSHA256(data, this.HUP));
  }

  private aesEncrypt(data: any) {
    const HUP = !this.isWebSignup ? this.HUP : this.calcHup('');
    const md5 = MD5(HUP).toString();
    const key = Utf8.parse(md5);
    const iv = Utf8.parse(HUP.substr(0, 16));
    const encrypted: any = AES.encrypt(data, key, { iv: iv });
    return Base64.stringify(encrypted.ciphertext);
  }

  private aesDecrypt(data: string) {
    const HUP = this.HUP;
    const md5 = MD5(HUP).toString();
    const key = Utf8.parse(md5);
    const iv = Utf8.parse(HUP.substr(0, 16));
    return AES.decrypt(data, key, { iv: iv }).toString(Base64);
  }

  private rsaAesEncrypt(data: string) {
    let rsaEncryptData = this.rsaEncrypt(data);
    rsaEncryptData = Base64.parse(rsaEncryptData);
    return this.aesEncrypt(rsaEncryptData);
  }

  // 验证服务端加密响应

  private rsaAesDecrypt(data: string) {
    const aesDecryptData = this.aesDecrypt(data);
    return this.rsaDecrypt(aesDecryptData);
  }

  private eshsp(hsp: string, tonce: string) {
    return this.rsaAesEncrypt(String(HmacSHA256(tonce, hsp)));
  }

}
