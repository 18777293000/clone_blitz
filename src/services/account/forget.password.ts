import { isValidNumber, CountryCode } from "libphonenumber-js";
import { inject, injectable, container } from "common/services/di";
import { DomBridge } from "common/services/dom.bridge";
import { WorkFlowService } from "common/services/workflow";
import { resetPasswordByEamil, resetPasswordByPhone } from "api/account";

type SupportForgetPswType = 'email' | 'phone_num';

interface IForgetPswForm {
  readonly type: SupportForgetPswType;
  readonly api: any;
  values: any;
  rules: any;
  set(key: string, value: string | undefined): void;
};

class PhoneForgetPswForm extends DomBridge implements IForgetPswForm {
  readonly type = 'phone_num';
  readonly api = resetPasswordByPhone;
  public values: {
    countryCode: CountryCode;
    areaCode: string | undefined;
    phoneNumber: string | undefined;
    password: string | undefined;
    code: string | undefined;
  } = {
    countryCode: 'CN',
    areaCode: undefined,
    phoneNumber: undefined,
    password: undefined,
    code: undefined,
  };

  set(key: string, value: string | undefined){
    //@ts-ignore
    this.values[key] = value;
  };

  get rules(){
    return {
      phone: [
				{ name: 'isRequired', msg: '该字段不能为空' },
				{
					name: 'isPhone',
					msg: '手机号格式错误',
					// TODO 暂时不校验其他国家
					handler: (val: string) => {
						const countryCode:CountryCode = this.values.countryCode || 'CN'
						if (countryCode === 'CN') {
							return (/^1\d{10}$/.test(val));
						}
						if(!val) { return false; }
						return isValidNumber(val, countryCode);
					}
				},
			],
			password: [ // 交易网站的密码是6-20位
				{ name: 'isRequired', msg: '该字段不能为空'},
				{ name: 'isMin:6', msg: '长度不能小于6'},
				{ name: 'isMax:18', msg: '长度不能大于18'},
				{ name: 'hasStr', msg: '密码不能为纯数字或纯字母', handler: (val:string) => {
						const result0_1 = /^[a-zA-Z]+$/.test(val);
						const result0_2 = /^[0-9]*$/.test(val);
						if (result0_1 || result0_2) {
							return false;
						} else {
							return true;
						}
					} 
				},
				{ name: 'pureText', msg: '密码不能包含中文字符', handler: (val:string) => {
					const result =/^[^\u4e00-\u9fa5]{0,}$/.test(val);
					const result2 = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(val);
					if (!result || result2) {
						return false;
					} else {
						return true;
					}
				}}
			],
			comfirmPassword: [
				{ name: 'isRequired', msg: '该字段不能为空'},
				{ name: 'equalTo', msg: '两次密码不一致', handler: (val:string) => {
					return val === this.values.password;
				}},
			],
			code: [
				{ name: 'isRequired', msg: '该字段不能为空' },
			]
    }
  };
}

class EmailForgetPswForm extends DomBridge implements IForgetPswForm {
  readonly type: SupportForgetPswType = 'email';
  readonly api = resetPasswordByEamil;
  public values: {
    email: string | undefined;
		password: string | undefined;
		code: string | undefined;
  } = {
    email: undefined,
		password: undefined,
		code: undefined,
  };

  set(key: string, value: string | undefined){
    //@ts-ignore
    this.values[key] = key === 'email' ? (value+'').toLocaleLowerCase() : value;
  };

  get rules(){
    return  {
			email: [
				{ name: 'isRequired',  msg: '该字段不能为空' },
				{ name: 'isEmail',  msg: '邮箱格式不正确' },
			],
			password: [ // 交易网站的密码是6-20位
				{ name: 'isRequired', msg: '该字段不能为空'},
				{ name: 'isMin:6', msg: '长度不能小于6'},
				{ name: 'isMax:18', msg: '长度不能大于18'},
				{ name: 'hasStr', msg: '密码不能为纯数字或纯字母', handler: (val:string) => {
						const result0_1 = /^[a-zA-Z]+$/.test(val);
						const result0_2 = /^[0-9]*$/.test(val);
						if (result0_1 || result0_2) {
							return false;
						} else {
							return true;
						}
					} 
				},
				{ name: 'pureText', msg: '密码不能包含中文字符', handler: (val:string) => {
					const result =/^[^\u4e00-\u9fa5]{0,}$/.test(val);
					const result2 = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(val);
					if (!result || result2) {
						return false;
					} else {
						return true;
					}
				}}
			],
			comfirmPassword: [
				{ name: 'isRequired', msg: '该字段不能为空'},
				{ name: 'equalTo', msg: '两次密码不一致', handler: (val:string) => {
					return val === this.values.password;
				}},
			],
			code: [
				{ name: 'isRequired', msg: '该字段不能为空' },
			]
		};
  }
};

@injectable()
export class ForgetPswService{
  private _validateImpl: any = null;

  constructor(
    @inject("IForgetPswForm") private forgetPswForm: IForgetPswForm,
    private workFlowService: WorkFlowService
  ){};

  private resetPsw(){
    this.forgetPswForm.api(this.forgetPswForm.values).then((data:any) => {
      this.workFlowService.success();
    }).catch((error: any) => {
      this.workFlowService.fail(error);
    })
  };

  registerValidate(validateImpl: () => boolean){
    this._validateImpl = validateImpl;
  };

  set(key: string, value: string | undefined){
    this.forgetPswForm.set(key, value);
  };

  validate(){
    return this._validateImpl();
  };

  submit(){
    this.workFlowService.start();
    if(!this.validate()){
      this.workFlowService.fail(null);
      return;
    }
    this.resetPsw();
  };

  flowStream(){
    return this.workFlowService.stream$;
  };

  get rules(){
    return this.forgetPswForm.rules;
  };
};

export const phoneForgetPswService = () => {
  container.register('IForgetPswForm', PhoneForgetPswForm)
  return container.resolve(ForgetPswService);
};

export const emailForgetPswService = () => {
  container.register('IForgetPswForm', EmailForgetPswForm)
  return container.resolve(ForgetPswService);
};