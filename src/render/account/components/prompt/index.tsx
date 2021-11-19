import React, { useRef } from "react";
import { useObservable } from "rxjs-hooks";
import { I18nServiceFactory } from "common/services/i18n";
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
  
}