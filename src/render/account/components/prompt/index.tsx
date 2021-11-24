import React, { useRef } from "react";
import { useObservable } from "rxjs-hooks";
import { I18nService, I18nServiceFactory } from "common/services/i18n";
import { globalConfigerviceFactory } from "services/global/config";
import { NumberPassword } from "frame/number.password/number.password";
import { checkSecurityPassword } from "api/account";
import './style.scss';

interface PromptProps {
  token: string;
  id: string;
  onSubmit?: (ps: string) =>  void;
  onCancel?: () => void;
  onLoginOut?: () => void;
}

export default ({ id, token, onSubmit=()=>{}, onCancel=()=>{}, onLoginOut=()=>{} }: PromptProps) => {
  const globalConfigervice = useRef(globalConfigerviceFactory());
  const I18nService = useRef(I18nServiceFactory());
  const lang = useObservable(() => globalConfigervice.current.lang$) || '';
  const I18n = I18nService.current.getI18n('home', lang);

  const checkPassword = (value: string) => {
    checkSecurityPassword({
      id,
      token,
      sp: value
    }).promise().then(() => {
      onSubmit(value);
    }).catch((error: any) => {
      alert(error.message);

      if(error.code === 11){
        onLoginOut();
      }
    })
  }
  return (
    <div>
      <div>{'请输入6位数字资金密码'}</div>
      <NumberPassword onComplate={ checkPassword } />
      <a href='/account/sp/reset'>忘记密码</a>
    </div>
  )
}