import { of } from "rxjs";
import { filter, map, tap, switchMap, distinctUntilChanged, share } from "rxjs/operators";
import { socketManagerManager } from "./socket";
import { container, singleton } from '../../common/services/di';
import { StorageScope } from "../../common/storage/storage";
import { LocalStorageService } from "../../common/storage/local.storage";
// import { NotifyService } from '../../common/services/notification'; //这个东西就是那个浏览器边缘会弹窗的一个信息窗口，后面再写
import { userServiceFactory } from "../../services/account/user";
import { globalConfigerviceFactory } from "../../services/global/config";
import { formatNumber } from "../../frame/utils/format";

const noticeMsg = {
  2: '等待付款',
	3: '待放行',
	6: '订单取消',
	8: '订单成交',
	9: '订单仲裁',
};

@singleton()
export class OrderStreamService {
  private auth$: any = null;
  private orders$$: any = null;
  private otcOrders$$: any = null;
  private tradeSocket = socketManagerManager().get('fsg.socket');
  private userService = userServiceFactory();
  private globalConfigService = globalConfigerviceFactory();

  constructor(
    private storageService: LocalStorageService
  ){
    this.observe(() => {});
    this.fiatObserve(() => {});
  };

  destory(){
    this.unObserve();
    this.fiatUnObserve();
  }

  public observe(onUpdate: Function):void{
    this.orders$$.subscribe((order: any) => {
      order && onUpdate(order);
    })
  }

  public fiatObserve(onUpdate: Function):void {
    this.otcOrders$$.subscribe((order: any) => {
      order && onUpdate(order);
    })
  }

  public unObserve():void {
    this.orders$$ && this.orders$$.unsubscribe && this.orders$$.unsubscribe();
  }

  public fiatUnObserve():void {
    this.otcOrders$$ && this.otcOrders$$.unsubscribe && this.otcOrders$$.unsubscribe();
  }

  private deal(order: any):void {
    const avprice = (order.std_done_amount * 1 !== 0 && order.done_amount * 1 !== 0) ? formatNumber(order.std_done__amount / order.done_amount, '1.2-10') : 0;
    // this.notifyService ...
    console.log('notifyService deal');
  }

  private cancel(order: any):void {
    const avprice = (order.std_done_amount * 1 !== 0 && order.done_amount * 1 !== 0) ? formatNumber(order.std_done_amount / order.done_amount, '1.2-10') : 0;
    console.log('notifyService deal');
  }

  private otcNotice(order: any):void {
    const noticeKey: any = Object.keys(noticeMsg);
    const id = this.userService.user && this.userService.user.id ? +this.userService.user.id : 0;
    if(noticeKey.indexOf(order.status + '') > -1 && id !== order.opUserId * 1){
      const lang = this.globalConfigService.lang || 'zh';
      console.log('noticeService');
    }
  }
}

export const orderStreamServiceFactory = () => {
  return container.resolve(OrderStreamService);
}