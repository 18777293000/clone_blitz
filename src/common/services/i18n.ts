import { BehaviorSubject } from "rxjs";
import { container, singleton } from '../../common/services/di';
import { i18n } from '../../i18n/index';

@singleton()
export class I18nService {
  private _I18n$ = new BehaviorSubject<any | null>(null);

  public getI18n(module: string, lang: 'zh'|'en'|''){
    const tempLocalePackage = i18n(lang) || {};
    return Object.assign({}, tempLocalePackage[module] || {})
  }

  get I18n$(){
    return this._I18n$.asObservable();
  }
}

export const I18nServiceFactory = (module = 'common') => {
  return container.resolve(I18nService);
}