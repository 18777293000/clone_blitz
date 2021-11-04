import React,{ createContext, useContext, useEffect, useRef, useState } from "react";
import { useObservable } from "rxjs-hooks";
import { useLocation } from "react-router-dom";
import { navLeftserviceFactory, INavMenu, INavMenuChild } from "./nav.layout";
import { Storage } from "common/storage/local.storage";
import { I18nServiceFactory } from "common/services/i18n";
import { globalConfigerviceFactory } from "services/global/config";

import './style.scss';

const session = new Storage('session');
const NavLayoutContext = createContext({ active: null } as { active: INavMenuChild | null });

const Menu = ({ menus, onSelect, I18n }: { menus: INavMenu[]; onSelect?: (menu: INavMenuChild)=> void, I18n: any }) => {
  return <>
    {
      menus.map((item, index) => {
        return (
          <div key={index}>
            <div>
              <p>{item.label}</p>
            </div>
            <MenuChildren menu={item} onSelect={ onSelect } I18n={I18n} />
          </div>
        )
      })
    }
  </>
};

const MenuChildren = ({ menu, onSelect, I18n }: {menu: INavMenu; onSelect?: (menu: INavMenuChild) => void; I18n: any}) => {
  const { active } = useContext(NavLayoutContext);

  return (
    <>
      {
        menu.children.map((child: any, index: number) => {
          return (
            <div key={index}>
              <div className={`${active && child.name === active.name ? '' : ''}`} onClick={() => {typeof onSelect === 'function' && onSelect(child)}}>
                { child.iconType === 'font' ? <i className={child.icon} /> : <span>🤔</span> }
                <p>{child.label}</p>
              </div>
            </div>
          )
        })
      }
    </>
  )
};

const findMenu = (menus: INavMenu[], menuChild: INavMenuChild):boolean => {
  for(let i=0; i< menus.length; i++){
    const menu = menus[i];
    for(let j=0; j< menu.children.length; i++){
      const tempMenuChild = menu.children[i];
      
      if(tempMenuChild && menuChild && tempMenuChild.name === menuChild?.name){
        return true;
      }
    }
  }

  return false;
};

interface NavLayoutProps {
  menuUUID?: string;
  menus: INavMenu[];
  children: any;
  className?: string;
  onSelect?: (menu: INavMenuChild, extra?: { search: string }) => void;
};

export default ({ menus, menuUUID, children, className, onSelect }: NavLayoutProps) => {
  const location = useLocation();
  const timer = useRef<any>(null);
  const hasSelect = useRef<any>(false);
  const navService = useRef(navLeftserviceFactory());
  const globalConfigervice = useRef(globalConfigerviceFactory());
  const i18nService = useRef(I18nServiceFactory());

  const lang = useObservable(() => globalConfigervice.current.lang$) || '';
  const I18n = i18nService.current.getI18n('home', lang);

  const [ active, activeSet ] = useState<INavMenuChild | null>(null);

  useEffect(() => {
    return () => {
      //@ts-ignore
      i18nService.current = null;
    }
  }, []);

  useEffect(()=>{

    if(hasSelect.current){
      return;
    };

    menus.forEach((menu: any) => {
      const activeItem = menu.children.find((item:any) => item.router === location.pathname);

      if(activeItem){
        menuUUID && session.set(menuUUID, Object.assign({}, activeItem, { search: location.search }));
        activeSet(activeItem);
      }
    })
    /**eslint-disable */
  }, [ location.pathname ]);

  const select = (menu: INavMenuChild, isSelf = true, extra?: {search: string}) => {
    hasSelect.current = true;
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      hasSelect.current = false;
    }, 1000);
    menuUUID && session.set(menuUUID, Object.assign({}, menu, { search: location.search }));

    activeSet(menu);

    isSelf && typeof onSelect === 'function' && onSelect(menu, extra);
  };

  useEffect(() => {
    if(!menus || !menus.length){return};
    navService.current.changeMenu(menus);

    const pathname = location.pathname;
    const search = location.search;
    let matchMenu: any = null;

    menus.forEach((item: any) => {
      if(item.children){
        item.children.forEach((menu: any) => {
          if(
            menu.getActive
            && typeof(menu.getActive) === 'function'
            && menu.getActive(location.pathname, location.search)
            || menu.router === pathname
          ){
            matchMenu = menu;
          }
        })
      }
    });

    if(matchMenu){
      select(matchMenu, matchMenu.router === pathname, { search });
      return;
    };

    const cacheMenu = menuUUID ? session.get(menuUUID) : null;
    const isCacheInMenus = findMenu(menus, cacheMenu);
    if(cacheMenu && isCacheInMenus){
      select(cacheMenu, true, { search: cacheMenu.search || '' });
      return;
    };

    if(menus[0].children && menus[0].children.length){
      select(menus[0].children[0]);
    };

    /**eslint-disable */
  }, [menus.length]);

  return (
    <NavLayoutContext.Provider value={{ active }}>
      <div className={`${className}`}>
        <div>
          <Menu menus={menus} onSelect={select} I18n={I18n} />
        </div>
        <div>
          <div>
            { children }
          </div>
        </div>
      </div>
    </NavLayoutContext.Provider>
  )
}