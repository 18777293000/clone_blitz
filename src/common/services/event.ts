import { container, singleton } from './di';

interface BKEventType {
  type: string;
  message: any;
  target?: any;
}

interface IBKEvent {
  readonly name: string;
  once(type: string, listener: (event: BKEventType) => void): void;
  addEventListener(type: string, listener: (event: BKEventType) => void): void;
  has(type: string, listener: (event: BKEventType) => void): boolean;
  remove(type: string, listener: (event: BKEventType) => void): void;
  dispatch(event: BKEventType): void;
}

export interface Event<T> {
  (listener: (e: T) => any, args?: any): void;
}

export class BKEvent implements IBKEvent {
  private readonly _listeners: any = {};
  public name = 'BKEvent';

  once(type: string, listener: (event: BKEventType) => void){
    const listeners = this._listeners;

    if(listeners[type] === undefined){
      listeners[type] = [];
    }

    if(listeners[type].indexOf(listener) === -1){
      listeners[type].push(listener);
    }
  }
}