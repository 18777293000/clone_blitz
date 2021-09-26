import React, { Children, useMemo } from "react";
import './style.scss';

export const Breadcrumb = ({ children }: { children: any }) => {

  const memoItems = useMemo(() => {
    const items = Children.toArray(children).filter((child: any) => {
      return child?.type === BreadcrumbItem;
    });
    const last = items.length - 1;

    return <>
            {
              items.map((item: any, index: number) => {
                return (
                  <div className='lwsreact-breadcrumb-item' key={index}>
                    { item } { last === index ? null : <span style={{marginLeft: '8px', marginRight: '8px'} }>/</span>}
                  </div>
                )
              })
            }
          </>

  }, [ children ]);

  return <div className='lwsreact-breadcrumb'>{ memoItems }</div>
}

export const BreadcrumbItem = ({ children }: { children: any }) => {

  return (
    <>{ children }</>
  )
}