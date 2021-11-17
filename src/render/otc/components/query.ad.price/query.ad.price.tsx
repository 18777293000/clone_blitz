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