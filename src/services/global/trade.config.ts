import { BehaviorSubject } from "rxjs";
import { container, singleton } from "../../common/services/di";
import { startupHTTP, logHTTPCache } from "../../frame/utils/http";
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
    const increasesSymbols = [];
    const decreasesSymbols = [];
    for(let i = 0; i < tincreases.length; i++){
      const item = tincreases[i];
      const findItem = tempSymbols.find((symbol: any) => +symbol.id === +item.id);

      if(findItem){
        increasesSymbols.push(findItem);
      }
    }

    for(let i = 0; i < tdecreases.length; i++){
      const item = tdecreases[i];
      const findItem = tempSymbols.find((symbol: any) => +symbol.id === +item.id);

      if(findItem){
        decreasesSymbols.push(findItem);
      }
    }

    const increasesMarket = { currency: 'Top Gainers', symbols: increasesSymbols };
    const decreasesMarket = { currency: 'Top Losers', symbols: decreasesSymbols };

    return {
      increases: increasesMarket,
      decreases: decreasesMarket,
    }
  }

  public init(userid: string){
    this._loading$.next(true);

    const { key, promise } = getPrice();
    const { key: symbolsKey, promise: symbolsPromise } = getSymbols(userid);
    const { key: ratesKey, promise: ratesPromise } = getRates();

    Promise.all([
      startupHTTP(key, promise, { dedupingInterval: 1000 * 60 * 10 }),
      startupHTTP(symbolsKey, symbolsPromise, { dedupingInterval: 1000 * 60 * 10 }),
      startupHTTP(ratesKey, ratesPromise, { dedupingInterval: 1000 * 60 * 10 }),
    ]).then(([ tickers, symbols, rates ]: any) => {
      if(!tickers || !symbols || !rates){ return };
      const tickerResult: any = {};
      const increases: any[] = [];
      const decreases: any[] = [];

      tickers.forEach((ticker: any) => {
        const range = ((+ticker.last) - (+ticker.open)) / +ticker.open;

        if(range > 0){
          increases.push({ id: ticker.id, range });
        }else if(range < 0){
          decreases.push({ id: ticker.id, range });
        }

        tickerResult[ticker.id + ''] = {
          id: ticker.id,
          open: +ticker.open,
          high: +ticker.high,
          low: +ticker.low,
          last: +ticker.last,
          vol: +ticker.vol,
        };
      });

      this._price = tickerResult;

      const markets = (symbols ? symbols.markets || [] : []).filter((market: any) => market.currency === 'USDT');

      const IncreasesDecreases = this.createIncreasesDecreases(markets[0].symbols, increases, decreases);
      markets.push(IncreasesDecreases.increases);
      markets.push(IncreasesDecreases.decreases);

      this._markets$.next(markets);

      const result: any = {};

      (rates.rates || []).forEach((rate: any) => {
        result[rate.currency + ''] = {
          usd: rate.usd,
          cny: rate.cny,
        };
      });
      this._rates$.next(result);

      this._loading$.next(false);
    });
  }

  public queryTickerPrice(id: number | string): IPrice | null {
    if(!this._price[id]){
      return null;
    }
    
    return JSON.parse(JSON.stringify(this._price[id]));
  }

  public changeTicker(id: number | string, ticker: IPrice):void {
    const temp = JSON.parse(JSON.stringify(ticker));
    this._price[id + ''] = temp;

    this._onChange$.next(temp);
  }

  public toggleCustom(ticker: ITradeTicker):void {
    const customs: any[] = JSON.parse(JSON.stringify(this._customs$.value || []));
    const findIndex = customs.findIndex((item: any) => +item.id === +ticker.id);

    if(findIndex >= 0){
      customs.splice(findIndex, 1);
    }else{
      customs.unshift(JSON.parse(JSON.stringify(ticker)));
    }

    this._customs$.next(customs);
  }

  get markets$(){
    return this._markets$.asObservable();
  }

  get customs$(){
    return this._customs$.asObservable();
  }

  get rates$(){
    return this._rates$.asObservable();
  }

  get loading$(){
    return this._loading$.asObservable();
  }

  get onChange$(){
    return this._onChange$.asObservable();
  }
}

export const tradeConfigServiceFactory = () => {
  return container.resolve(TradeConfigService);
}