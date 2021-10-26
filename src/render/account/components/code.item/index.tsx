import React, { useState, useEffect } from "react";
import './style.scss';
import { Form, FormItem } from "../../../../frame/form";
import { SMSCodeService, phoneCodeService, VoiceCodeService } from '../../../../services/account/phone.code';
import { PhoneAccount, EmailAccount } from "../../../../types/account";
import getCodeBtn from "../get.code.btn";

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
    // !!voiceShow && 
  }
};