import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { useObservable } from "rxjs-hooks";
import useSWR from "swr";
// import { Table }
import { Breadcrumb, BreadcrumbItem } from "frame/breadcrumb/breadcrumb";
// import { Empty } from 'frame/empty/empty';
// import { Skeleton } from 'frame/skeleton/skeleton';
import { Button } from "frame/button/button";
import { Input } from "frame/input/input";
import { Option, Select } from "frame/select";
import { Overlay } from 'frame/overlay/overlay';
import { toThousands } from 'frame/utils/tools';
import { I18nServiceFactory } from "common/services/i18n";
import { Storage } from "common/storage/local.storage";
import { globalConfigerviceFactory } from "services/global/config";
import { otcPairsServiceFactory } from "services/otc/pairs";
import { userServiceFactory } from "services/account/user";
import { IPayment } from "types/otc";
import { SafetyTips } from 'render/account/components/safety.verify';

export default () => {
  const complate = (value: any) => {
    console.log('res', value);
  };
  return (
    <div>
      👴
      <div>
        <SafetyTips tips='test' onNavigate={(value: any)=>{console.log(value)}} />
      </div>
    </div>
  )
}