import { injectable, container, InjectionToken } from '../../common/services/di';
import { DomBridge } from '../../common/services/dom.bridge';

export interface IDoubleVerifyService {
  validate: (() => boolean) | null | undefined;
  rules: any;
  values: any;

  set(key: string, value: string | undefined): void;

  registerValidate(validate: () => boolean): void;
}

@injectable()
export class GAVerifyService extends DomBridge implements IDoubleVerifyService{
  constructor(){
    super();
    this.rules = {
      code: [
        {name: 'isRequired', msg: 'Required'},
      ]
    }
  }
};

@injectable()
export class SMSVerifyService extends DomBridge implements IDoubleVerifyService{
  constructor(){
    super();
    this.rules = {
      code: [
        {name: 'isRequired', msg: 'Required'},
      ]
    }
  };
}

@injectable()
export class EmailVerifyService extends DomBridge implements IDoubleVerifyService{
  constructor(){
    super();
    this.rules = {
      code: [
        { name: 'isRequired',  msg: 'Required' },
      ]
    }
  }
};

export const createDoubleVerifyService = (Service: InjectionToken<IDoubleVerifyService>): IDoubleVerifyService => {
  return container.resolve(Service);
}