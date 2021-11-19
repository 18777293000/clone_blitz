import React, { useState, useEffect, useRef } from "react";
import { useObservable } from "rxjs-hooks";
import { useNavigate } from "react-router";
import { Form, FormItem } from "frame/form";
import { Button } from "frame/button/button";
import { Input } from "frame/input/input";
import { dialog, DialogModel } from "frame/dialog/dialog";
import { mul, division } from "frame/utils/number";
import { toFixedFix } from "frame/utils";
import { addOTCOrder, queryADPrice } from "api/otc";
import { userServiceFactory } from "services/account/user";
import { commandManagerServiceFactory } from "common/services/command";
import { tradeConfigServiceFactory } from "services/global/trade.config";
import { computPrecision, currencyToSymbol } from "frame/utils/tools";
import { OTCTypes } from "render/otc/components/otc.types/otc.type";
import { showSPTips } from "render/otc/components/account.tips/index";
import { IPayment } from "types/otc";
import { i18nTool } from "i18n/index";
import './style.scss';

interface QueryADPriceProps {
  id: string;
  coin: string;
  direction: '1' | '2';
  I18n: any;
  limit: { low: number, upper: number };
  payments: IPayment[];
  currency?: string;
};

export const QueryADPrice = ({limit, direction, coin, id, payments, I18n, currency='CNY'}: QueryADPriceProps) => {
  const navigate = useNavigate();
  const dialogIns = useRef<any>(null);
  const userService = useRef(userServiceFactory());
  const commandManagerService = useRef(commandManagerServiceFactory());

  const user = useObservable(() => userService.current.user$);

  const [ isLoading, isLoadingSet ] = useState(false);

  const submit = () => {
    isLoadingSet(true);

    if(!user){
      isLoadingSet(false);

    }
  }
};