import { injectable } from '../../common/services/di';
import { IStorageService, StorageScope, logStorage } from '../../common/storage/storage';
import { isUndefinedOrNull } from '../../common/types';

interface IBrowserStorage {
  get(key: string): string | null;

  set(key: string, value: string): void;

  delete(key: string): void;
  
  asMap(): Map<string, string>;
}

interface IStorageObj {
  expirytime: number;
  starttime: number;
  value: any;
}

export class Storage implements IBrowserStorage {
  private type: "localStorage" | "sessionStorage";

  constructor(type: "local" | "session" = "local"){
    this.type = (type + "Storage") as ("localStorage" | "sessionStorage");
  }

  set(key: string, val: any, expirytime: number = 0){
    const storage = window[this.type];
    if(typeof window === 'undefined' || typeof storage === 'undefined'){ return };
    try{
      const temp: any = {};
      temp.starttime = new Date().getTime();
      temp.expirytime = expirytime;
      temp.value = val;
      val = JSON.stringify(temp);
      storage.setItem(key, val);
    }catch(error){

    }
  }

  get(key: string){
    const storage = window[this.type];
    if(typeof window === 'undefined' || typeof storage === 'undefined'){ return };
    const val = storage.getItem(key);

    if(!val){ return null };

    try{
      const tempVal = JSON.parse(val) as IStorageObj;
      if(typeof tempVal.expirytime === 'undefined'){return val};
      if(tempVal.expirytime !== 0){
        if(new Date().getTime() - tempVal.starttime > tempVal.expirytime){
          this.delete(key);
          return null;
        }else{
          return tempVal.value;
        }
      }else{
        return tempVal.value;
      }
    }catch(error){
      if(val){
        return val;
      }else{
        return null;
      }
    }
  }

  delete(key: string){
    if(typeof window === 'undefined' || typeof window[this.type] === 'undefined'){ return };
    window[this.type].removeItem(key);
  }

  asMap(){
    const mapResult = new Map<string, string>();
    const storage = window[this.type];
    const keys: string[] = Object.keys(storage);
    keys.forEach(key => {
      mapResult.set(key, storage.getItem(key) as string)
    });
    return mapResult;
  }
}

@injectable()
export class LocalStorageService implements IStorageService {
  readonly _serviceBrand: undefined;

  private readonly globalCache = new Storage();
  private readonly workspaceCache = new Storage("session");

  private getCache(scope: StorageScope){
    return scope === StorageScope.GLOBAL ? this.globalCache : this.workspaceCache;
  }

  get(key: string, scope: StorageScope, fallbackValue: string): string;
  get(key: string, scope: StorageScope, fallbackValue: string): string | undefined {
    const value = this.getCache(scope).get(key);

    if(isUndefinedOrNull(value)){
      return fallbackValue;
    }

    return value;
  }
}