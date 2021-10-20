import React, { lazy, Suspense, useState, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router";
import { filter, map } from "rxjs/operators";
import { useObservable } from "rxjs-hooks";
import { AuthGuard } from "../../common/components/auth.guard";

import { commandManagerServiceFactory } from "../../common/services/command";
import { userServiceFactory } from "../../services/account/user";

const Account = lazy(() => import('./pages/account'));

export default () => {
  const userService = useRef(userServiceFactory());
  const auth$ = userService.current.auth$.pipe(filter(val => !val !== undefined));

  return (
    <div className='bktrade-account'>
      <Suspense fallback={ null }>
        <Routes>
          <Route path='' element={
            <AuthGuard Component={ <Account type='login' /> }
              canActive={ () => auth$.pipe(map(val => !val)) }
            />
           } />
           <Route path='/login' element={
             <AuthGuard Component={ <Account type='login' /> } 
              canActive={ () => auth$.pipe(map(val => !val)) }
             />
           } />
        </Routes>
      </Suspense>
    </div>
  )
}