import React from "react";
import './style.scss';
import useSWR from "swr";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useObservable } from "rxjs-hooks";
import { Storage } from "../../../../common/storage/local.storage";
import { userServiceFactory } from "../../../../services/account/user";
import { commandManagerServiceFactory } from "../../../../common/services/command";
import { I18nServiceFactory } from "../../../../common/services/i18n";
import { globalConfigerviceFactory } from "../../../../services/global/config";
import { getNotices } from "../../../../api/common";
import { useRef } from "react";
import { useEffect } from "react";
import { Select } from '../../../../frame/select';
import { Option } from '../../../../frame/select/option';
import { Button } from "../../../../frame/button/button";
import { CommonCommands } from "../../../../common/commands/common";

const session = new Storage('session');

export const BKTradeHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const globalconfigervice = useRef(globalConfigerviceFactory());
  const userService = useRef(userServiceFactory());
  const commandManagerService = useRef(commandManagerServiceFactory());
  const i18nService = useRef(I18nServiceFactory());

  const user = useObservable(() => userService.current.user$);
  const lang = useObservable(() => globalconfigervice.current.lang$) || '';
  const I18n = i18nService.current.getI18n('home', lang);

  const pathname = location.pathname;
  const search = window.location.search;
  const isOTCBuy = pathname.indexOf('/otc/coin') >= 0 && (search === '' || search === '?type=1');

  const jumpOTC = (type: string) => {
    navigate(`/otc/coin/USDT?type=${type}`)
  };

  const login = (type: 'login' | 'signup' = 'login') => {
    if(['/account/login', 'account/signup', '/account/forgetPassword'].indexOf(pathname) < 0){
      session.set('bktrade_pre_path', pathname);
    }
    navigate(`/account/${type}`);
  }

  useEffect(() => {
    return () => {
      //@ts-ignore
      i18nService.current = null;
    }
  }, []);

  return (
    <div className='bktrade-header'>
      <Link to='/'><div className='bktrade-header-logo'>logo</div></Link>
      <div className="bktrade-header-content">
        <ul className="bktrade-header-menu">
          <li className={ `${pathname.indexOf('/market') >= 0 ? 'active' : ''}` }><Link to='/market'>{I18n['??????']}</Link></li>
          <li className={ `${isOTCBuy ? 'active' : ''}` }><button onClick={ ()=> jumpOTC('1') }>{'????????????'}</button></li>
          <li><TradeDropDown I18n={I18n}></TradeDropDown></li>
        </ul>

        <ul className="bktrade-header-nav">
          {
            user ? 
            <>
              <li className={ `${ pathname.indexOf('/login') >= 0 ? 'active' : '' }` }>
                <Button type='text' size='xs' onClick={() => login()}>{'??????'}</Button>
              </li>
              <li className={ `${ pathname.indexOf('/signup') >= 0 ? 'active-register' : 'normal' }` }>
                <Button type='text' size='xs' onClick={() => login('signup')}>{"??????"}</Button>
              </li>
            </>
            : <>
              <li className={ `${pathname.indexOf('/finance') >= 0 ? 'active' : ''}` }><Link to='finance'>{"??????"}</Link></li>
              <li className={ `${ pathname.indexOf('/user') >= 0 ? 'active' : '' }` }>{ "??????" }</li>
            </>
          }
          <li onClick={ () => { commandManagerService.current.exe(CommonCommands.SHOW_SETING_DIALOG, 'open')} }>{"??????"}</li>
        </ul>
      </div>
    </div>
  )
};

const TradeDropDown = ({I18n}:{I18n: any}) => {
  const list = [
    {label: '????????????', value: 'https://bitkan.pro/trade', key: 'trade'},
    {label: '????????????', value: 'https://bitkan.pro/strategy', key: 'trstrategyade'},
    {label: '????????????', value: 'https://bitkan.pro/markets', key: 'markets'},
    {label: '????????????', value: 'https://bitkan.pro/futures', key: 'futures'},
  ];

  return (
    <div>
      <Select className='bktrade-header-trade-dropdown-options'
        customOptions='bktrade-header-trade_dropwodn-options'
        model='dropdown'
        trigger={ ['click'] }
        onChange={(item: any) => window.open(item.value)}
        label={ <span>??????</span> }
        needArrow={ true }
      >
        {
          list.map((item: any) => {
            return (
              <Option
                key={ item.key }
                item={ {label: item.label, value: item.value} }
              >
                {item.label}
              </Option>
            )
          })
        }
      </Select>
    </div>
  )
}