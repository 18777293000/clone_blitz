import { container, injectable } from "common/services/di";
import { DomBridge } from "common/services/dom.bridge";

export interface ISafetyForm {
  values: any;
  rules: any;
  set(key: string, value: string | undefined): void;
};

@injectable()
export class SafetyVerifyService extends DomBridge implements ISafetyForm {

  public values: {
		google_code: string | undefined;
		phone_code: string | undefined;
		email_code: string | undefined;
	} = {
		google_code: undefined,
		phone_code: undefined,
		email_code: undefined,
	};

  set(key: 'google_code' | 'phone_code' | 'email_code', value: string | undefined){
    this.values[key] = value;
  };

  get rules(){
    return {
      code: [
        {name: 'isRequired', msg: '字段不能为空'}
      ]
    }
  }
};

export const safetyVerifyService = () => {
  return container.resolve(SafetyVerifyService)
}