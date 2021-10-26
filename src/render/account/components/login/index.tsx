import React, { useEffect, useMemo, useRef, useState } from "react";
import './style.scss';
import { Button } from "../../../../frame/button/button";
import { Tabs, TabItem } from "../../../../frame/tabs/tabs";
import { Form, FormItem } from "../../../../frame/form";
import { Input } from "../../../../frame/input/input";
import { emailLoginService, phoneLoginService, createDoubleVerifyService } from '../../../../services/account/login';
import { FlowState } from "../../../../common/services/workflow";
import { GAVerifyService, SMSVerifyService } from "../../../../services/account/double.verify";
import { formatRules } from "../../utils";
import { PhoneAccount, EmailAccount } from "../../../../types/account";
import { SMSVerifyForm, GAVerifyForm } from "../double.verify";

type LoginVerify = '0' | '1';

interface DoubleVerifySeting{
  login_email_verify: LoginVerify;
  login_google_verify: LoginVerify;
  login_phone_verify: LoginVerify;
}

export default ({onSuccess = () => {}, I18n, isPop = false }: { onSuccess?: Function, I18n: any, isPop?: boolean }) => {

  const [ loginStatus, loginStatusSet ] = useState<null | 1 | 2 | 3 | 4>(null);

  const changeLoginStatus = (status: null | 1 | 2| 3 | 4) => {
    loginStatusSet(status);
  };

  const actionRender = () => {
    const { Link } = require('react-router-dom');
    return <div className='bktrade-account-actions'>
      <Link to='/account/forgetPassword'>
        <span style={{marginBottom: '10px'}}>忘记密码</span>
      </Link>
      <div>
        没有账户?
        <Link to='/account/signup'>
          <span>注册</span>
        </Link>
      </div>
    </div>
  };
  return (
    <>
      <div className='bktrade-account-login'>
        <p className='bktrade-account-title'>
          <span className="title-text">
            {loginStatus === null ? '登陆' : loginStatus === 1 || loginStatus === 3 ? '手机验证' : '谷歌验证'}
          </span>
          <span className='title-line'></span>
        </p>
        <Tabs value={ 'phone' }>
          <TabItem value='phone' label="手机">
            <LoginForm type='phone' I18n={I18n} onSuccess={onSuccess} OnChangeStatus={changeLoginStatus} />
          </TabItem>
          <TabItem value='email' label='邮箱'>
            <LoginForm type='email' I18n={I18n} onSuccess={onSuccess} />
          </TabItem>
        </Tabs>
        {!isPop ? actionRender() : null}
      </div>
    </>
  )
};

interface LoginFormProps {
  type: 'phone' | 'email';
  I18n: any;
  onSuccess?: Function;
  OnChangeStatus?: Function;
}

