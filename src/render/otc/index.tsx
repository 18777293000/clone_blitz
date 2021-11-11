import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import './style.scss';
import { useObservable } from "rxjs-hooks";
import { Routes, Route, useNavigate } from "react-router";
import { I18nServiceFactory } from "common/services/i18n";
import { userServiceFactory } from "services/account/user";
import { globalConfigerviceFactory } from "services/global/config";
import { otcPairsServiceFactory } from "services/otc/pairs";
import NavLayout from 'render/layout/components/nav-layout';
import { INavMenu, INavMenuChild } from "render/layout/components/nav-layout/nav.layout";


const OTCList = lazy(() => import('./pages/otc.list/otc.list'));
export default () => {
  const navigate = useNavigate();
  const globalConfig = useRef(globalConfigerviceFactory());
  const userService = useRef(userServiceFactory());
  const pairsService = useRef(otcPairsServiceFactory());
  const i18nService = useRef(I18nServiceFactory());

  const lang = useObservable(() => globalConfig.current.lang$) || '';
  const pairs = useObservable(() => pairsService.current.pairs$);
  const user = useObservable(() => userService.current.user$);
  const I18n = i18nService.current.getI18n('home', lang);

  const [ menus, menusSet ] = useState<INavMenu[]>([]);

  const selectHandler = (menu: INavMenuChild) => {
    navigate(menu.router);
  };

  useEffect(() => {
    if(!pairs || user === null || JSON.stringify(I18n) === '{}'){return};

    const addCommonMenu = () => {
      const coins = Object.keys(pairs.pairs) || [];
      const coinMenuCHildren = coins.map((coinName: any) => {
        const coin = pairs.paris[coinName];
        const route = `/otc/coin/${coin.coin}`;
        return {
          name: coin.coin,
          label: coin.coin,
          icon: coin.icon,
          iconType: 'img',
          router: route,
          getActive: (pathname: string) => {
            return pathname.indexOf('/otc/store/') > -1 || pathname.indexOf(route) > -1
          }
        };
      });
      const coinMenu = {
        label: '种类',
        children: coinMenuCHildren,
      };

      menusSet([coinMenu]);
    };

    const addUserMenu = () => {
      if(!user){return};

      const isTrader = user.isTrader;
      const children = [
        {
          name: 'mine-orders',
          label: '我的订单',
          icon: 'bktrade-icon-orders',
          iconType: 'font',
					router: `/otc/orders`,
					getActive: (pathname:string) => {
						return pathname === '/otc/orders' || pathname.indexOf('/otc/order/') > -1
					}
        },
        {
          name: 'payment-seting',
          label: '收付款设置',
          icon: 'bktrade-icon-pay-setting',
          iconType: 'font',
          router: `/otc/payments`
        }
      ];

      if (isTrader) {
        children.push({
          name: 'ad-seting',
          label: '广告管理',
          icon: 'bktrade-icon-ad-setting',
          iconType: 'font',
          router: `/otc/store-ads`,
					getActive: (pathname:string) => {
						return pathname === '/otc/store-ads' || pathname.indexOf('/otc/ad-push') > -1
					}
        })
        children.push({
          name: 'store-seting',
          label: '商家设置',
          icon: 'bktrade-icon-trade-setting',
          iconType: 'font',
          router: `/otc/store-setting`
        })
      };

      menusSet((menus: INavMenu[]) => {
        menus.push({
          label: '交易',
          children
        });

        return menus;
      });
    }

    addCommonMenu();
    addUserMenu();

    /**eslint-disable */
  }, [ pairs, user, lang ]);
  return (
    <NavLayout
      menuUUID='bktrade.otc.menus.active'
      className='bktrade-otc'
      menus={menus}
      onSelect={ selectHandler }
    >
      <Suspense fallback={ null }>
        <Route path='' element={ <OTCList /> } />
        {/* <Route path="orders" element={<OTCOrders />} />
        <Route path="order/:id" element={<OTCOrder />} />
        <Route path="coin/:coin" element={<OTCList />} />
        <Route path="store/:userid" element={<OTCStore />} />
        <Route path="payments" element={<OTCPayments />} />
        <Route path="ad-push" element={<OTCADSPush />} />
        <Route path="store-ads" element={<OTCADStore />} />
        <Route path="store-setting" element={<OTCStoreSetting />} />
        <Route path="*" element={ <NotFound /> } /> */}
      </Suspense>
    </NavLayout>
  )
}