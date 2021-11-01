import React, { useEffect, useRef, useState } from "react";
import { FormItem, Form } from "frame/form";
import { Button } from "frame/button/button";
import { Input } from "frame/input/input";
import { Tabs, TabItem } from "frame/tabs/tabs";
import { phoneSignupService, emailSignupService } from "services/account/signup";
import CodeItem from "render/account/components/code.item";
import { formatRules } from "render/account/utils";
import './style.scss';
import { getEmailVerifyCode, getSignupCode } from "api/account";

export const Signup = ({ type, I18n, onSuccess = () => {} }: { type: 'phone' | 'email', I18n:any, onSuccess?: Function }) => {
  const isPhone = type === 'phone';
  const service = useRef<any>(isPhone ? phoneSignupService() : emailSignupService());
  const rules = service.current.rules;
  const [ areaCode, areaCodeSet ] = useState<string>('+65');
  const [ username, usernameSet ] = useState('');
	const [ password, passwordSet ] = useState('');
  const [ , codeSet ] = useState('');
	const [inviterHid, inviterHidSet] = useState('');
	const [privacyChecked, privacyCheckedSet] = useState(true);
	const [ loading, loadingSet ] = useState(false);
	const [ step, stepSet ] = useState(1);

  const change = (e: any, set: Function, key: string) => {
    const value: any = e.target ? e.target?.value : e;
    set(value);
    service.current.set(key, value);
  };

  const submit = () => {
    try{
      if(step === 1){
        service.current.validate() && stepSet(2);
        return;
      }
      service.current.submit();
    }catch(error){
      loadingSet(false);
    }
  };

  useEffect(() => {
    const observer = service.current.flowStream();
    const subStream = observer.subscribe((state: any) => {
      loadingSet(state.code === 'running');
      if(state.code === 'success'){
        onSuccess();
      }
      if(state.code === 'fail' && state.state){
        const message = state.state.message ? state.state.message : String(state.state);
        alert(message);
      }
    });

    return () => {
      subStream && subStream.unsubscribe();
      service.current = null;
    }
  }, [])

  return (
    <Form ref={ (ref: any) => { ref && service.current.registerValidate(() => ref.validate()); console.log('ref', ref) } }>
      {step === 1 ?
        <>
          <FormItem rules={ formatRules(type === 'phone' ? rules.phone : rules.email, I18n) } >
            <Input
              after={ isPhone ? '选择国家' : null }
              type = { isPhone ? 'number' : 'text' }
              size='normal'
              value={username}
              onEnter={() => submit()}
              onChange={(e: any) => change(e, usernameSet, isPhone ? 'phoneNumber' : 'email')}
              placeholder={isPhone ? '输入手机号' : '输入邮箱'}
            ></Input>
          </FormItem>
          <FormItem>
            <Input
              type='password'
              autoComplete='new-password'
              size='normal'
              value={password}
              onEnter={() => submit()}
              onChange={(e: any) => change(e, passwordSet, 'password')}
              placeholder={'请输入密码'}
            ></Input>
          </FormItem>
          <FormItem>
            <Input
              type='text'
              name='inviterHid'
              size='normal'
              value={inviterHid}
              placeholder={'请输入邀请码'}
              onEnter={ () => submit() }
              onChange={ (e:any) => change(e, inviterHidSet, 'inviter_hid') }
            ></Input>
          </FormItem>
        </>
        : <>
          <CodeItem
            placeholder={type === 'phone' ? '请输入验证码' : '还是输入验证码'}
            api={type === 'phone' ? getSignupCode: getEmailVerifyCode}
            rule={ formatRules(rules.code, I18n) }
            account={ isPhone ? { number: username, country: areaCode } : { email: username } }
            accountValid={true}
            codeType='register'
            onChange={(e: any) => change(e, codeSet, 'code')}
            onSubmit={submit}
          ></CodeItem>
        </>
      }
      <FormItem>
        <div>
					<a href="https://bitkan.cc/zh/help/protocol" target="_blank" rel="noopener noreferrer">{'《服务协议》'}</a><span>{'和'}</span>
					<a href="https://bitkan.cc/zh/help/privacy" target="_blank" rel="noopener noreferrer">{'《隐私政策》'}</a>
        </div>
      </FormItem>
      <FormItem>
        <div>
          <Button type='primary' isBlock={true} loading={loading} onClick={() => submit()} disabled={!privacyChecked}>{ step === 1 ? '下一步' : '注册' }</Button>
        </div>
      </FormItem>
    </Form>
  )
};

export default ({onSuccess=()=>{}, I18n, isPop=false}: {onSuccess: Function, I18n: any, isPop?: boolean}) => {
  const actionRender = () => {
    const { Link } = require('react-router-dom');
    return <div>
      <p>已有账账户?<Link to='/account/login'><span>登陆</span></Link></p>
    </div>
  }

  return (
    <>
      <div>
        <p><span>注册</span></p>
        <Tabs value={'email'}>
          <TabItem value="email" label='邮箱'>
            <Signup type='email' I18n={I18n} onSuccess={onSuccess}></Signup>
          </TabItem>
          <TabItem value='phone' label='手机'>
            <Signup type='phone' I18n={I18n} onSuccess={onSuccess}></Signup>
          </TabItem>
        </Tabs>
        { !isPop ? actionRender() : null }
      </div>
    </>
  )
};