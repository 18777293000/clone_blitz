export enum StorageScope {
  GLOBAL,
  WORKSPACE,
}

export interface IStorageService {
  readonly _serviceBrand: undefined;

  get(key: string, scope: StorageScope, fallbackValue: string): string;
  get(key: string, scope: StorageScope, fallbackValue?: string): string | undefined;

  getBoolean(key: string, scope: StorageScope, fallbackValue: boolean): boolean;
  getBoolean(key: string, scope: StorageScope, fallbackValue?: boolean): boolean | undefined;

  getNumber(key: string, scope: StorageScope, fallbackValue: number): number;
  getNumber(key: string, scope: StorageScope, fallbackValue?: number): number | undefined;

  store(key: string, value: string | boolean | number | undefined | null, scope: StorageScope): void;

  remove(key: string, scope: StorageScope): void;

  logStorage(): void;

  isNew(scope: StorageScope): boolean;

  flush(): void;
}

export enum WillSaveStateReason {
  NONE = 0,
  SHUTDOWN = 1
}

export async function logStorage(global: Map<string, string>, workspace: Map<string, string>, globalPath: string, workspacePath: string): Promise<void> {
  const safeParse = (value: string) => {
    try{
      return JSON.parse(value);
    }catch(error){
      return value;
    }
  };

  const globalItems = new Map<string, string>();
  const globalItemsParsed = new Map<string, string>();
  global.forEach((value, key) => {
    globalItems.set(key, value);
    globalItemsParsed.set(key, safeParse(value));
  });

  const workspaceItems = new Map<string, string>();
  const workspaceItemsParsed = new Map<string, string>();
  workspace.forEach((value, key) => {
    workspaceItems.set(key, value);
    workspaceItemsParsed.set(key, safeParse(value));
  });

  console.group(`storage global (path: ${globalPath})`);
  let globalValue: { key: string, value: string }[] = [];
  globalItems.forEach((value, key) => {
    globalValue.push({key, value});
  });
  console.table(globalValue);
  console.groupEnd();

  console.log(globalItemsParsed);

  console.log(`storage: workspace (path: ${workspacePath})`);
  let workspaceValues: {key: string, value: string}[] = [];
  workspaceItems.forEach((value, key) => {
    workspaceValues.push({ key, value });
  });
  console.table(workspaceValues);
  console.groupEnd();

  console.log(workspaceItemsParsed);
}