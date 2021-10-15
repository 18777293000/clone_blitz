import React from "react";
import './style.scss';
import useSWR from "swr";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useObservable } from "rxjs-hooks";
import { Storage } from "../../../../common/storage/local.storage";
import { userServiceFactory } from "../../../../services/account/user";
import { commandManagerServiceFactory } from "../../../../common/services/command";

export const BKTradeHeader = () => {

  return (
    <div>
      123
    </div>
  )
};