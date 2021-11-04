import { container, injectable } from "common/services/di";
import { BehaviorSubject } from "rxjs";

export interface INavMenu {
  label: string;
  children: INavMenuChild[];
}

export interface INavMenuChild {
  name: string;
  label: string;
  icon: string;
  iconType: string;
  router: string;
};

@injectable()
export class NavLeftService {
  private _menus$ = new BehaviorSubject<INavMenu[]>([]);
  private _active$ = new BehaviorSubject<string>('');

  setNavActive(val: string){
    this._active$.next(val);
  };

  changeMenu(menus: INavMenu[]){
    this._menus$.next(menus);
  };

  get active$(){
    return this._active$.asObservable();
  };

  get menus$(){
    return this._menus$.asObservable();
  };
}

export const navLeftserviceFactory = () => {
  return container.resolve(NavLeftService);
};