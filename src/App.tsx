import React, { useRef, lazy, Suspense, useEffect, useState } from "react";
import { cache } from 'swr';
import { useObservable } from 'rxjs-hooks';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { globalConfigerviceFactory } from "./services/global/config";

const Notice = lazy(() => import('./render/help/pages/notices/notices'));


const App = () => {

  return (
    <div>
      <BrowserRouter>
        <Suspense fallback={ null }>
          <Route path="/notices" element={ <Notice /> } />
        </Suspense>
      </BrowserRouter>
    </div>
  )
};
export default App;