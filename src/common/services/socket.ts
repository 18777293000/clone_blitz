import { injectable, inject } from './di';
import { BehaviorSubject, Subject, Observer, Observable, of, timer } from 'rxjs';
import { tap, filter, switchMap, skipWhile } from 'rxjs/operators';
import { inflate } from 'pako/dist/pako_inflate';

interface SocketConfig {
  path: string,
  WebSocket: any,
}

export interface ISocketConfig {
  readonly _path: string,

  get(): SocketConfig,
}

export interface ISocketService {
  startup: () => void;

  shutup: () => void;

  observe: (msg: string) => Observable<any>;
}

@injectable()
export class SocketService implements ISocketService{
  private isError:boolean = false;
  private socket: any;
  private observer = new Subject();
  private uuid:number = 0;
  private undo: any = {};
  private pongSub:any = null;
  private _watcher: any = {};
  private _errorLimit:number = 500;
  private _count:number = 0;
  private _status$ = new BehaviorSubject<string>('close');

  public events: any = {};

  constructor(
    @inject('SocketConfig') private socketConfig: ISocketConfig
  ){}

  private connect():void{
    const socketConfig = this.socketConfig.get();
    const socket = new socketConfig.WebSocket(socketConfig.path);
    this.socket = socket;

    socket.onopen = (e: Event) => {
      this.watcher();
      this._status$.next('open');
      
      //@ts-ignore
      this.pongSub = this!.pong$()!.subscribe();
      if(this.isError){
        this.todo(this.undo);
      }
    };

    socket.onerror = (e: Event) => {
      console.warn('error', e);
      this._status$.next('close');
      if(this.pongSub){
        //@ts-ignore
        this.pongSub.unsubscribe();
      }
      this.pongSub = null;
      this.protectReload();
    };

    socket.onclose = (e: CloseEvent) => {
      this._status$.next('close');
      if(this.pongSub){
        //@ts-ignore
        this.pongSub.unsubscribe();
      }
      this.pongSub = null;
      console.log('onclose', e.code);
      e.code === 1005 && this.reload();
      e.code === 1006 && this.protectReload();
    }

    socket.onmessage = (e: MessageEvent) => {
      this.observer.next(e.data);
    }
  }

  private watcher():void{
    clearTimeout(this._watcher);
    this._watcher = setTimeout(() => {
      this.close();
    }, 1000 * 60 * 30);
  }

  private close():void{
    this.socket && this.socket.close();
  }

  private todo(undo: any):void{
    for(const key in undo){
      if(key){
        undo[key].subscribe();
      }
    }
  }

  private multiplex(subMsg: () => any, unsubMsg: () => any, isCloseStream = true) {
    this.uuid = this.uuid + 1;
    const uuid = this.uuid + '';

    this.undo[uuid] = new Observable((observer: Observer<any>) => {
      if (this.socket && this.socket.readyState === 1) {
        this.socket.send(JSON.stringify(subMsg()));
      } else {
        this.isError = true;
      }
      const subscription = this.observer.subscribe((res: any) => {
        observer.next(res);
      });

      return () => {
        if (isCloseStream && this.socket && this.socket.readyState === 1) {
          this.socket.send(JSON.stringify(unsubMsg()));
        }
        subscription.unsubscribe();
        delete this.undo[uuid];
      };
    });
    
    return this.undo[uuid];
  }

  private reload():void{
    this._count = this._count + 1;

    if(this._count >= this._errorLimit){return};

    this.isError = true;
    this.socket = null;
    this.connect();
  }
  /**
   * ??????????????????(?????????????????????????????????)?????????socket: socket???????????????????????????????????????????????????????????????
   * 
   * ??????1~10S ?????????????????????, 
   * ?????????????????????????????????(??????????????????????????????????????????????????????????????????????????????), ???????????????????????????
   * 
   * ??????????????????100???????????????,?????????????????????
   * @private
   * @memberOf SocketService
   */
  private protectReload():void{
    let randomTime = Math.random() * 10 + 1;

    if(this._count >= this._errorLimit){
      randomTime = Math.random() * 10 + 11;
    }

    this._count = this._count + 1;

    setTimeout(() => {
      this.reload();
    }, randomTime * 1000);
  }

  private pong$(): Observable<any>{
    return timer(0, 15000).pipe(
      skipWhile(() => !this.socket),
      tap(() => {
        this.socket && this.socket.readyState === 1 && this.socket.send('{"ping": 18212558000}');
      }),
    );
  }

  // ????????????, ?????????????????????????????????
  private inflate(blob: Blob): Observable<any>{
    return Observable.create((observer: any) => {
      const reader = new FileReader();
      //?????????????????????????????????blob????????????????????????????????????
      reader.onloadend = () => {
        //@ts-ignore
        const result = inflate(reader.result, {to: 'string'});
        observer._next(JSON.parse(result));
      };
      reader.readAsArrayBuffer(blob);
    })
  }

  startup(){
    this.connect();
  }

  shutup(){
    clearTimeout(this._watcher);
    this.socket.close();
  }

  /**
   * ??????socket??????
   * @param {*} msg: ????????????
   * @param {boolean} [isCloseStream=true] ??????????????????socket?????????,?????????????????????????????????
   * @returns 
   * 
   * @memberOf SocketService
   */
   observe(msg: any, isCloseStream = true) {
    let observer = this.multiplex(
      () => ( msg ),
      () => {
        msg.type = 'cancle';
        delete msg.deflate;
        return msg;
      },
      isCloseStream
    ).pipe(
      switchMap((response: any) => {
        try {
          const result$ = typeof response === 'string' ? of(JSON.parse(response)) : this.inflate(response);
          return result$;
        } catch (error) {
          return of(null);
        }
      }),
      filter(res => !!res),
      filter((res: any) => {
        const tempMsg = JSON.parse(JSON.stringify(msg));
        const tempRes = JSON.parse(JSON.stringify(res));

        const msgType = tempMsg.subname || tempMsg.sub || tempMsg.type;
        const resType = tempRes.sub || tempRes.type;

        return resType && msgType && (resType === msgType);
      })
    );
    return observer;
  }

  get status$() {
    return this._status$.asObservable();
  }

}