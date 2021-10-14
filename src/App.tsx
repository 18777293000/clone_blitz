import React, { useRef, lazy, Suspense, useEffect, useState } from "react";
import { cache } from 'swr';
import { useObservable } from 'rxjs-hooks';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { globalConfigerviceFactory } from "./services/global/config";
import { bkEventServiceFactory } from "./common/services/event";

const Notice = lazy(() => import('./render/help/pages/notices/notices'));
const NoticesDetail = lazy(() => import('./render/help/pages/notices.detail/notices.detail'));

const bkevent = bkEventServiceFactory();

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