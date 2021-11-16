import { OrdersType } from "./common";

export type IPayment = 'alipay' | 'wechatpay' | 'unionpay' | 'western' | 'chipper' | 'cashapp';

export interface IFilterParams {
  activeType: OrdersType;
  activeDate: string;
  show_cancel: string | number;
  type: string | number;
  symbol: string;
  currency: string;
  isBackUp: boolean;
}