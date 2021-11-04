import React, { useRef, lazy, Suspense, useEffect, useState } from "react";
import './style.scss';
import { cache } from 'swr';
import { useObservable } from 'rxjs-hooks';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { globalConfigerviceFactory } from "./services/global/config";
import { bkEventServiceFactory } from "./common/services/event";
import { userServiceFactory } from "./services/account/user";
import { tradeConfigServiceFactory } from "./services/global/trade.config";
import { commandManagerServiceFactory } from "./common/services/command";
import { WatchUserActionServiceFactory } from "./services/watch.user.action";
import { initialFgsSocketConfigSocket, initialTradeSocket, socketManagerManager } from './services/global/socket';
import { orderStreamServiceFactory } from './services/global/order.stream';
import { customerServiceFactory } from "./services/customer";
import { layoutControlServiceFactory } from "./services/layout.control";
import { initInterceptor } from './services/global/request.interceptor';
import { cleatHTTPCache } from './frame/utils/http';

import { BKTradeHeader } from './render/layout/components/header/header';

import Help from './render/help';
import Account from './render/account';
import OTC from './render/otc';

const Notice = lazy(() => import('./render/help/pages/notices/notices'));
const NoticesDetail = lazy(() => import('./render/help/pages/notices.detail/notices.detail'));

const bkevent = bkEventServiceFactory();

//初始化http请求拦截器，特别是response拦截器，让httpManagerService中的promise能够直接返回需要的数据，而不是没处理的，带有code的数据体 
initInterceptor();

const userService = userServiceFactory();

globalConfigerviceFactory();

const tradeConfigService = tradeConfigServiceFactory();

const commandManagerService = commandManagerServiceFactory();

const WatchUserActionService = WatchUserActionServiceFactory();

const socketmanagerService = socketManagerManager();

const fgsSocket = initialFgsSocketConfigSocket();
fgsSocket.startup();
socketmanagerService.register('fgs.socket', fgsSocket);
const tradeSocket = initialTradeSocket();
// tradeSocket.startup(); //先关了，数据数据用不上，还老是抱错
socketmanagerService.register('trade.socket', tradeSocket);

const orderStreamService = orderStreamServiceFactory();

const customerService = customerServiceFactory();
customerService.startup();

const auth$ = userService.auth$.pipe();

const App = () => {
  const basename = '';
  const layoutControlService = useRef(layoutControlServiceFactory());

  const user = useObservable(() => userService.user$);
  const showHeader = useObservable(() => layoutControlService.current.showHeader$);
  const showFooter = useObservable(() => layoutControlService.current.showFooter$);
  const isHiddenDom = useObservable(() => WatchUserActionService.isHiddenDom$);

  const [ visible, visibleSet ] = useState(false);
  const [ licenseType, licenseTypeSet ] = useState('');
  const [ isMobile, isMobileSet ] = useState(false);

  const computeContentHeight = () => {
    const headeHeight = showHeader ? 50 : 0;
    const footerheight = showFooter ? 40 : 0;
    return `100vh - ${headeHeight + footerheight}px`;
  }

  useEffect(() => {
    const licenseUpdate = (event: any) => {
      if((event.message || '').indexOf('/v2/user/account/m_license')){
        visibleSet(true);
      }
    };

    const accountLoginout = () => {
      cache.clear();
      cleatHTTPCache();
    };

    const notLoginIn = (event: any) => {
      if(event.message === 'bkchat'){
        //todo 打开登陆弹窗的功能，但是要写账号模块，还没写，后面再写
        // commandManagerService.exe()
      }else if(event.message !== '/proxy/v2/user/account/m_profile'){
        userService.logout();
      }
    };

    bkevent.addEventListener('LICENSE.UPDATE', licenseUpdate);
    bkevent.addEventListener('ACCOUNT.LOGINOUT', accountLoginout);
    bkevent.addEventListener('NOT.LOGGED.IN', notLoginIn);

    return () => {
      bkevent.remove('LICENSE.UPDATE', licenseUpdate);
      bkevent.remove('ACCOUNT.LOGINOUT', accountLoginout);
      //todo 这个也是还没写的
			// globalTickerStreamService.clear();
      orderStreamService.destory();
    }
  }, []);

  useEffect(() => {
    if(isHiddenDom){
      cache.clear();
    }
  }, [ isHiddenDom ]);

  useEffect(() => {
    tradeConfigService.init(user ? user.id + '' : '');
  }, [ user ]);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPod", "iPad"];
    const isMobile = agents.some((item: string) => userAgent.indexOf(item) > -1);
    isMobileSet(isMobile);
  }, []);

  return (isHiddenDom === null || !isHiddenDom) ? (
    <div className={`bktrade ${isMobile ? 'bktrade-mobile' : 'bktrade-pc'}`}>
      <BrowserRouter>
      { showHeader ? <BKTradeHeader /> : null }
      <div className='bktrade-content' style={{height: `calc(${computeContentHeight()})`}}>
        <Suspense fallback={ null }>
          <Routes basename={ basename }>
            <Route path='/account/*' element={ <Account /> } />
            <Route path="/notices" element={ <Notice /> } />
            <Route path='/notices/detail' element={ <NoticesDetail/> } />
            <Route path='/help/*' element={ <Help /> } />
            <Route path='/otc/*' element={ <OTC /> }></Route>
          </Routes>
        </Suspense>
      </div>
      {/* { showFooter ? <BKTradeFooter /> : null }
      { visible ? <LicenseConfirm type={ licenseType } /> : null } */}
      </BrowserRouter>
    </div>
  ) : null;
};
export default App;