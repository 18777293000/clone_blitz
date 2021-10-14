export type Shifttype = 1 | 2 | 3 | 4 | 5; // 1: 限价委托; 2: 市价委托; 3: 冰山; 4: 止盈止损; 5: 时间加权

export interface ITradeTicker {
  id: number;
  market_id: number;
  max_vol_limit: number;
  min_vol_limit: number;
  min_amt_limit: number;
  Shift_type: Shifttype;
  icon: string;
  coin: string;
  token: string;
  std_coin: string;
  std_token: string;
  symbol: string;
  currency: string;
  trade_enable: '1' | '0';
  update_time: number;
  decimal: number;
  amount_decimal: number;
}

export interface ITradePrice {
  last: number;
  open: number;
  high: number;
  low: number;
  vol: number;
}

export interface IHistoryItem {
  time: number;
  price: number;
  volume: number;
  type: '1' | '2';
  site?: string;
}