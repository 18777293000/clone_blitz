import { BehaviorSubject } from 'rxjs';
import { singleton, container } from '../../common/services/di';
import { LocalStorageService } from '../../common/storage/local.storage';
import { addMiddlewareForHTTP, HttpOptions } from '../../frame/utils/http';
import { StorageScope } from '../../common/storage/storage';
import { BKEventService, bkEventServiceFactory } from '../../common/services/event';
import { getProfile, logout, setPubkey } from '../../api/account';
import { throttle } from '../../common/decorator';
import { UserToken, UserInfo, User, IUserAPIService } from '../../types/account';

const setUserToken = (req: HttpOptions) => {
  const headers = Object.assign({}, req.headers, {'bk-use-token': '1'});
  return Object.assign(req, { headers });
}

const delUserToken = (req: HttpOptions) => {
  const headers = Object.assign({}, req.headers, {'bk-use-token': '0'});
  return Object.assign(req, {headers});
}

@singleton()
export class UserAPIService implements IUserAPIService{
  private _user$ = new BehaviorSubject<User>(null);
  private _user: User = null;
  private _auth$ = new BehaviorSubject<any>(undefined);

  constructor(
    private storageService: LocalStorageService,
    private bkEventServie: BKEventService,
  ){
    this.getProfile();
  }

  private getProfile(){
    const { promise } = getProfile();
    promise().then((user: UserInfo) => {
      this.update(this.formatUser(user));
      addMiddlewareForHTTP(setUserToken, 'request');

      //@ts-ignore
      window.bkchatFactory && window.bkchatFactory.init && window.bkchatFactory.init('wss://s.fast-gateway.com:8080/chat', 'https://up-as0.qinup.com');// 登录后需要初始化聊天IM

      //@ts-ignore
      return setPubkey(this._user?.id + '');
    }).catch(error => {
      if(error.code === 2){
        this.logout();
        this.storageService.remove('bk-user-token', StorageScope.GLOBAL);
        this.storageService.remove('bk-socket-token', StorageScope.GLOBAL);
        addMiddlewareForHTTP(delUserToken, 'request');
      }
    })
  }

  private getLocalToken():any{
    let local = null;
    try{
      const storage = this.storageService;
      const cacheVal = JSON.parse(storage.get('bk-user-token', StorageScope.GLOBAL, ''));
      const endTime = cacheVal.expriytime;
      local = !endTime || endTime >= new Date().getTime() ? cacheVal : storage.remove('bk-user-token', StorageScope.GLOBAL);
    }catch(error){}
    return local;
  }

  public update(user: UserInfo):void{
    let token = this.getLocalToken();
    const newUser = Object.assign({}, this._user, user, token);
    newUser.safetyValid = newUser.second_sms_verify ? (newUser.second_google_verify || newUser.second_email_verify) : (newUser.second_google_verify && newUser.second_email_verify);
    this._user = newUser;
    this._user$.next(Object.assign({}, this._user));
    this._auth$.next(true);
  }

  public formatUser(user: UserInfo):UserInfo{
    user.google_bind_status = (user.google_bind_status || 0) * 1;
    user.login_google_verify = (user.login_google_verify || 0) * 1;
    user.login_phone_verify = (user.login_phone_verify || 0) * 1;
    user.google_bind_status = (user.google_bind_status || 0) * 1;
    user.google_verify_status = (user.google_verify_status || 0) * 1;
    user.transfer_sms_status = (user.transfer_sms_status || 0) * 1;
    return user;
  }

  public setToken(token: UserToken, exprie_at: string){
    const endTime = new Date(exprie_at).getTime();

    this.storageService.store('bk-socket-token', JSON.stringify({expirytime: endTime, value: token}), StorageScope.GLOBAL);
  }

  public updateProfile(){
    this.getProfile();
  }

  public setSocketToken(token: any, expire_at: string){
    const endTime = new Date(expire_at).getTime();

    this.storageService.store('bk-socket-token', JSON.stringify({expirytime: endTime, vlaue: token}), StorageScope.GLOBAL)
  }

  @throttle()
  public logout(){
    logout().then(() => {
      this._user$.next(0);
      this._user = null;
      this._auth$.next(false);
      this.storageService.remove('bk-user-token', StorageScope.GLOBAL);
      this.storageService.remove('bk-socket-token', StorageScope.GLOBAL);
      this.bkEventServie.dispatch( { type: 'ACCOUNT.LOGINOUT', message: '' } );

      //@ts-ignore
      window.bkchatFactory && window.bkchatFactory && window.bkchatFactory.destory(); // 退出登录后需要清楚所有的聊天链接、缓存、事件
    }).catch();
  }

  get user(){
    return this._user;
  }

  get user$(){
    return this._user$.asObservable();
  }

  get auth$(){
    return this._auth$;
  }
}

export const userServiceFactory = () => {
  return container.resolve(UserAPIService);
}