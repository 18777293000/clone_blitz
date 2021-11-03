import React, { useEffect, useRef, useState } from "react";
import { Form, FormItem } from "frame/form";
import { Button } from "frame/button/button";
import { Tabs, TabItem } from "frame/tabs/tabs";
import { Input } from "frame/input/input"; 
import './style.scss';
import { emailForgetPswService, phoneForgetPswService } from "services/account/forget.password";
import { formatRules, isEmail } from "render/account/utils";
import PhoneInput from 'render/account/components/phone.input';
import CodeItem from 'render/account/components/code.item';
import { getEmailVerifyCode, queryPhoneCode } from "api/account";

interface ForgetPSWProps {
  type?: 'phone' | 'email';
  I18n: any;
  onSuccess?: Function;
  isPop?: boolean;
};

export const ForgetPsw = ({type, I18n, onSuccess=()=>{}}: ForgetPSWProps) => {
  const isPhone = type === 'phone';
  const service = useRef<any>(isPhone ? phoneForgetPswService() : emailForgetPswService());
  const rules = service.current.rules;
  const [ areaCode, areaCodeSet ] = useState('+65');
	const [ username, usernameSet ] = useState('');
	const [ password, passwordSet ] = useState('');
	const [ confirmPassoword, confirmPassowordSet ] = useState('');
	const [ usernameValid, usernameValidSet ] = useState(false);
	const [ loading, loadingSet ] = useState(false);
  const map: any ={
    'areaCode': areaCodeSet,
    'countryCode': () => {},
    'phoneNumber': usernameSet,
  };

  const change = (val: any, set: Function, key: string) => {
    set(val);
    service.current.set(key, val);
  };

  const submit = () => {
    try{
      service.current.submit();
    }catch(error){
      loadingSet(false);
    }
  };

  useEffect(() => {
    const observer = service.current.flowStream();
    const subStream = observer.subscribe((state: any) => {
      loadingSet(state.code === 'running');
      if(state.code === 'fail' && state.state){
        const message = state.state.message ? state.state.message : String(state.state);
        alert(message);
      }
      if(state.code === 'success'){
        const lang = document.querySelector('html')?.getAttribute('lang') || 'zh';
        alert(lang === 'zh' ? '登录密码已重置,请使用新密码登录' : 'Password has been reset. Please sign in again with new password.');
        onSuccess();
      }
    });

    return () => {
      subStream && subStream.unsubscribe();

      service.current = null;
    };

    /**eslint-disable */
  }, []);

  return (
    <Form ref={ (ref: any) => ref && service.current.registerValidate(() => ref.validate()) }>
      <FormItem rules={ formatRules(type === 'phone' ? rules.phone : rules.email, I18n) }>
        {
          isPhone ? <PhoneInput
            placeholder='输入手机号'
            onEnter={() => submit()}
            onChange={(key: string, e: any) => change(e, map[key], key)}
            onStateChange={(phoneValid: boolean) => usernameValidSet(phoneValid)}
          ></PhoneInput>
          : <Input
            type='text'
            size='normal'
            value={username}
            onEnter={() => submit()}
            placeholder='请输入邮箱'
            onChange={(value: any) => { usernameValidSet(isEmail(value));change(value, usernameSet, 'email') }}
          ></Input>
        }
      </FormItem>
      <FormItem rules={ formatRules(rules.password, I18n) }>
        <Input
          type='password'
          autoComplete='new-password'
          size='normal'
          value={password}
          onEnter={ ()=> submit() }
          onChange={(e: any) => change(e, passwordSet, 'password')}
          placeholder='设置新密码'
        ></Input>
      </FormItem>
      <CodeItem
        api={type === 'phone' ? queryPhoneCode : getEmailVerifyCode}
        rule={ formatRules(rules.code, I18n) }
        placeholder={type === 'phone' ? '请输入手机验证码' : '请输入邮箱验证码'}
        account={ isPhone ? {number: username, country: areaCode.replace('+', '00')} : {email: username} }
        accountValid={usernameValid}
        codeType='reset_password'
        onChange={(e: any) => change(e, () => {}, 'code')}
        onSubmit={submit}
      ></CodeItem>
      <FormItem>
        <div>
          <Button type='primary' isBlock={true} loading={loading} onClick={()=>submit()}>完成</Button>
        </div>
      </FormItem>
    </Form>
  )
};

export default ({ I18n, onSuccess = () => {}, isPop = false }:ForgetPSWProps) => {
	const actionRender = ()=>{
    const { Link } = require('react-router-dom');
    return <div className="bktrade-account-actions">
      <Link to="/account/login"><span>{'登录'}</span></Link>&nbsp; | &nbsp;
      <Link to="/account/signup"><span>{'注册'}</span></Link>
    </div>
	}

	return(
		<div className="bktrade-signin-signup">
			<p className="bktrade-account-title"><span className="title-text">{'找回密码'}</span><span className="title-line"></span></p>
			<Tabs value={ 'email' }>
				<TabItem value="email" label={'邮箱'}>
					<ForgetPsw type="email" I18n={I18n} onSuccess={onSuccess}/>
				</TabItem>
				<TabItem value="phone" label={'手机'}>
					<ForgetPsw type="phone" I18n={I18n} onSuccess={onSuccess}/>
				</TabItem>
			</Tabs>
			{!isPop ? actionRender() : null}
		</div>
	)
}
