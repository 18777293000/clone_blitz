import React from "react";
import GlobalSeting from '../../common/components/global.seting/global.seting';
import { globalConfigerviceFactory } from "../../services/global/config";
import { ICommand } from "../../common/services/command";
import { dialog, DialogModel } from "../../frame/dialog/dialog";

export class CommonCommands {
  static readonly SHOW_SETING_DIALOG = 'show seting dialog';
}

export class GlobalSetingDialogCommand implements ICommand {
  private dialogIns: any = null;
  private globalConfig = globalConfigerviceFactory();

  readonly command = CommonCommands.SHOW_SETING_DIALOG;

  private close(){
    if(!this.dialogIns){ return };
    //@ts-ignore
    this.dialogIns?.cancel();
  }

  private open(){
    const lang = this.globalConfig.lang;
    console.log(1, lang);
    this.dialogIns = dialog({
      model: DialogModel.minWin,
      title: lang === 'zh' ? '设置' : 'Settings',
      content: <GlobalSeting onClose={() => this.close()}/>,
    })
  };

  exe(action: 'open' | 'close' = 'open'){
    this[action]();
  }
}