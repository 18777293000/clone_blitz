import React, { useState, useEffect } from "react";
import './style.scss';
import { Form, FormItem } from "../../../../frame/form";
import { Input } from "../../../../frame/input/input";
import { SMSCodeService, phoneCodeService, VoiceCodeService } from '../../../../services/account/phone.code';
import { PhoneAccount, EmailAccount } from "../../../../types/account";
import GetCodeBtn from "../get.code.btn";

interface CodeItemProps {
  api?:(params?: any) => Promise<any>;
	rule?:any, 
	label?:string;
	placeholder?:string;
	account?:PhoneAccount | EmailAccount | {};
	accountValid?:boolean;
	codeType?:string;
	needCheck?:boolean;
	onChange?:Function;
	onSubmit?:Function;
};

export default ({
  api,
	rule, 
	label = '',
	placeholder = '请输入验证码',
	codeType = 'login_verify',
	needCheck = true,
	account={},
	accountValid=true,
	onChange = () => {}, 
	onSubmit=()=> {}
}: CodeItemProps) => {
  const [ voiceShow, voiceShowSet ] = useState<boolean>(false);
  const [ code, codeSet ] = useState<string>('');
  const [ , robotResultSet ] = useState<any>(null);
  const [smsDisabled, smsDisabledSet ] = useState<boolean>(true);
  const [ voiceDisabled, voiceDisabledSet ] = useState<boolean>(true);

  const change = (type: string, value: boolean, voiceShow?: boolean) => {
    !!voiceShow && voiceShowSet(true);
    type === 'sms' && voiceDisabledSet(value);
    type === 'voice' && smsDisabledSet(value);
  };

  useEffect(() => {
    smsDisabledSet(!accountValid);
    voiceDisabledSet(!accountValid);
  }, [accountValid]);
  return (
    <>
      <FormItem rules={rule} label={label}>
        <Input
          type='text'
          size='normal'
          value={code}
          onEnter={()=>onSubmit()}
          onChange={(value: any) => {codeSet(value);onChange(value)}}
          placeholder={placeholder}
          after={
            <GetCodeBtn
              type='sms'
              //@ts-ignore
              api={api}
              needCheck={needCheck}
              codeType={codeType}
              disabled={smsDisabled}
              service={phoneCodeService(SMSCodeService)}
              onStateChange={(value: boolean, voiceShow: boolean) => change('sms', value, voiceShow)}
              onSuccess={ (result: any) => robotResultSet(result) }
            />
          }
        ></Input>
        {voiceShow && <GetCodeBtn
            type='voice'
            //@ts-ignore
            api={api}
            needCheck={needCheck}
            account={account}
            codeType={codeType}
            disabled={voiceDisabled}
            service={phoneCodeService(VoiceCodeService)}
            onStateChange={(value: boolean) => change("voice", value)}
            onSuccess={(result: any) => robotResultSet(result)}
          />
        }
      </FormItem>
    </>
  )
};