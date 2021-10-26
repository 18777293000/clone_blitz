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
  }, []);

  const countdown = () => {
    const nextVal = totalTime.current - 1;
    totalTime.current = nextVal;
    if(nextVal <= 0){
      isHadSendCodeSet(false);
      CodeMsgSet(type === 'sms' ? '重新获取' : '使用语言验证');
      onStateChange(false, verifyWay.current === 1);
      clearTimeout(timer.current);
      return;
    }
    CodeMsgSet(type === 'sms' ? `(${totalTime.current}s)${'重新获取'}` : `${'使用语音验证'}(${totalTime.current}S)`);
    timer.current = setTimeout(() => {
      countdown();
    }, 1000);
  };

  const unsub = () => {
    observerSub.current && observerSub.current.unsubscribe();
  };

  const success = (state: any) => {
    verifyWay.current = state?.verify_way;
    isHadSendCodeSet(true);
    totalTime.current = 60;
    countdown();
    onSuccess(state);
  };

  const fail = (state: any) => {
    onStateChange(false);
    isHadSendCodeSet(false);
    if(state === null){return};
    alert(state);
  };

  const submit = () => {
    onStateChange(true);
    unsub();
    isHadSendCodeSet(true);
    observerSub.current = service?.getPhoneCode(api, Object.assign({}, account, {
      uuid: 'web',
      code_type: codeType,
    }), needCheck).subscribe((flow: FlowState) => {
      loadingSet(flow.code === 'running');
      flow.code === 'success' && success(flow.state);
      flow.code === 'fail' && fail(flow.state);
      (flow.code === 'success' || flow.code === 'fail') && unsub();
    });
  };

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
      unsub();
    }
  }, []);

  useEffect(() => {
    if(isResend){
      success('success');
    }
    /**eslint-disable */
  }, [isResend, lang]);

  return (
    <div className='bktrade-get-code-btn'>
      <button className={type} type='button' disabled={isHadSendCode || disabled} onClick={() => submit()}>
        {loading ? <Loading /> : <span>{codeMsg}</span>}
      </button>
    </div>
  )
}