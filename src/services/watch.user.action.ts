import { BehaviorSubject } from "rxjs";
import { singleton, container } from "../common/services/di";
import { LocalStorageService } from "../common/storage/local.storage";
import { StorageScope } from "../common/storage/storage";

@singleton()
export class WatchUserActionService {
  private _timer: any = {};
  private _domtimer: any = {};
  private _isNeedUnlock = true;
  private _isNeedUnlock$ = new BehaviorSubject<boolean>(true);
  private _isDomVisible$ = new BehaviorSubject<boolean>(true);
  private _isHiddenDom$ = new BehaviorSubject<boolean>(false);

  constructor(
    private storageService: LocalStorageService
  ){
    this._isNeedUnlock = this.storageService.get('global.needLock', StorageScope.WORKSPACE, 'true') === 'true';
    this._isNeedUnlock$.next(this._isNeedUnlock);
    document.addEventListener('mousemove', this.watchUserAction.bind(this));
    document.addEventListener('visibilitychange', this.watchDomVisibilityState.bind(this));
  }

  private watchUserAction(){
    clearTimeout(this._timer);
    this._isNeedUnlock$.next(this._isNeedUnlock);
    this._timer = setTimeout(() => {
      this._isNeedUnlock = true;
      this._isNeedUnlock$.next(true);
      this.storageService.store('global.needLock', 'true', StorageScope.WORKSPACE);
    }, 1000 * 60 * 29);
  }

  private watchDomVisibilityState(){
    clearTimeout(this._domtimer);
    const visible: boolean = document.visibilityState === 'visible';
    this._isDomVisible$.next(visible);

    if(!visible){
      //页面切入后台超过10分钟，发出标记可以将页面隐藏
      this._domtimer = setTimeout(() => {
        this._isHiddenDom$.next(true);
      }, 1000 * 60 * 10);
    }else{
      this._isHiddenDom$.next(false);
    }
  }

  set isNeedUnlock(val: boolean){
    if(val !== this._isNeedUnlock){
      this._isNeedUnlock = val;
      this._isNeedUnlock$.next(val);
      this.storageService.store('global.needLock', val, StorageScope.WORKSPACE);
    }
  }

  get isNeedUnlock$(){
    return this._isNeedUnlock$.asObservable();
  }

  get isDomVisible$(){
    return this._isDomVisible$.asObservable();
  }

  get isHiddenDom$(){
    return this._isHiddenDom$.asObservable();
  }
}

export const WatchUserActionServiceFactory = () => {
  return container.resolve(WatchUserActionService);
}