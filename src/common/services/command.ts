import { singleton, container, InjectionToken } from './di';

export interface ICommand {
  readonly command: string;

  exe(...args: any): void;
}

interface ICommandManagerService {
  readonly commands: ICommand[];

  register(command: InjectionToken<ICommand>): void;

  exe(command: string):void;
}

@singleton()
export class CommandManagerService implements ICommandManagerService {
  readonly commands: ICommand[] = [];

  public get(command: string): ICommand | undefined{
    return this.commands.find(item => item.command === command);
  }

  public register(Command: InjectionToken<ICommand>) {
    //container.resolve的作用，自动生成一个类，包含implement这些信息,然后自动生成类里面需要的实例
    let tempCommand: ICommand | null = container.resolve(Command);

    if(this.get(tempCommand.command)){
      console.warn('命令已存在');
      tempCommand = null;
      return;
    }

    if(!tempCommand){
      throw(new Error("明亮创建失败"));
    }

    this.commands.push(tempCommand);
  }

  public exe(command: string, ...args: any){
    const exeCommand = this.get(command);
    //@ts-ignore
    if(!exeCommand){
      throw(new Error("命令没注册"))
    };

    exeCommand?.exe(...args);
  }
}

export const commandManagerServiceFactory = () => {
  return container.resolve(CommandManagerService);
}