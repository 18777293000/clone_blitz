import React, { useRef } from "react";
import { useNavigate } from "react-router";
import { useObservable } from "rxjs-hooks";
import './style.scss';

import { enviroment } from "../../../../enviroments/enviroment";
import { I18nServiceFactory } from "../../../../common/services/i18n";
import { Storage } from "../../../../common/storage/local.storage";
import { globalConfigerviceFactory } from "../../../../services/global/config";
import { Tabs, TabItem } from "../../../../frame/tabs/tabs";

import Login from '../../../../render/account/components/login';
import Signup from 'render/account/components/signup';
import ForgetPsw from 'render/account/components/forgotPassword';
const session = new Storage('session');
export default ({type = 'login'} : { type: string }) => {
  const navigate = useNavigate();
  const globalconfigervice = useRef(globalConfigerviceFactory());
  const i18nService = useRef(I18nServiceFactory());

  const lang = useObservable(() => globalconfigervice.current.lang$) || '';
  const I18n = i18nService.current.getI18n('home', lang);
  const url = enviroment.legalDomain.indexOf(window.location.hostname)>-1 ? 'https://fast-gateway.com' : `https://${window.location.hostname}`;

  const goBack = () => {
    const path = session.get('bktrade_pre_path') || '/';
    session.delete('bktrade_pre_path');
    navigate(path);
  };

  const map = {
    login: <Login onSuccess={goBack} I18n={I18n} />,
    signup: <Signup onSuccess={goBack} I18n={I18n} />,
    forget: <ForgetPsw onSuccess={() => navigate('/account/login')} I18n={I18n} />
  };
  //@ts-ignore
  const switchComponent = map[type];
  return (
    <div className='bktrade-account-wrap'>
      <div className='bktrade-account-container'>
        <p className='bktrade-account-confirm'>
          <span className='bktrade-account-confirm-text'>{I18n['测试']}请确认您在访问</span>
          <span className='bktrade-account-confirm-url'>{ url }</span>
        </p>
        <div className='bktrade-account-form'>
          { switchComponent ? switchComponent : '' }
        </div>
      </div>
    </div>
  )
}