import { container, singleton } from "../../common/services/di"
import { SocketService, ISocketConfig } from '../../common/services/socket';

export class FastgatewaySocketConfig implements ISocketConfig {
  readonly _path = 'wss://s.fast-gateway.com:8080/shift';

  get() {
    return {
      path: this._path,
      WebSocket: window.WebSocket,
    }
  };
}

export class TradeSocketConfig implements ISocketConfig {
  readonly _path = 'wss://s.btckan.com:8080/shift';

  get() {
    return {
      path: this._path,
      WebSocket: window.WebSocket,
    }
  }
}

@singleton()
export class SocketManagerService {
  private _sockets: any = {};

  register(name: string, socket: SocketService){
    if(this._sockets[name]){
      console.warn('bitkan warn: socket ' + name + ' exist!');
      return;
    }

    this._sockets[name] = socket;
  }

  get(name: string){
    return this._sockets[name]
  }
}

export const initialFgsSocketConfigSocket = () => {
  container.register('SocketConfig', FastgatewaySocketConfig);
  return container.resolve(SocketService);
};

export const initialTradeSocket = () => {
  container.register('SocketConfig', TradeSocketConfig);
  return container.resolve(SocketService);
};

export const socketManagerManager = () => {
  return container.resolve(SocketManagerService);
}