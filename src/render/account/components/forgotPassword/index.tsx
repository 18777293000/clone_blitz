import React, { useEffect, useRef, useState } from "react";
import { Form, FormItem } from "frame/form";
import { Button } from "frame/button/button";
import { Tabs, TabItem } from "frame/tabs/tabs";
import { Input } from "frame/input/input"; 
import './style.scss';
import { emailForgetPswService, phoneForgetPswService } from "services/account/forget.password";

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
      
    </Form>
  )
};

export default ({ I18n, onSuccess = () => {}, isPop = false }:ForgetPSWProps) => {
	const actionRender = ()=>{
    const { Link } = require('react-router-dom');
    return <div className="bktrade-account-actions">
      <Link to="/account/login"><span>{I18n['登录']}</span></Link>&nbsp; | &nbsp;
      <Link to="/account/signup"><span>{I18n['注册']}</span></Link>
    </div>
	}

	return(
		<div className="bktrade-signin-signup">
			<p className="bktrade-account-title"><span className="title-text">{I18n['找回密码']}</span><span className="title-line"></span></p>
			<Tabs value={ 'email' }>
				<TabItem value="email" label={I18n['邮箱']}>
					<ForgetPsw type="email" I18n={I18n} onSuccess={onSuccess}/>
				</TabItem>
				<TabItem value="phone" label={I18n['手机']}>
					<ForgetPsw type="phone" I18n={I18n} onSuccess={onSuccess}/>
				</TabItem>
			</Tabs>
			{!isPop ? actionRender() : null}
		</div>
	)
}
