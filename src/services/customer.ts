import {singleton, container, inject} from "../common/services/di";
import { BKEventService } from '../common/services/event';
import { GlobalConfigervice } from '../services/global/config';
import { startupHTTP } from '../frame/utils/http';
import { getCMID } from "../api/common";

export interface ICustomerService {
  startup: (onSuccess: (result: any) => void, onError: (error: any) => void) => void;
}

@singleton()
export class CustomerService implements ICustomerService {
  private hasInit: boolean = false;
  private _timer: any = null;

  //创建对象初始化全局服务对象和事件对象
  constructor(
    private globalConfigService: GlobalConfigervice,
    private bkevent: BKEventService,
  ){};

  private initIm(): void {
    if(this.hasInit){return};

    this.hasInit = true;

    const bkIMNode = document.createElement('div');
    bkIMNode.className = 'bktrade-im';
    bkIMNode.innerHTML = `
      <div class="bktrade-im-header">
        <div class="bktrade-im-header-name">我是客服窗口</div>
        <div class="bktrade-im-header-close"><i class="bktrade-icon-close1"></i></div>
      </div>
      <div class="bktrade-im-content"></div>
    `;
    document.body.appendChild(bkIMNode);

    const closeNode = document.querySelector('.bktrade-im-header-close');
    if(!closeNode){return};

    closeNode.addEventListener('click', this.close.bind(this));
  }

  private open():void {
    const bkIMNode = document.querySelector('.bktrade-im') as HTMLElement;

    bkIMNode.style.display = 'block';
    if(bkIMNode.className.indexOf('animate__fadeOutDown') > -1){
      bkIMNode.className = bkIMNode.className.replace('animate__fadeOutDown', 'animate__fadeInUp');
    }else {
      bkIMNode.className += ' animate__animated animate__fadeInUp';
    }
  }

  private close():void {
    const bkIMNode = document.querySelector(".bktrade-im") as HTMLElement;

    bkIMNode.className = bkIMNode.className.replace('animate__fadeInUp', 'animate__fadeOutDown');

    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      bkIMNode.style.display = 'none';
    }, 400);
  }

  public openIM(user: any):void {
    if(!user || !user.id){
      this.bkevent.dispatch({ type: "NOT.LOGGED.IN", message: 'bkchat' });
      return;
    }

    const { key, promise } = getCMID();
    startupHTTP(key, promise, { dedupingInterval: 1000 * 60 * 60 * 4 })
    .then((data: any) => {
      const cmid = data.cmid || null;
      if(!cmid){return};
      const bkIMNode = document.querySelector(".bktrade-im-content") as HTMLElement;

      //@ts-ignore
      const bkchat = window.bkchatFactory;
      if(bkIMNode && bkchat && bkchat.factory){
        bkchat.factory({
          key: cmid,
          elem: document.querySelector('.bktrade-im-content'),
          otheruserid: cmid,
          lang: this.globalConfigService.lang,
        });

        this.open();
      }
    })
  }

  public startup():void {
    this.initIm();
  }
}

export const customerServiceFactory = () => {
  return container.resolve(CustomerService);
}
