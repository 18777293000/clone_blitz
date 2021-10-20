import React, { useState, useEffect } from "react";
import { Observable } from "rxjs";
import { Navigate, useParams } from "react-router";
import { Loading } from "../../../frame/loading/loading";

export const AuthGuard = (props: {Component: any, redirect?: any, canActive: () => Observable<boolean> | Observable<undefined> | boolean}) => {
  const { Component, canActive, redirect='/' } = props;
  const [ auth, authSet ] = useState(false);
  const [ isPending, isPendingSet ] = useState(true);

  useEffect(() => {

    const auth$ = canActive();
    let authSub: any = null;
    //@ts-ignore
    if(auth$.subscribe){
      //@ts-ignore
      authSub = auth$.subscribe((r: boolean) => {
        authSet(!!r);
        isPendingSet(false);
      });
    }else{
      authSet(!!auth$);
      isPendingSet(false);
    }

    return () => {
      authSub && authSub.unsubscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isPending ? <Loading /> : (auth ? Component : <Redirect to={redirect} />)
}

export const Redirect = (props: { to: string; keys?: string[] }) => {
  const { to, keys = [] } = props;
  const params = useParams();
  let path = to;
  for(let i = 0; i < keys.length; i++){
    const key = keys[i];
    path = to.replace(`:${key}`, params[key]);
  }
  return <Navigate to={ path } replace />
};