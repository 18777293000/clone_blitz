import { BehaviorSubject, Observable } from "rxjs";
import { injectable } from '../../common/services/di'

export interface FlowState {
  code: 'init' | 'success' | 'fail' | 'running';
  state: any;
}

@injectable()
export class WorkFlowService {
  private readonly _stream$ = new BehaviorSubject<FlowState>({ code: 'init', state: null });
  public readonly stream$: Observable<any> = this._stream$.asObservable();

  public start(state?: any){
    this._stream$.next({
      code: 'running',
      state,
    })
  };

  public success(state?: any){
    this._stream$.next({
      code: 'success',
      state,
    })
  };

  public fail(error: any){
    this._stream$.next({
      code: 'fail',
      state: error,
    })
  }
}