const LoginForm = ({I18n, type, onSuccess=()=>{}, OnChangeStatus=()=>{}}: LoginFormProps) => {
  const isPhone = type === 'phone';
  const service = useRef<any>(isPhone ? phoneLoginService() : emailLoginService());
  console.log(1, service.current);
  const loginService = service.current;
  const rules = loginService.rules;

  const [ areaCode, areaCodeSet ] = useState("+65");
  const [ doubleVerifyParams, doubleVerifyParamsSet ] = useState<DoubleVerifySeting | null>(null);
  const [ username, usernameSet ] = useState<string>('');
  const [ password, passwordSet ] = useState<string>('');
  const [ loading, loadingSet ] = useState<boolean>(false);
  const [ loginFailed, loginFailedSet ] = useState<boolean | null>(false);

  const map: any = {
    'areaCode': areaCodeSet,
    'countryCode': () => {},
    'phoneNumber': usernameSet,
  };

  const change = (e: any, set: Function, key: string) => {
    const value = e.label || e;
    set(value);
    loginService.set(key, value);
  };

  const submit = () => {
    console.log('submit');
    return;
    loginService.submit();
  };

  const doubleVerifySuccess = (values: any) => {
    loginService.doubleVerifySuccess(values);
  };

  useEffect(() => {
    const observer = loginService.flowStream();
    const subStream = observer.subscribe((state: FlowState) => {
      loadingSet(state.code === 'running');
      console.log(2.1, state);
      if(state.code === 'fail' && state.state){
        if(state.state.code === 10){
          OnChangeStatus(null);
          loginFailedSet(null);
        }
        const message = state.state.message ? state.state.message : String(state.state);
        alert(message);
      }
      if(state.code === 'success'){
        onSuccess();
      };
      if(state.code === 'running' && state.state && state.state.child && state.state.child === 'doubleVerify'){
        loginFailedSet(false);
        const { data }: { data: DoubleVerifySeting } = state.state;
        doubleVerifyParamsSet(data);
        const status = +data.login_phone_verify === 1 && +data.login_google_verify === 0 ? 1 : +data.login_phone_verify === 0 && +data.login_google_verify === 1 ? 2: 3;
        OnChangeStatus(status);
      }
    });

    return () => {
      subStream && subStream.unsubscribe();
      service.current = null;
    }
    /**eslint-disable */
  }, []);

  return !doubleVerifyParams || loginFailed   
  ? <Form ref={ (ref: any) => ref && loginService.registerValidate(() => ref.validate()) }>
    {
      isPhone
      ? <div className='bktrade-account-login-country_select'>选择国家</div>
      : null
    }
    <FormItem rules={ formatRules(isPhone ? rules.phone : rules.email, I18n) } className={`${ isPhone ? 'bktrade-account-item-phone' : '' }`}>
      {/* <input type='text' placeholder={isPhone ? '请输入手机' : '请输入邮箱'}></input> */}
      <Input 
      tabIndex={1}
      type='text'
      size='normal'
      value={username}
      onEnter={() => submit()}
      onChange={(value: any) => change(value, usernameSet, isPhone ? 'phoneNumber' : 'email')}
      placeholder={isPhone ? '请输入手机号' : '请输入邮箱'}
       />
    </FormItem>
    <FormItem rules={ formatRules(rules.password, I18n) }>
      {/* <input placeholder="请输入密码" type='password'></input> */}
      <Input 
      tabIndex={2}
      type='password'
      size='normal'
      value={password}
      onEnter={()=>submit()}
      onChange={(value: any) => change(value, passwordSet, 'password')}
      placeholder='请输入密码'
       />
    </FormItem>
    <FormItem>
      <div className='bktrade-account-btns'>
        <Button isBlock={true} type='primary' loading={loading} onClick={() => submit()}>登陆</Button>
      </div>
    </FormItem>
  </Form> 
  : <DoubleVerifyFactory
    params={ doubleVerifyParams }
    account={ isPhone ? {number: username, country: areaCode.replace("+", '00')} : {email: username} }
    I18n={I18n}
    onSubmit={params => doubleVerifySuccess(params)}
    onEmitStatus={(status) => {OnChangeStatus(status)}}
  />;
};

interface DoubleVerifyFactoryProps {
  account: PhoneAccount | EmailAccount;
  params: DoubleVerifySeting;
  I18n: any;
  onSubmit: (params: any) => void;
  onEmitStatus: (status: any) => void;
};

const DoubleVerifyFactory = ({account, params, onSubmit, I18n, onEmitStatus}: DoubleVerifyFactoryProps) => {
  const {login_phone_verify, login_google_verify} = params;

  const [type, typeSet] = useState<string | null>( +login_phone_verify === 1 ? 'phone' : (+login_google_verify === 1 ? 'google' : null));

  const toggle = (type: any) => {
    onEmitStatus(type === 'phone' ? 4 : 3);
    typeSet(type === 'phone' ? 'google' : 'phone');
  };

  const memoSMSForm = useMemo(() => {
    return <SMSVerifyForm
      account={account}
      I18n={I18n}
      service={createDoubleVerifyService(SMSVerifyService)}
      onSubmit={onSubmit}
    />
  }, [I18n]);

  const memoGAForm = useMemo(() => {
    return <GAVerifyForm 
      I18n={I18n}
      service={createDoubleVerifyService(GAVerifyService)}
      onSubmit={onSubmit}
    />
  }, [I18n]);

  return (
    <>
      {type === 'phone' ? memoSMSForm : memoGAForm}
      {+login_phone_verify === 1 && +login_google_verify === 1 
      ? <p className='bktrade-account-login-toggle' onClick={()=>{toggle(type)}}>{ type === 'phone' ? '使用谷歌验证' : '使用手机验证' }</p>
       : null
      }
    </>
  )
};