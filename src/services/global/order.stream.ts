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
}