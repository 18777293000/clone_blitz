/**
 * 人机验证服务, 当前验证服务由极验提供
 * 后续如果需要切换到其他验证服务的时候只需要实现一个服务接口IRobotService的服务替换GeetestRobotService即可
 * tip: 可以避免后续切换人机服务的时候需要修改上一级依赖(SomeService -> GeetestRobotService)与当前服务的服务代(SomeService)码的尴尬
 */
import { initGeetest } from "../../common/utils/gt";
import { getRobotCheck } from '../../api/account';

export interface IRobotService {
  startup: (onSuccess: (result: any) => void, onError: (error: any) => void, onClose: () => void) => void;
};

export class GeetestRobotService implements IRobotService{
  private callback(captchaObj: any, onSuccess: (result: any) => void, onError: (error: any) => void, onClose: () => void){
    captchaObj.onReady(() => {
      captchaObj.verify();
    });
    captchaObj.onSuccess(() => {
      onSuccess(captchaObj.getValidate());
    });
    captchaObj.onError(() => {
      onError(captchaObj);
    });
    captchaObj.onClose(() => {
      onClose();
    })
  };

  /**
   * 启动极验人机验证
   * @param {(result: any) => void} onSuccess: 验证成功的回调函数, 在这个函数中能获得到验证结果
   * @param {(error: any) => void} onError: 验证失败的回调函数
   * @memberOf GeetestRobotService
   */
  startup(onSuccess: (result: any) => void, onError: (error: any) => void, onClose: () => void){
    getRobotCheck().then((res: any) => {
      const domLang = document.documentElement.getAttribute('lang');
      const acceptLang = navigator.language && navigator.language[0] ? navigator.language[0].indexOf('zh') >= 0 ? 'zh' : 'en' : 'zh';

      initGeetest({
        gt: res.gt,
        challenge: res.challenge,
        new_captcha: res.new_captcha,
        product: 'bind',
        offline: !res.success,
        https: true,
        lang: domLang || acceptLang || 'zh',
      }, (captchaObj: any) => {
        this.callback(captchaObj, onSuccess, onError, onClose)
      });
    }).catch(error => {});
  };
}