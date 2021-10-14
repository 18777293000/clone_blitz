import React, { useRef, lazy, Suspense, useEffect, useState } from "react";
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

const Notice = lazy(() => import('./render/help/pages/notices/notices'));
const NoticesDetail = lazy(() => import('./render/help/pages/notices.detail/notices.detail'));

const bkevent = bkEventServiceFactory();

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
tradeSocket.startup();
socketmanagerService.register('trade.socket', tradeSocket);




const App = () => {
  const basename = '';

  return (
    <div>
      <BrowserRouter>
        <Suspense fallback={ null }>
          <Routes basename={ basename }>
            <Route path="/notices" element={ <Notice /> } />
            <Route path='/notices/detail' element={ <NoticesDetail/> } />
          </Routes>
        </Suspense>
      </BrowserRouter>
      
    </div>
  )
};
export default App;