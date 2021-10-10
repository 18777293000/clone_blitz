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

  addEventListener(type: string, listener: (event: BKEventType) => void) {
    const listeners = this._listeners;

    if(listeners[type] === undefined){
      listeners[type] = [];
    }

    if(listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener);
    }
  }

  has(type: string, listener: (event: BKEventType) => void) {
    if(this._listeners === undefined) return false;

    const listeners = this._listeners;

    return listeners[type] !== undefined && listeners[type].indexOf( listener ) !== -1;
  }

  remove(type: string, listener: (event: BKEventType) => void) {
    if(this._listeners === undefined) return;

    const listeners = this._listeners;
    const listenerArray = listeners[type];

    if(listenerArray !== undefined) {
      const index = listenerArray.indexOf( listener );

      if(index !== -1) {
        listenerArray.splice( index, 1 );
      }
    }
  }

  dispatch(event: BKEventType){
    if(this._listeners === undefined) return;

    const listeners = this._listeners;
    const listenerArray = listeners[ event.type ];

    if(listenerArray !== undefined){
      event.target = this;
      const array = listenerArray.slice( 0 );
      for(let i = 0, l = array.length; i < l; i++) {
        array[ i ].call( this, event );
      }
    }
  }
}

@singleton()
export class BKEventService implements IBKEvent {
  public name = '';
  private event: any;
  constructor(){
    const event = new BKEvent();
    this.name = event.name;
    this.event = event;
  }
  once(type: string, listener: (event: any) => void){
    this.event.once(type, listener);
  }
  addEventListener(type: string, listener: (event: any) => void){
    this.event.addEventListener(type, listener);
  }
  has(type: string, listener: (event: any) => void){
    return this.event.has(type, listener);
  }
  remove(type: string, listener: (event: any) => void){
    this.event.remove(type, listener);
  }
  dispatch(event: BKEventType){
    this.event.dispatch(event);
  }
}

export const bkEventServiceFactory = () => {
  return container.resolve(BKEventService);
}