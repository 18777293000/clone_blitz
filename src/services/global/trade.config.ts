import { BehaviorSubject } from "rxjs";
import { container, singleton } from "../../common/services/di";
import { startupHTTP } from "../../frame/utils/http";
import type { ITradeTicker } from '../../types/trade';
import { getPrice, getRates, getSymbols } from '../../api/trade';
import { Numeric } from "d3";

export type Theme = 'auto' | 'light' | 'dark';
export type lang = 'zh' | 'en';
export type Currency = 'CNY' | 'USD';

export interface IPrice {
  id: number;
  open: number;
  high: number;
  low: number;
  last: number;
  vol: number;
}

interface IMarket {
  currency: string;
  symbols: ITradeTicker[];
}

@singleton()
export class TradeConfigService {
  private _price: any = {};
  private _loading$: any = new BehaviorSubject<any>(true);
  private _customs$: any = new BehaviorSubject<ITradeTicker[] | null>(null);
  private _markets$: any = new BehaviorSubject<IMarket[] | null>(null);
  private _rates$: any = new BehaviorSubject<any>(null);
  private _onChange$ = new BehaviorSubject<IPrice | null>(null);

  private createIncreasesDecreases(symbols: any[], increases: any[], decreases: any[]){
    const tincreases = increases.sort((a: any, b: any) => b.rang - a.rang).splice(0, 20);
    const tdecreases = decreases.sort((a: any, b: any) => a.rang - b.rang).splice(0, 20);
    const tempSymbols = JSON.parse(JSON.stringify(symbols));
  }
}