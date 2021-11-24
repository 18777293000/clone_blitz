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
  }
}