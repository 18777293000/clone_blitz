import React from "react";
import { commandManagerServiceFactory } from "../../common/services/command";
import { GlobalSetingDialogCommand } from "../../common/commands/common";


const commandManagerService = commandManagerServiceFactory();
commandManagerService.register(GlobalSetingDialogCommand);

export default () => {

  return (
    <div>
      123
    </div>
  )
};