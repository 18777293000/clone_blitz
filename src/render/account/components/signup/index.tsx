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
              after={ isPhone ? '????????????' : null }
              type = { isPhone ? 'number' : 'text' }
              size='normal'
              value={username}
              onEnter={() => submit()}
              onChange={(e: any) => change(e, usernameSet, isPhone ? 'phoneNumber' : 'email')}
              placeholder={isPhone ? '???????????????' : '????????????'}
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
              placeholder={'???????????????'}
            ></Input>
          </FormItem>
          <FormItem>
            <Input
              type='text'
              name='inviterHid'
              size='normal'
              value={inviterHid}
              placeholder={'??????????????????'}
              onEnter={ () => submit() }
              onChange={ (e:any) => change(e, inviterHidSet, 'inviter_hid') }
            ></Input>
          </FormItem>
        </>
        : <>
          <CodeItem
            placeholder={type === 'phone' ? '??????????????????' : '?????????????????????'}
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
					<a href="https://bitkan.cc/zh/help/protocol" target="_blank" rel="noopener noreferrer">{'??????????????????'}</a><span>{'???'}</span>
					<a href="https://bitkan.cc/zh/help/privacy" target="_blank" rel="noopener noreferrer">{'??????????????????'}</a>
        </div>
      </FormItem>
      <FormItem>
        <div>
          <Button type='primary' isBlock={true} loading={loading} onClick={() => submit()} disabled={!privacyChecked}>{ step === 1 ? '?????????' : '??????' }</Button>
        </div>
      </FormItem>
    </Form>
  )
};

export default ({onSuccess=()=>{}, I18n, isPop=false}: {onSuccess: Function, I18n: any, isPop?: boolean}) => {
  const actionRender = () => {
    const { Link } = require('react-router-dom');
    return <div>
      <p>????????????????<Link to='/account/login'><span>??????</span></Link></p>
    </div>
  }

  return (
    <>
      <div>
        <p><span>??????</span></p>
        <Tabs value={'email'}>
          <TabItem value="email" label='??????'>
            <Signup type='email' I18n={I18n} onSuccess={onSuccess}></Signup>
          </TabItem>
          <TabItem value='phone' label='??????'>
            <Signup type='phone' I18n={I18n} onSuccess={onSuccess}></Signup>
          </TabItem>
        </Tabs>
        { !isPop ? actionRender() : null }
      </div>
    </>
  )
};