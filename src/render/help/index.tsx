import React from "react";
import { commandManagerServiceFactory } from "../../common/services/command";
import { GlobalSetingDialogCommand } from "../../common/commands/common";


console.log('runing.... help');
const commandManagerService = commandManagerServiceFactory();
commandManagerService.register(GlobalSetingDialogCommand);

export default () => {

  return (
    <div>
      123
    </div>
  )
};