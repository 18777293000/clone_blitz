import fetch from 'unfetch';
import { middleware } from 'yargs';
import { singleton, container } from '../../common/services/di';

export interface HttpOptions {
  body?: any,
  headers? :any,
  isFormdata?: boolean
}

interface CacheConfig {
  dedupingInterval: number
}

type RequestInterceptor = (r: HttpOptions) => HttpOptions;
type ResponseInterceptor = (r: any, url: string) => any;

interface Interceptors {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
}

type InterceptorsType = 'request' | 'response';

interface CanCancelHTTP {
  promise: Promise<any>;
  cancel: () => void;
}

interface IBKRequest {
  readonly _interceptors: Interceptors;

  get(url: string, options?: HttpOptions): Promise<any>;

  post(url: string, options?: HttpOptions): Promise<any>;

  startup(key: string, promise: () => Promise<any>, cacheConfig?: CacheConfig): Promise<any>;

  shutup(key: string, promise: Promise<any>): CanCancelHTTP;

  use(middleware: (r: any) => Promise<any>, type: InterceptorsType): void;

  log():void;

  clear():void;
}

type HTTPStatus = 'pending' | 'complete' | 'error';

interface HTTPXHR {
  status: HTTPStatus,
  promise: Promise<any>;
  expries: number;
}

class HTTPStatusManager {
  private _cache  = new Map<string, HTTPXHR>();

  set(uuid: string, cache: HTTPXHR){
    this._cache.set(uuid, cache);
  }

  get(uuid: string): HTTPXHR | undefined {
    return this._cache.get(uuid);
  }

  delete(uuid: string): void{
    this._cache.delete(uuid);
  }

  clear(): void{
    this._cache.clear();
  }

  log(): void{
    const items = new Map<string, HTTPXHR>();
    const itemsParsed = new Map<string, HTTPXHR>();

    this._cache.forEach((value, key) => {
      items.set(key, value);
      itemsParsed.set(key, value);
    });

    console.group(`httpstatusmanager storage`);
    let globalValues: {key: string, value: HTTPXHR}[] = [];
    items.forEach((value, key) => {
      globalValues.push({key, value});
    });
    console.table(globalValues);
    console.groupEnd();

    console.log(itemsParsed);
  }
}

@singleton()
class BKRequest implements IBKRequest {
  readonly _interceptors: Interceptors = {
    request: [],
    response: [],
  };

  constructor(
    private httpStatusManager: HTTPStatusManager,
  ){};

  private requestInterceptor(config: HttpOptions){
    const requestInterceptors = this._interceptors.request;

    requestInterceptors.forEach(interceptor => {
      config = interceptor(config);
    });

    return config;
  }

  private responseInterceptor(r: any, url: string) {
    const responseInterceptors = this._interceptors.response;
    responseInterceptors.forEach(interceptor => {
      r = interceptor(r, url);
    });

    return r;
  }

  private ajax(type: 'GET' | 'POST', url: string, options: HttpOptions = {}): Promise<any> {
    const { headers = {}, body = {} } = options;
    const config = this.requestInterceptor({
      headers: Object.assign({}, headers),
      body
    });
    body instanceof FormData && delete config.headers['Content-Type'];

    return fetch(url, {
      method: type,
      headers: config.headers,
      body: typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(config.body) : config.body
    })
    .then(r => r.json())
    .then(r => this.responseInterceptor(r, url));
  }

  get (url: string, options: HttpOptions = {}): Promise<any> {
    
    return this.ajax("GET", url, options);
  }

  post (url: string, options: HttpOptions = {}): Promise<any> {

    return this.ajax("POST", url ,options);
  }

  shutup(key: string, promise: Promise<any>){
    let cancel = () => {};

    const abort = new Promise(function(_, _abort){
      cancel = () => {
        _abort(`request ${key} had abortd`);
      }
    });

    return {
      cancel,
      promise: Promise.race([promise, abort])
    };
  }

  startup(key: string, promise: () => Promise<any>, cacheConfig?: CacheConfig): Promise<any> {
    const httpXHR = this.httpStatusManager.get(key);
    const nowTime = new Date().getTime();
    const { dedupingInterval = 2000 } = cacheConfig || { dedupingInterval: 2000 };
    if(httpXHR && (httpXHR.status === 'complete' && httpXHR.expries < nowTime)){
      this.httpStatusManager.delete(key);
    }

    if(
      httpXHR && 
      (
        httpXHR.status === 'pending' || (httpXHR.status === 'complete' && httpXHR.expries >= nowTime)
      )
    ){
      return httpXHR.promise;
    }
    //当请求在有效期内重新获取过之后，更新expriestime,讲改请求得保存时间延长
    const promiseFn = promise();
    this.httpStatusManager.set(key, {
      status: 'pending',
      promise: promiseFn,
      expries: nowTime + dedupingInterval
    });

    return promiseFn.then(r => {
      this.httpStatusManager.set(key, {
        status: 'complete',
        promise: Promise.resolve(r),
        expries: nowTime + dedupingInterval,
      });
      return r;
    }).catch(error => {
      this.httpStatusManager.set(key, {
        status: 'error',
        promise: Promise.resolve(error),
        expries: nowTime,
      })

      return Promise.reject(error);
    });
  }

  update(key: string, data?: any, shouldRevalidate = true){
  }

  deleteCache(key: string){
    this.httpStatusManager.delete(key);
  }

  use(middleware: (r: any) => any, type: InterceptorsType) {
    const funName = middleware.name;
    if(!funName){
      console.error('拦截器请不要使用匿名函数(函数名可以用来避免重复添加)!!');
      return;
    }
    const isHad = this._interceptors[type].findIndex((f: Function) => f.name === funName) > -1;
    !isHad && this._interceptors[type].push(middleware);
  }

  log(){
    this.httpStatusManager.log();
  }

  clear(){
    this.httpStatusManager.clear();
  }
}

const bkRequest = container.resolve(BKRequest);

export const get = (url: string, options: HttpOptions = {}) => bkRequest.get(url, options);

export const post = (url: string, options: HttpOptions = {}) => bkRequest.post(url ,options);

export const startupHTTP = (key: string, promise: () => Promise<any>, options?: CacheConfig) => bkRequest.startup(key, promise, options);

export const shutupHTTP = (key: string, promise: Promise<any>) => bkRequest.shutup(key, promise);

export const updateHTTP = (key: string, data: any, shouldRevalidate?: boolean) => bkRequest.update(key, data, shouldRevalidate);

export const deleteHTTPCache = (key: string) => bkRequest.deleteCache(key);

export const addMiddlewareForHTTP = (middleware: (r: any) => any, type: InterceptorsType) => bkRequest.use(middleware, type);

export const logHTTPCache = () => bkRequest.log();

export const cleatHTTPCache = () => bkRequest.clear();