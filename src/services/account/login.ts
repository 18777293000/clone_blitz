/**
 * 登录服务相关实现
 * ====================================================================================================================================
 * 登录的业务步骤大概可以分为以下步骤:
 * 1. 校验用户填写的表单
 * 2. 表单校验成功后, 校验当前用户是否需要输入二次验证信息(短信(发短信步骤为3-1-1)、语音(发短信步骤为3-1-2)或谷歌验证(手机内安装的谷歌身份验证器内的6为数字))
 * 3-1. 如果需要: 用户填写二次验证信息, 校验信息格式是否符合规范, 符合则调用登录接口完成登录
 * 3-1-1. 用户点击获取验证码 -> 人机验证 -> 人机验证成功调用发送验证码接口 -> 发送验证码按钮倒计时(60s后可重发)
 * 3-1-2. 用户点击获取验证码 -> 人机验证 -> 人机验证成功调用发送语音验证码接口 -> 发送语音验证码按钮倒计时(60s后可重发)
 * 3-2. 如果不需要: 进行人机校验, 人机校验成功调用登录接口完成登录
 * 4. 登录成功后需要上报当前用户登录的设备信息
 * 5. 请求用户信息和socketToken信息，并将登录接口data中access_token等信息一起整合成user存储
 * ====================================================================================================================================
 */
import { inject, injectable, container, InjectionToken } from '../../common/services/di';
import { DomBridge } from '../../common/services/dom.bridge';
import { GeetestRobotService } from './robot.verify';
import { WorkFlowService } from '../../common/services/workflow';
import { IDoubleVerifyService } from './double.verify';
import { userServiceFactory, UserAPIService } from './user';
import type { IRobotService } from './robot.verify';
import { isNeedDoubleVerify, setDeviceInfo, generateSocketToken, signIn } from '../../api/account';

type SupportLoginType = 'email' | 'phone_num';

interface ILoginForm {
  readonly type: SupportLoginType;
  username: string;
  values: any;
  rules: any;

  set(key: string, value: string | undefined): void;
};

class PhoneLoginForm extends DomBridge implements ILoginForm{
  readonly type = 'phone_num';

  public values: {
    areaCode: string | undefined;
    phoneNumber: string | undefined;
    password: string | undefined;
  } = {
    areaCode: undefined,
    phoneNumber: undefined,
    password: undefined,
  };

  public coutryCode = 'CN';
  public username = '';

  set(key: 'countryCode'| 'areaCode' | 'phoneNumber' | 'password', value: string | undefined){
    if(key === 'countryCode'){
      //@ts-ignore
      this.coutryCode = value;
      return;
    }
    this.values[key] = value;
    if(key === 'phoneNumber' && this.values.areaCode){
      this.username = this.values.areaCode.replace("+", '00') + (value || '');
    }
    if(key === 'areaCode' && value && this.values.phoneNumber){
      this.username = value.replace("+", '00') + (this.values.phoneNumber || '');
    }
  };

  get rules(){
    return {
      phone: [
        {name: 'isRequired', msg: 'Required'},
        {
          name: 'isPhone',
          msg: '手机号格式错误',
          handler: (val: string) => {
            if(this.coutryCode === 'CN'){
              return (/^1\d{10}$/.test(val));
            }
            if(!val){return false};
            return true;
          }
        }
      ],
      password: [
        {name: 'isRequired', msg: "Required"},
      ]
    }
  };
};

class EmailLoginForm extends DomBridge implements ILoginForm {
  readonly type: SupportLoginType = 'email';
  public values: {
    email: string | undefined;
    password: string | undefined;
  } = {
    email: undefined,
    password: undefined,
  };
  public username = '';

  set(key: 'email' | 'password', value: string | undefined){
    this.values[key] = value;

    if(key === 'email'){
      this.username = value || '';
    }
  }

  get rules(){
    return {
      email: [
        {name: 'isRequired', msg: 'Required'},
        {name: 'isEmail', msg: '邮箱格式不正确'},
      ],
      password: [
        {name: 'isRequired', msg: 'Required'},
      ]
    }
  }
};

@injectable()
export class LoginService extends DomBridge{
  private _params: any = null;
  private userService: UserAPIService = userServiceFactory();
  constructor(
    @inject('ILoginForm') private loginForm: ILoginForm,
    @inject('IRobotService') private robotService: IRobotService,
    private workFlowService: WorkFlowService
  ){
    super();
  };

  private checkDoubleVerify(params: {
    type: SupportLoginType,
    username: string,
  }){
    isNeedDoubleVerify(params).then(data => {
      const { login_phone_verify, login_google_verify } = data;
      if(+login_phone_verify === 0 && +login_google_verify === 0){
        this.robotVerify();
      }else{
        this.doubleVerifyStartup(data);
      }
    }).catch(error => {
      this.workFlowService.fail(error.message || error);
    });
  };

  private robotVerify(): void{
    this.robotService.startup((checkResult: any) => {
      this.login(checkResult);
    }, error => {
      this.workFlowService.fail(error.message || String(error));
      throw(error);
    }, () => {
      this.workFlowService.fail(null);
    });
  };

  private doubleVerifyStartup(data: any){
    this.workFlowService.start({ child: 'doubleVerify', data });
  };

  private login(checkResult?: any): void{
    const params = Object.assign({}, checkResult, this._params);
    signIn(params, checkResult && checkResult.geetest_challenge ? 0 : 1).then(data => {
      this.reportDeviceInfo();
      this.getSocketToken();
      const token = {
        access_token: data.user.access_token,
        isset_password: +data.user.inset_password,
      };

      this.userService.setToken(token, data.user.expire_at)
      this.userService.updateProfile();
    }).catch(error => {
      this.workFlowService.fail(error);
    })
  };

  private reportDeviceInfo():void {
    setDeviceInfo();
    this.workFlowService.success();
  };

  private getSocketToken(): void{
    generateSocketToken().promise().then(data => {
      const token = {
				socket_token: data.socket_token,
				user_id: data.user_id
			};
      this.userService.setSocketToken(token, data.exprie_at);
    })
  };

  public submit(){
    this.workFlowService.start();
    if(!this.validate()){
      this.workFlowService.fail(null);
      return;
    };

    this._params = Object.assign({}, this.loginForm.values);

    if(!!this._params){
      this.checkDoubleVerify({
        type: this.loginForm.type,
        username: this.loginForm.username,
      })
    }else{
      this.workFlowService.fail(null);
    }
  };

  flowStream() {
    return this.workFlowService.stream$;
  };

  doubleVerifySuccess(params: any){
    this.login(params);
  };

  public set(key: string, value: string | undefined){
    this.loginForm.set(key, value);
  }

  get rules(){
    return this.loginForm.rules;
  }
}

export const phoneLoginService = () => {
  container.register('ILoginForm', PhoneLoginForm);
  container.register('IRobotService', GeetestRobotService);
  return container.resolve(LoginService);
};

export const emailLoginService = () => {
  container.register('ILoginForm', EmailLoginForm);
  container.register("IRobotService", GeetestRobotService);
  return container.resolve(LoginService);
};

export const createDoubleVerifyService = (Service: InjectionToken<IDoubleVerifyService>): IDoubleVerifyService => {
  return container.resolve(Service);
};

