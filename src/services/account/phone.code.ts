import { Observable } from "rxjs";
import { inject, injectable, container } from "../../common/services/di";
import { GeetestRobotService } from './robot.verify';
import { WorkFlowService } from "../../common/services/workflow";
import { userServiceFactory, UserAPIService } from "./user";
import type { IRobotService } from './robot.verify';

type VerifyWay = 1 | undefined;
export interface ICodeService {
  readonly verify_way: VerifyWay;
};

export class SMSCodeService implements ICodeService {
  readonly verify_way: VerifyWay = undefined;
};

export class EmailCodeService implements ICodeService {
	readonly verify_way: VerifyWay = undefined;
};

export class VoiceCodeService implements ICodeService {
	readonly verify_way: VerifyWay = 1;
};

interface CodeApiParams {
  uuid?: string;
  code_type?: string;
  email?: string;
  country?: string;
  number?: string | number;
  geetest_challenge?: string;
  geetest_validate?: string;
  geetest_seccode?: string;
  verify_way?: number;
  access_id?: string;
};

interface GeetestCheckResult {
  geetest_challenge?: string;
  geetest_validate?:string;
	geetest_seccode?:string;
}

export interface IPhoneCodeService {
  getPhoneCode: (api: (params?: CodeApiParams) => Promise<any>, params: CodeApiParams, needCheck?: boolean) => Observable<any>
};

@injectable()
export class PhoneCodeService implements IPhoneCodeService {
  private _robotResult: any = null;
  private userService: UserAPIService = userServiceFactory();
  constructor(
    @inject('ICodeService') private phoneCodeService: ICodeService,
    @inject('IRobotService') private robotService: IRobotService,
    private workFlowService: WorkFlowService,
  ){};

  private getCode(api: (params?: CodeApiParams) => Promise<any>, params: CodeApiParams, checkResult: GeetestCheckResult){
    params.uuid = params.uuid || 'web';
    params.code_type = params.code_type || 'login_verify';
    !!this.userService.user && (params.access_id = this.userService.user.id);
    const verifyObj = this.phoneCodeService.verify_way === 1 ? { verify_way: 1 } : {};
    params = Object.assign({}, checkResult, params, verifyObj);

    api(params).then((data: any) => {
      this.workFlowService.success({ checkResult: checkResult, verify_way: data?.verify_way })
    }).catch((error: any) => {
      this.workFlowService.fail(error.message || String(error));
    });
  };

  getPhoneCode(api: (params?: CodeApiParams) => Promise<any>, params: CodeApiParams, needCheck=true){
    if(!needCheck){
      this.getCode(api, params, {});
      return this.workFlowService.stream$;
    };
    this.workFlowService.start();
    this.robotService.startup((checkResult: GeetestCheckResult) => {
      this._robotResult = checkResult;
      this.getCode(api, params, checkResult);
    }, error => {
      this.workFlowService.fail(error.message || String(error));
      throw(error);
    }, ()=>{
      this.workFlowService.fail(null);
    });
    return this.workFlowService.stream$;
  };

}

export const phoneCodeService = (service: any) => {
  container.register("ICodeService", service);
  container.register("IRobotService", GeetestRobotService);
  return container.resolve(PhoneCodeService);
}