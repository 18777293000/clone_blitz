import React, { useRef, useState, useEffect, Fragment } from "react";
import { useObservable } from "rxjs-hooks";
import { Button } from "frame/button/button";
import { Input } from "frame/input/input";
import { Form, FormItem } from "frame/form";
import { getPhoneCode, getEmailCode } from "api/account";
import { I18nServiceFactory } from "common/services/i18n";
import { globalConfigerviceFactory } from "services/global/config";
import { userServiceFactory } from "services/account/user";
import { safetyVerifyService } from "services/account/safety.verify";
import CodeItem from "render/account/components/code.item";
import { formatRules } from "render/account/utils";
import './style.scss';

const safetyMap:any = {
	phone: {
		text: '手机验证',
		bindKey: 'phone_num',
		openKey: 'second_sms_verify',
		bindUrl: '/account/phone/bind',
		openUrl: '/account/setting'
	},
	google: {
		text: '谷歌验证',
		bindKey: 'google_bind_status',
		openKey: 'second_google_verify',
		bindUrl: '/account/google/bind',
		openUrl: '/account/setting'
	},
	email: {
		bindKey: 'email',
		openKey: 'second_email_verify',
		text: '邮箱验证',
		bindUrl: '/account/email',
		openUrl: '/account/setting'
	},
};
export const SafetyTips = ({ tips = '', onNavigate = () => {} }: { tips?: string, onNavigate?: Function}) => {
  const userService = useRef(userServiceFactory());
  const globalConfigService = useRef(globalConfigerviceFactory());
  const i18nService = useRef(I18nServiceFactory());

  const lang = useObservable(() => globalConfigService.current.lang$) || '';
  const I18n = i18nService.current.getI18n('home', lang);
  const user = useObservable(() => userService.current.user$);
  console.log(1, user);
  const getData = (info: any) => {
    const cUser: any = user || {};
    const isBind = user && cUser[info.bindKey];
    const isOpen = user && cUser[info.openKey];
    return {
      icon: isBind && isOpen ? 'bktrade-icon-success_fill' : 'bktrade-icon-fail_fill',
			text: info.text,
			btn: !isBind ? I18n['去绑定'] : !isOpen ? I18n['去开启'] : I18n['已开启'],
			disabled: isBind && isOpen,
			url: !isBind || !isOpen ? info[!isBind ? 'bindUrl' : 'openUrl'] : ''
    }
  };

  const click = (url: string) => {
    url && onNavigate(url);
  };

  // if(!user){
  //   return null;
  // };

  return (
    <div>
      <p>{ tips ? tips : '当前账号安全等级较低，请至少开启两项安全验证'}</p>
      <div>
        {
          ['phone', 'google', 'email'].map((type: string, index: number) => {
            const item = getData(safetyMap[type]);
            return <div key={index}>
              <span>{item.icon}</span>
              <Button type='primary' disabled={item.disabled} onClick={()=> click(item.url)}>{item.btn}{index}</Button>
            </div>
          })
        }
      </div>
    </div>
  )
};

const GoogleCodeItem = ({
	I18n, 
	rules, 
	onSubmit = () => {}, 
	onChange = () => {}}:{I18n:any, rules:any, onSubmit?:Function; onChange?:Function}) => {
    const [ code, codeSet ] = useState('');
    return <FormItem 
      label='谷歌验证码'
      rules={ formatRules(rules.code, I18n) }
    >
      <Input 
        type='number'
        size='normal'
        name='googleCode'
        placeholder={'请输入验证码'}
        value={code}
        onEnter={()=> onSubmit()}
        onChange={(e: any) => {codeSet(e); onChange(e)}} />
    </FormItem>
  };

  interface SafetyVerifyProps {
    codeType: any;
    verifyTypes?: string[];
    isResend?: boolean;
    onClose?: Function;
    onSubmit?: Function;
  };

  export const SafetyVerify = ({
    codeType,
    verifyTypes,
    isResend = false,
    onClose = () => {}, 
    onSubmit,
  }: SafetyVerifyProps) => {
    const globalConfigervice = useRef(globalConfigerviceFactory());
    const i18nService = useRef(I18nServiceFactory());
    const userService = useRef(userServiceFactory());
    const formService = useRef(safetyVerifyService());

    const lang = useObservable(() => globalConfigervice.current.lang$) || '';
    const I18n = i18nService.current.getI18n('home', lang);
    const user = useObservable(() => userService.current.user$);
    const rules = formService.current.rules;

    const [ types, typesSet ] = useState<string[]>([]);

    useEffect(() => {
      if(verifyTypes){
        typesSet(verifyTypes);
        return;
      }
      if(!user){return};
      //@ts-ignore
      user.second_sms_verify && types.push('phone');
      //@ts-ignore
      user.second_google_verify && types.push('google');
      //@ts-ignore
      user.second_email_verify && types.push('email');
      typesSet([...types]);
    }, [ user, verifyTypes ]);

    const change = (key: 'google_code'|'phone_code'|'email_code', value: string) => {
      formService.current.set(key, value);
    };

    const submit = () => {
      if(!formService.current.validate()){
        return;
      }
      if(typeof onSubmit === 'function'){
        onClose();
        onSubmit(formService.current.values);
      }
    };

    return (
      <div>
        <Form ref={(ref: any) => ref && formService.current.registerValidate(() => ref.validate())} >
          {
            types.map((type: string, index: number) => {
              return (
                <Fragment key={index} >
                {
                  type === 'google' ?
                  <GoogleCodeItem 
                    rules={rules.code}
                    I18n={I18n}
                    onSubmit={submit}
                    onChange={(value: string) => change('google_code', value)}
                  />
                  : <CodeItem
                    rule={formatRules(rules.code, I18n)}
                    label={type === 'phone' ? '手机验证码' : '邮箱验证码'}
                    codeType={ typeof codeType === 'string' ? codeType : codeType && codeType[type] ? codeType[type] : 'google_auth'}
                    needCheck={false}
                    api={type === 'phone' ? getPhoneCode : getEmailCode}
                    onSubmit={submit}
                    isResend = {isResend}
                    onChange={(value: string) => change(type === 'phone' ? 'phone_code' : 'email_code', value)}
                  ></CodeItem>
                }
                </Fragment>
              )
            })
          }
        </Form>
        <div>
          <Button type='default' onClick={onClose}>取消</Button>
          <Button type='default' onClick={submit}>确定</Button>
        </div>
      </div>
    )
  };