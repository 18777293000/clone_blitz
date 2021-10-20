import { isEmpty } from './data.type';

export interface Rule {
  name: string,
  msg: string,
  handler: RegExp | ((value: string) => boolean),
}

export class Rules {
  private _regRules: any = {
    isLetter            : /[A-Za-z]/g, // 验证是否有字母
    isNum               : /\d/g, // 验证是否有数字
    isInt               : /^[1-9]*[1-9][0-9]*$/, // 验证是否是正整数
    isFloat             : /^\d+\.?\d{0,1}$/, // 验证是是一位小数
    isDouble            : /^\d+\.?\d{0,2}$/, // 验证是两位小数
    isChinese           : /^[\u4e00-\u9fa5]{0,}$/, // 验证是否有汉字
    isChinesePunctuation: /[^uFF00-uFFFF]/g, // 验证是否有中文标点符号
    isTel               : /^(\(\d{3,4}\)|\d{3,4}-)?\d{7,8}$/, // 验证是否是电话
    isPhone             : /^0?1[3|4|5|6|7|8|9][0-9]\d{8}$/, // 验证是否是手机号
    isEmail             : /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/, // 验证是否是邮箱
    isPersonNum         : /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, // 验证是否是身份证
    isRequired          : {
      test(value:string) {
        return !isEmpty(value);
      },
    },
    isNotZero: {
      test(val: string){
        return val && val !== '' && +val > 0
      }
    },
    isSpace             : {// 验证是否有空格
      test(value:string) {
        return value.indexOf(' ') >= 0;
      },
    },
    isUnderline         : {// 验证是否有下划线
      test(value:string) {
        return value.indexOf('_') >= 0;
      },
    },
    isMin               : {
      test(value:string, length:number) {
        return value.length >= length;
      },
    },
    isMax               : {
      test(value:string, length:number) {
        return value.length <= length;
      },
    },
    hasStr: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$/  //8-20位同时含有字母和数字
  }

  /**
   * 添加规则函数
   * @param {*} key 规则名称
   * @param {*} obj 用于验证的正则表达式，或者是含有test方法的对象
   * @return {object} this: 该对象本身，方便链式调用，如：rules.addRule().validator()
   */
  addRule(key: string, obj: any):Rules {
    this._regRules[key] = obj;
    return this;
  }

  validator(value: string, reg: any, handler?: (value: any) => boolean): boolean{
    let result = false;
    const isString = typeof reg === 'string';
    if(isString){
      const arr = reg.split(":");
      if(arr.lengt > 1){
        result = this._regRules[arr[0]].test(value, arr[1]);
      }else{
        result = !handler ? this._regRules[reg].test(value) : handler(value);
      }
    }else{
      result = reg.test(value);
    }
    return result;
  }
}