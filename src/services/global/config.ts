import { BehaviorSubject } from "rxjs";
import { container, singleton } from "../../common/services/di";
import { LocalStorageService } from "../../common/storage/local.storage";
import { StorageScope } from "../../common/storage/storage";

export type Lang = 'zh' | 'en' | '';
export type Currenecy = 'CNY' | 'USD';

@singleton()
export class GlobalConfigervice {
  private _lang: Lang = 'zh';
  private _currency: Currenecy = 'USD';
  private _lang$ = new BehaviorSubject(this._lang);
  private _currency$ = new BehaviorSubject(this._currency);

  constructor(
    private storageService: LocalStorageService
  ){
    const defaultLang = window.navigator.language.indexOf('zh') === 0 ? 'zh' : 'en';
    const initLang = this.storageService.get('global.config.lang', StorageScope.GLOBAL, defaultLang) as Lang;

    const defaultCurrency = initLang === 'en' ? 'USD' : this._currency;
    const initCurrency = this.storageService.get('global.config.currency', StorageScope.GLOBAL, defaultCurrency) as Currenecy

    this._lang = initLang;
    this._currency = initCurrency;
  }

  get lang$() {
    return this._lang$.asObservable();
  }

  get currency$ (){
    return this._currency$.asObservable();
  }

  get lang() {
    return this._lang;
  }

  get currency(){
    return this._currency;
  }

  set lang(val: Lang) {
    if(this._lang !== val){
      this._lang = val;
      this.storageService.store('global.confg.lang', val, StorageScope.GLOBAL);
      this._lang$.next(val);
      document.documentElement.setAttribute('lang', val);
      this._currency = val === 'zh' ? 'CNY' : 'USD';
    }
  }

  set currency(val: 'CNY' | 'USD'){
    if(this._currency !== val){
      this._currency = val;
      this.storageService.store('global.config.currency', val, StorageScope.GLOBAL);
      this._currency$.next(val);
    }
  }
}

export const globalConfigerviceFactory = () => {
  return container.resolve(GlobalConfigervice);
}