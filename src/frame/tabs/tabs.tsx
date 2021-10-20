import React, { Children, useState, useEffect, useRef, useMemo } from "react";
import { Storage } from "../../common/storage/local.storage";
import './style.scss';

const session = new Storage('session');

interface TabItemProps {
  value: number | string;
  label: any;
  children?: any;
}

interface TabsProps {
  uid?: string;
  value?: number | string;
  type?: 'normal' | 'button' | 'flex';
  onChange?: Function;
  cacheKey?: string;
  className?: string;
  children?: any;
  swiperWidthRatio?: number;// (0 - 1] 如果tabItem的宽度超过容器宽度的时候, tab 可以点击左右滚动查看多余内容, 这个参数用来配置每一次点击的时候滚动的距离为容器多少的比例
}

export function TabItem(props: TabItemProps){
  return <div { ...props }></div>
}

export function Tabs(props: TabsProps){
  const { uid = '', value, children, onChange = () => {}, className = '', cacheKey, type = 'normal', swiperWidthRatio = 0.6 } = props;
  const [ active, setActive ] = useState<any>(value);
  const [ max, maxSet ] = useState<number>(0);
  const [ menuWidth, menuWidthSet ] = useState<number>(0);
  const [ itemWidth, itemWidthSet ] = useState<number>(0);
  const [ scrollSwiper, scrollSwiperSet ] = useState<number>(0);
  const ref = useRef<any>(null);

  const changeTab = (value: number | string) => {
    if(cacheKey){session.set(cacheKey, value)};

    setActive(value);
    onChange(value);
  };

  useEffect(() => {
    const items = Children.toArray(children).filter((child: any) => {
      return child?.type === TabItem;
    });
    scrollSwiper && scrollSwiperSet(0);
    //@ts-ignore
    scrollSwiper && items && items.length && changeTab(items[0].props.value);

    /**eslint-disable */
  }, [ uid ]);

  const memoTabs = useMemo(() => {
    let totalWidth = 0;
    const items = Children.toArray(children).filter((child: any) => {
      return child?.type === TabItem;
    });
    return <>
      {
        items.map((item: any) => {
          const { value, label } = item.props;

          return (
            <button
              ref={ (node: any) => { node && (totalWidth += node.offsetWidth); itemWidthSet(totalWidth) } }
              key={ value }
              onClick={ () => changeTab(value) }
              className={ active === value ? 'bkreact-tabs-label active' : 'bkreact-tabs-label' }
            >
              { label }
            </button>
          )
        })
      }
    </>

    /**eslint-disable */
  }, [children, active, value]);

  const memoTabsContent = useMemo(() => {
    const items = Children.toArray(children).filter((child: any) => {
      return child?.type === TabItem;
    });
    return items.map((item: any, index: number) => {
      active === item.props.value && <div 
        key={ index }
        { ...item.props }
        className="bkreact-tabs-view_item"
      >
      </div>
    })

    /**eslint-disable */
  }, [ children, active ]);

  const prev = () => {
    let prev = scrollSwiper - 1;
    if(prev < 0){
      prev = 0
    };
    scrollSwiperSet(prev);
  };

  const next = () => {
    let next = scrollSwiper + 1;
    if(next > max){next = max};
    scrollSwiperSet(next);
  };

  useEffect(() => {
    if(value === active){return};
    clearTimeout(ref.current);
    ref.current = setTimeout(() => {
      setActive(value);
    }, 50);
    return () => {
      clearTimeout(ref.current);
    }
  }, [ value ]);

  useEffect(() => {
    const max = (itemWidth - menuWidth) / (menuWidth * swiperWidthRatio);
    maxSet(max);
  }, [ itemWidth, menuWidth, swiperWidthRatio ]);

  return (
    <div className={'bkreact-tabs ' + className + (type && ` bkreact-tabs-${type}` )}>
      <div className={ `bkreact-tabs-menu-wrap ${menuWidth < itemWidth ? 'bkreact-tabs-menu-scroll' :  ''}` }>
        {
          (menuWidth < itemWidth) ? 
          <div className={ `bkreact-tabs-menu-prev ${scrollSwiper <= 0 ? 'bkreact-tabs-menu-disable' : ''}` } onClick={ prev }>
            <span className='bkreact-icon-d_right'></span>
          </div>
          : null
        }
        <div className='bkreact-tabs-menu'
          ref={ (node: any) => node && menuWidthSet(node.offsetWidth) }
          style={{ transform: `translate3d(-${ scrollSwiper * menuWidth * swiperWidthRatio }px, 0, 0)` }}
        >
          { memoTabs } 
        </div>
        {
          menuWidth < itemWidth ?
          <div className={ `bkreact-tabs-menu-next ${scrollSwiper >= max ? 'bkreact-tabs-menu-disable' : ''}`} onClick={ next }>
            <div className='bkreact-icon-d_right'></div>
          </div>
          : null
        }
      </div>
      <div className='bkreact-tabs-view'>
        { memoTabsContent }
      </div>
    </div>
  )
}