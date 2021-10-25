import React, { useEffect, useRef, useState } from "react";
import { useObservable } from "rxjs-hooks";
import { Loading } from "../../../../frame/loading/loading";
import { FlowState } from "../../../../common/services/workflow";
import { I18nServiceFactory } from "../../../../common/services/i18n";
import { IPhoneCodeService } from "../../../../services/account/phone.code";
import { globalConfigerviceFactory } from "../../../../services/global/config";
import { PhoneAccount, EmailAccount } from "../../../../types/account";
import './style.scss';

interface GetCodeProps {
  api: (params?: any) => Promise<any>;
  type?: 'sms' | 'voice';
  service?: IPhoneCodeService;
  account?: PhoneAccount | EmailAccount | {};
  codeType?: string;
  needCheck?: boolean;
  onSuccess?: Function;
  disabled?: boolean;
  onStateChange?: Function;
  isResend?: boolean;
};

export default (props: GetCodeProps) => {
  const {
    type = 'sms',
		api, 
		service, 
		account = {}, 
		codeType = 'login_verify',
		needCheck = true,
		onStateChange = () => {}, 
		onSuccess = () => {}, 
		disabled = false,
    isResend = false,
  } = props;

  const verifyWay = useRef<any>();
  const totalTime = useRef<any>(60);
  const timer = useRef<any>(null);
  const observerSub = useRef<any>(null);
  const globalConfigervice = useRef(globalConfigerviceFactory());
  const I18nService = useRef(I18nServiceFactory());

  const lang = useObservable(() => globalConfigervice.current.lang$) || '';
  const I18n = I18nService.current.getI18n('home', lang);

  const [ isHadSendCode, isHadSendCodeSet ] = useState(false);
  const [ loading, loadingSet ] = useState(false);
  const [ codeMsg, CodeMsgSet ] = useState('Send');

  useEffect(() => {
    if(lang){
      CodeMsgSet(type === 'sms' ? '获取验证码' : '使用语音验证');
    }
    //@ts-ignore
  }, [ lang, type ]);

  useEffect(() => {
    return () => {
      //@ts-ignore
      I18nService.current = null;
      clearTimeout(timer.current);
    }
  }, [])
}