import React, { useRef } from "react";
import { dialog, DialogModel } from "frame/dialog/dialog";
import { showSPTips } from "render/otc/components/account.tips";
import { ICommand } from "common/services/command";
import { globalConfigerviceFactory } from "services/global/config";
import { userServiceFactory } from "services/account/user";
import Prompt from 'render/account/components/prompt';
import { SafetyVerify, SafetyTips } from "render/account/components/safety.verify";
import AccountComponent from 'common/components/account/index';

export class AccountCommands {
  static readonly SHOW_ACCOUNT_DIALOG = 'show account dialog'
  static readonly SHOW_PROMPT_DIALOG = 'show prompt dialog'
  static readonly SHOW_SAFETY_TIPS = 'show safety tips'
  static readonly SHOW_SAFETY_VERIFY = 'show safety verify'
};

export class AccountDialogCommand implements ICommand {
  private dialogIns: any = null;

  readonly command = AccountCommands.SHOW_ACCOUNT_DIALOG;

  private close(){
    if(!this.dialogIns){return};
    //@ts-ignore
    this.dialogIns?.cancel();
  };

  private open(type: 'login' | 'signup' | 'forget' = 'login'){
    this.dialogIns = dialog({
      model: DialogModel.page,
      className:'',
      isShowClose: false,
      title: '账号',
      content: <AccountComponent />
    })
  };

  exe(type: 'login' | 'signup' | 'forget' = 'login', action: 'open' | 'close' = 'open'){
    this[action](type)
  };
}

interface IPromptDialogCommandProps {
  id: string,
  token: string,
  navigate?: Function,
  onSubmit?: (ps: string) => void,
  onCancel?: ()=>{},
  onLoginOut?: ()=>{},
};

export class PromptDialogCommand implements ICommand {
  private _timer: any = null;
  private dialogIns: any = null;

  readonly command = AccountCommands.SHOW_PROMPT_DIALOG;
  private globalConfigService = globalConfigerviceFactory();

  private close(){
    if(!this.dialogIns){return};
    //@ts-ignore
    this.dialogIns?.cancel();
  };

  private open(props: IPromptDialogCommandProps){
    clearTimeout(this._timer);
    const userService = userServiceFactory();
    const user = userService.user;
    if(user && !user?.securityConfig?.SPEnabled){
      showSPTips({
        onOk: () => typeof props.navigate === 'function' && props.navigate('/account/sp/set')
      });
      return;
    };

    const lang = this.globalConfigService.lang;
    this.dialogIns = dialog({
      title: lang === 'zh' ? '安全验证' : 'security authentication',
      content: <Prompt {...props} onSubmit={ (ps: string) => {
				this.close();
        typeof props.onSubmit === 'function' && props.onSubmit(ps);
      } } />,
      className: '',
      isShowCancel: false,
      isShowOk: false,
      onOpen: () => {
        this._timer = setTimeout(() => {
          const elem = document.querySelector('.bkreact-number_password input') as HTMLInputElement
          //@ts-ignore
          elem && elem.focus(); 
        });
      },
      onCancel: () => {
        clearTimeout(this._timer);
        typeof props.onCancel === 'function' && props.onCancel();
      }
    });
  }

  public exe(action: 'open' | 'close' = 'open', props: IPromptDialogCommandProps){
    this[action](props);
  };
}

interface ISafetyTipsCommand {
	tips?:string;
	onClose?:Function;
	onNavigate?: Function
}
//弹窗显示安全验证提示
export class SafetyTipsCommand implements ICommand {
	private dialogIns: any = null;
	private globalConfigService = globalConfigerviceFactory();

  readonly command = AccountCommands.SHOW_SAFETY_TIPS;

  private close() {
    if (!this.dialogIns) { return; }
    // @ts-ignore
    this.dialogIns?.cancel();
  }

  private open(props:ISafetyTipsCommand) {
		const lang = this.globalConfigService.lang;
    this.dialogIns = dialog({
			className: "bktrade-safety_tips",
			title: lang === 'zh' ? '安全提示' : 'Safety Warning',
			isShowClose: true,
			isShowCancel: false,
			isShowOk: false,
			onCancel: () => {
				typeof props.onClose === 'function' && props.onClose();
			},
			content: <SafetyTips
			tips={props.tips}
			onNavigate={(url:string) => {
				this.close();
				typeof props.onNavigate === 'function' && props.onNavigate(url)
			}}/>,
    })
  }

  exe(action: 'open' | 'close' = 'open', props:ISafetyTipsCommand) {
    this[action](props)
  }
}

interface ISafetyVerifyCommand {
	codeType: string;
	verifyTypes?: string[];
	isResend?:boolean;
	onSuccess?:Function;
	onSubmit?:Function;
	onClose?:Function;
}
//弹窗显示安全验证
export class SafetyVerifyCommand implements ICommand {
	private dialogIns: any = null;
	private globalConfigService = globalConfigerviceFactory();

  readonly command = AccountCommands.SHOW_SAFETY_VERIFY;

  private close() {
    if (!this.dialogIns) { return; }
    // @ts-ignore
    this.dialogIns?.cancel();
  }

  private open(props:ISafetyVerifyCommand) {
		const lang = this.globalConfigService.lang;
    this.dialogIns = dialog({
			className: "bktrade-safety_verify",
			title: lang === 'zh' ? '安全验证' : 'Security Authentication',
			isShowCancel: false,
			isShowOk: false,
			onCancel: () => {
				typeof props.onClose === 'function' && props.onClose();
			},
			content: <SafetyVerify
				isResend={!!props.isResend}
				codeType={props.codeType}
				verifyTypes={props.verifyTypes}
				onClose={() => this.close()}
				onSubmit={(params:any) => {
					typeof props.onSubmit === 'function' && props.onSubmit(params);
				}}/>,
    })
  }

  exe(action: 'open' | 'close' = 'open', props:ISafetyVerifyCommand) {
    this[action](props)
  }
}