import React, {useState, Fragment} from "react";
import { Form, FormItem } from "../../../../frame/form";
import { Input } from "../../../../frame/input/input";
import { Button } from "../../../../frame/button/button";
import { formatRules } from "../../utils";
import CodeItem from '../code.item';
import { createDoubleVerifyService, IDoubleVerifyService, SMSVerifyService,  GAVerifyService, EmailVerifyService } from '../../../../services/account/double.verify';
import './style.scss';
import { queryPhoneCode, getEmailVerifyCode } from "../../../../api/account";
import { EmailAccount, PhoneAccount, ThirdPartyAccount } from "types/account";
import { useMemo } from "react";

interface GAVerifyFormProps {
  service: IDoubleVerifyService;
  I18n: any;
  onSubmit: (params: any) => void;
  loading?: boolean;
};

export const GAVerifyForm = ({service, loading = false, onSubmit, I18n}: GAVerifyFormProps) => {
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
  loading?: boolean;
  onSubmit: (params: any) => void;
};

export const SMSVerifyForm = ({account, loading=false, service, I18n, onSubmit}: SMSVerifyFormProps) => {
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

interface EmailVerifyFormProps {
  account: any;
	service: IDoubleVerifyService;
	I18n:any;
	loading?:boolean;
  onSubmit : (params: any) => void
}
// 邮箱验证
//TODO: 验证码接口？登录接口验证码参数？
export const EmailVerifyForm = ({ account, service, loading = false,  I18n, onSubmit }: EmailVerifyFormProps) => {
  const rules = service.rules;
  const [ robotResult ] = useState<any>(null);
  const [ , codeSet ] = useState('');

  const submit = () => {
    try {
      if (service.validate && service.validate()) {
        onSubmit(Object.assign({}, service.values, robotResult));
      }
    } catch(error) { }
  }

  const change =  (value: any, set: Function, key: string) => {
    set(value);
    service.set(key, value);
  }

  return (
    <>
      {account && account.email ? <p className="double-verify-phone-tips">{ I18n['验证验证码发送至'] }{account.email?.split('@')[0].slice(0,3) + '***@' + account.email?.split('@')[1]}</p> : <p className="double-verify-phone-tips">{I18n['验证码将发送至已绑定邮箱']}</p>}
      <Form
        ref={ (ref: any) => ref && service.registerValidate(() => ref.validate()) }
      >
        <CodeItem 
          api={ getEmailVerifyCode } 
          rule={ formatRules(rules.code, I18n) } 
          account={ account } 
          codeType="login_verify"
          placeholder={ I18n['请输入邮箱验证码'] }
          onChange={(value: any) => change(value, codeSet, 'email_code')}
          onSubmit={submit}
        />
        <FormItem>
          <div className='bktrade-account-btns'>
          <Button type="primary" isBlock={true} loading={loading} onClick={ () => submit() }>{I18n['确定']}</Button>
          </div>
        </FormItem>
      </Form>
    </>
  );
};

interface DoubleVerifyProps {
  types: string[];
  I18n: any;
  loading?: boolean;
  needTitle?: boolean;
  account?: PhoneAccount | EmailAccount | ThirdPartyAccount;
  onSubmit?: (params: any) => void;
  onEmitStatus?: (status: any) => void;
}

export const DoubleVerify = ({
  types, 
	I18n, 
	account,
	needTitle = false, 
	loading = false,
	onSubmit = () => {}, onEmitStatus = () => {}}: DoubleVerifyProps
) => {
  const [ type, typeSet ] = useState<string>(types[0]);

  const toggle = (type: 'phone' | 'google' | 'email') => {
    onEmitStatus(type);
    typeSet(type);
  };

  const memoSMSForm = useMemo(() => {
    return <SMSVerifyForm 
      account={account}
      loading={loading}
      I18n={I18n}
      service={ createDoubleVerifyService(SMSVerifyService) }
      onSubmit={ onSubmit }
    />
    /**ealint-disable */
  }, [loading, I18n]);

  const memoGAForm = useMemo(() => {
    return <GAVerifyForm
		I18n={I18n}
		loading={loading}
    service={ createDoubleVerifyService(GAVerifyService) } 
    onSubmit={ onSubmit }/>;
    /**eslint-disable */
  }, [I18n. loading]);

  const momoEmailForm = useMemo(() => {
		return <EmailVerifyForm
			account={ account }
			loading={loading}
			I18n={I18n}
      service={ createDoubleVerifyService(EmailVerifyService) }
      onSubmit={ onSubmit }/>;
	}, [I18n, loading]);

  return (
    <div>
      {needTitle ? 
        <p>
          <span>{type === 'phone' ? '手机验证' : type === 'google' ? '谷歌验证' : '邮箱验证'}</span>
          <span className='text-line'></span>
        </p> 
        : null
      }
      { type === 'phone' ? memoSMSForm: type === 'google' ? memoGAForm : momoEmailForm }
      <div>
        {
          types.map((item: any, index: number) => {
            return <Fragment key={index}>
              {
                item === type ? null : <span key={index} onClick={()=>toggle(item)}>{ item === 'phone' ? '使用手机验证' : item === 'google' ? '使用谷歌验证' : '使用邮箱验证' }</span>
              }
            </Fragment>
          })
        }
      </div>
    </div>
  )
}