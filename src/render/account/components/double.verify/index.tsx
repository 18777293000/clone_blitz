import React, {useState} from "react";
import { Form, FormItem } from "../../../../frame/form";
import { Input } from "../../../../frame/input/input";
import { Button } from "../../../../frame/button/button";
import { formatRules } from "../../utils";
import CodeItem from '../code.item';
import { IDoubleVerifyService } from '../../../../services/account/double.verify';
import './style.scss';
import { queryPhoneCode } from "../../../../api/account";

interface GAVerifyFormProps {
  service: IDoubleVerifyService;
  I18n: any;
  onSubmit: (params: any) => void;
};

export const GAVerifyForm = ({service, onSubmit, I18n}: GAVerifyFormProps) => {
  const rules = service.rules;
  const [ code, codeSet ] = useState<string>('');
  
  const submit = () => {
    try{
      if(service.validate && service.validate()){
        onSubmit(service.values);
      }
    }catch(error){}
  };

  const change = (value: any, set: Function, key: string) => {
    set(value);
    service.set(key, value);
  };

  return (
    <Form 
      ref={(ref: any) => ref && service.registerValidate(() => ref.validate())}>
        <FormItem rules={ formatRules(rules.code, I18n) }>
          <Input
            type='text'
            size='normal'
            value={code}
            onEnter={() => submit()}
            onChange={(value: any) => change(value, codeSet, 'ga_code')}
            placeholder={'请输入谷歌验证码'}
          ></Input>
        </FormItem>
        <FormItem>
          <div className='bktrade-account-btns'>
            <Button type='primary' isBlock={true} onClick={() => submit()}>确定</Button>
          </div>
        </FormItem>
      </Form>
  )
};

interface SMSVerifyFormProps {
  account: any;
  service: IDoubleVerifyService;
  I18n: any;
  onSubmit: (params: any) => void;
};

export const SMSVerifyForm = ({account, service, I18n, onSubmit}: SMSVerifyFormProps) => {
  const rules = service.rules;
  const [ robotResult ] = useState<any>(null);
  const [ , codeSet ] = useState('');

  const submit = () => {
    try{
      if(service.validate && service.validate()){
        onSubmit(Object.assign({}, service.values, robotResult));
      }
    }catch(error){}
  };

  const change = (value: any, set: Function, key: string) => {
    set(value);
    service.set(key, value);
  };

  return (
    <>
      { account.number ? <p className="double-verify-phone-tips">{ I18n['短信验证码发送至'] }{account.number?.slice(0,3) + '***' + account.number?.slice(account.number.length-4, account.number.length)}</p> :  <p className="double-verify-phone-tips">{ I18n['验证码将发送至已绑定手机号'] }</p>}
      <Form
        ref={(ref: any) => ref && service.registerValidate(() => ref.validate())}
      >
        <CodeItem
          api={queryPhoneCode}
          rule={formatRules(rules.code, I18n)}
          account={account}
          codeType='login_verify'
          placeholder={'请输入验证码'}
          onChange={(value: any) => change(value, codeSet, 'sms_code')}
          onSubmit={submit}
        ></CodeItem>
        <FormItem>
          <div className='bktrade-account-btns'>
            <Button type='primary' isBlock={true} onClick={() => submit()}>确定</Button>
          </div>
        </FormItem>
      </Form>
    </>
  )
};