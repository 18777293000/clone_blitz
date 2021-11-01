import { isValidNumber, CountryCode } from "libphonenumber-js";
import { inject, injectable, container } from "common/services/di";
import { DomBridge } from "common/services/dom.bridge";
import { WorkFlowService } from "common/services/workflow";
import { userServiceFactory, UserAPIService } from "./user";
import { setDeviceInfo, generateSocketToken, signup } from "api/account";

type SupportSignupType = 'email' | 'phone_num';

interface ISignupForm {
  readonly type: SupportSignupType;
  values: any;
  rules: any;
  set(key: string, value: string | undefined): void;
};

class PhoneSignupForm extends DomBridge implements ISignupForm {
  readonly type = 'phone_num';
  public values: {
    countryCode: CountryCode;
    areaCode: string | undefined;
    phoneNumner: string | undefined;
    password: string | undefined;
    code: string | undefined;
    inviter_hid: string | undefined;
  } = {
    countryCode: 'CN',
    areaCode: undefined,
    phoneNumner: undefined,
    password: undefined,
    code: undefined,
    inviter_hid: undefined,
  };

  set(key: string, value: string | undefined): void{
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
          handler: (val: string) => {
            const countryCode: CountryCode = this.values.countryCode || 'CN';
            if(countryCode === 'CN'){
              return (/^1\d{10}$/.test(val));
            }
            if(!val){return false};
            return isValidNumber(val, countryCode);
          },
        }
      ],

      password: [
        { name: 'isRequired', msg: '该字段不能为空'},
        { name: 'isMin:6', msg: '长度不能小于6'},
				{ name: 'isMax:18', msg: '长度不能大于18'},
        { name: 'hasStr', msg: '密码不能为纯数字或纯字母', handler: (val: string) => {
            const result0_1 = /^[a-zA-Z]+$/.test(val);
            const result0_2 = /^[0-9]*$/.test(val);
            if(result0_1 || result0_2){
              return false;
            }else{
              return true
            };
          },
        },
        { name: 'pureText', msg: '密码不能包含中文字符', handler: (val: string) =>{
            const result = /^[^\u4e00-\u9fa5]{0,}$/.test(val);
            const result2 = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(val);
            if(!result || result2){
              return false;
            }else{
              return true;
            }
          } 
        },
      ],

      code: [
        {name: 'isRequired', msg: '该字段不能为空'},
      ]
    }
  }
}

class EmailSignupForm  extends DomBridge implements ISignupForm {
  readonly type: SupportSignupType = 'email';
  public values: {
		countryCode: CountryCode;
    email: string | undefined;
		password: string | undefined;
		code: string | undefined;
		inviter_hid: string | undefined;
  } = {
		countryCode: 'CN',
    email: undefined,
		password: undefined,
		code: undefined,
		inviter_hid: undefined
  };
	
  set(key: string, value: string | undefined) {
		//@ts-ignore
    this.values[key] = key === 'email' ? (value+'').toLocaleLowerCase() : value;
  }

  get rules() {
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
			code: [
				{ name: 'isRequired', msg: '该字段不能为空' },
			]
		};
  }
}

@injectable()
export class SignupService {
  private _validateImpl: any = null;
  private userService: UserAPIService = userServiceFactory();

  constructor(
    @inject('ISignupForm') private signupForm: ISignupForm,
    private workFlowService: WorkFlowService
  ){};

  private signUp(){
    signup(this.signupForm.values).then(data => {
      this.reportDeviceInfo();
      this.getSocketToken();
      const token = {
        access_token: data.user.access_token,
        isset_password: +data.user.isset_password,
      };
      this.userService.setToken(token, data.user.expire_at);
      this.userService.updateProfile();
    }).catch(error => {
      this.workFlowService.fail(error);
    });
  };

  private reportDeviceInfo(){
    setDeviceInfo();
    this.workFlowService.success();
  };

  private getSocketToken(){
    generateSocketToken().promise().then(data => {
      const token = {
        socket_token: data.socket_token,
        user_id: data.user_id,
      };
      this.userService.setSocketToken(token, data.expire_at);
    });
  };

  registerValidate(validateImpl: () => boolean){
    console.log('register', validateImpl);
    this._validateImpl = validateImpl;
  };

  set(key: string, value: string | undefined){
    this.signupForm.set(key, value);
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
    this.signUp();
  };

  flowStream(){
    return this.workFlowService.stream$;
  };

  get rules(){
    return this.signupForm.rules;
  };
}

export const phoneSignupService = () => {
  container.register("ISignupForm", PhoneSignupForm);
  return container.resolve(SignupService);
};

export const emailSignupService = () => {
  container.register('ISignupForm', EmailSignupForm);
  return container.resolve(SignupService);
};