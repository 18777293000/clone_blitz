import { BehaviorSubject } from 'rxjs';
import { container, singleton } from 'common/services/di';
import { getOTCPairs } from 'api/otc';
import { LocalStorageService } from 'common/storage/local.storage';
import { StorageScope } from 'common/storage/storage';
import { depthCopy } from 'common/utils/tools';

@singleton()
export class OTCPairsService {
  private _defaultPairs = {
    pairs: {
			USDT: {
				coin_id: 10,
				black_icon: "https://img.szsing.com/version/2019-03-13/h6JROjTLMX_USDT1.png",
				token_id: 0,
				coin: "USDT",
			},
			BTC: {
				coin_id: 1,
				token_id: 0,
				black_icon: "https://img.szsing.com/version/2019-03-13/pqYCJoS6BN_btc1.png",
				coin: "BTC",
			},
			ETH: {
				coin_id: 2,
				token_id: 0,
				coin: "ETH",
				black_icon: "https://img.szsing.com/version/2019-03-13/fLgQCwWBrN_eth1.png",
			}
		}
  };

  private _pairs$ = new BehaviorSubject<any>(null);
  public pairs$ = this._pairs$.asObservable();

  constructor(
    private storageService: LocalStorageService
  ){
    const pairs = JSON.parse(this.storageService.get('otc.trade.pairs', StorageScope.GLOBAL, JSON.stringify(this._defaultPairs)));
    this._pairs$.next(depthCopy(pairs));

    this.getPairs();
  };

  private getPairs(){
    const lang = document.querySelector('html')?.getAttribute('lang') || 'zh';
    const { promise } = getOTCPairs(lang);
    return promise().then(data => {
      const pairs = this.formatPairs(data.list);

      const payments = this.formatPayments(data.payments);
      const coins = this.createCoins(pairs);

      this.storageService.store('otc.trade.pairs', JSON.stringify({pairs, payments, coins}), StorageScope.GLOBAL);

      this._pairs$.next({
        pairs: depthCopy(pairs),
        payments: depthCopy(payments),
        coins: depthCopy(coins),
      });
      return true;
    })
  };

  private formatPairs(data: any[]){
    let pairs: any = {};
    data.forEach((item: any) => {
      pairs[item.coin] = item;
    });
    return pairs;
  };

  private formatPayments(data: any[]){
    let payments: any = {};
    data.forEach((payment: any) => {
      const types = payment.types;
      const tempTypes: any = {};
      for(let j = 0; j < types.length; j++){
        tempTypes[types[j].type] = types[j];
      };
      payments[payment.currency] = tempTypes;
    });
    return payments;
  };

  private createCoins(pairs: any){
    return Object.values(pairs).map((pair: any) => {
      return {
        label: pair.coin,
        value: pair.coin ,
        coin: pair.coin_id,
        token: pair.token_id,
        currencies: pair.currencies
      }
    })
  };

  public updatePairs(){
    return this.getPairs();
  };

};

export const otcPairsServiceFactory = () => {
  return container.resolve(OTCPairsService);
};
