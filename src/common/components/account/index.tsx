import React, { useState, useRef } from "react";
import { useObservable } from "rxjs-hooks";
import './style.scss';

import { enviroment } from "src/enviroments/enviroment";
import { I18nServiceFactory } from "common/services/i18n";
import { globalConfigerviceFactory } from "services/global/config";
import Login from "render/account/components/login";
import Signup from "render/account/components/signup";
import ForgetPsw from "render/account/components/forgotPassword";

export default ({defaultType = 'login', onSuccess = () => {}}:{defaultType?: 'login' | 'signup' | 'forget', onSuccess?:Function}) => {
  const globalConfigervice = useRef(globalConfigerviceFactory());
  const i18nService = useRef(I18nServiceFactory());

  const lang = useObservable(() => globalConfigervice.current.lang$) || '';
  const I18n = i18nService.current.getI18n('home', lang);

  const [ type, typeSet ] = useState(defaultType);

  const url = enviroment.legalDomain.indexOf(window.location.hostname) > -1 ? `https://${window.location.hostname}` : 'https://baidu.com';

  const map = {
    login: <Login onSuccess={onSuccess} I18n={I18n} isPop={true} />,
    signup: <Signup onSuccess={onSuccess} I18n={I18n} isPop={true} />,
    forget: <ForgetPsw onSuccess={() => typeSet('login')} I18n={I18n} isPop={true} />
  }

  return (
    <div>
      👴
    </div>
  )
};