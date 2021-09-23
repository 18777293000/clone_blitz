import { BehaviorSubject } from "rxjs";
import { container, singleton } from "../common/services/di";

@singleton()
export class LayoutControlService {
  private _showHeader$ = new BehaviorSubject(true);
  private _showFooter$ = new BehaviorSubject(true);

  setShowHeader(b: boolean){
    this._showHeader$.next(b);
  }

  setShowFooter(b: boolean){
    this._showFooter$.next(b);
  }

  get showHeader$ () {
    return this._showHeader$.asObservable();
  }

  get showFooter$ () {
    return this._showFooter$.asObservable();
  }
};

export const layoutControlServiceFactory = () => {
  return container.resolve(LayoutControlService);
}