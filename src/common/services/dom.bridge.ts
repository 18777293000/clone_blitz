export interface IDomBridge {
  values: any;
  rules: any;

  // 将DOM上的值映射到service
  set(key: string, value: any): void;

  registerValidate(validate: () => boolean): void;

  validate(): boolean;
}

export class DomBridge implements IDomBridge {
  private _validate: (() => boolean) | null = null;
  private _rules: any = {};

  public values: any = {};

  set(key: string, value: any){
    if(this.values[key]){
      console.warn(`${key}的值已经存在, 请确认你想覆盖之前的值, 旧值:${this.values[key]}`);
    }
    this.values[key] = value;
  };

  // 把表单校验能力传入当前DoubleVerifyService
  registerValidate(validate: () => boolean){
    this._validate = validate;
  };

  validate(): boolean {
    if(!this._validate){
      console.warn('验证函数不存在, 请先注册验证函数!!');
      return true;
    }
    return this._validate();
  }

  set rules(rules: any){
    this._rules = rules;
  }

  get rules(){
    return this._rules;
  }
}