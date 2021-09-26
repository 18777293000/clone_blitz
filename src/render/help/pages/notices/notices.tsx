import React, { useRef, useEffect }  from "react";
import useSWR from "swr";
import { useObservable } from "rxjs-hooks";
import { Link } from "react-router-dom";
import './style.scss';

import { layoutControlServiceFactory } from "../../../../services/layout.control";
import { globalConfigerviceFactory } from "../../../../services/global/config";
import { getNotices } from '../../../../api/common';
import { enviroment } from '../../../../enviroments/enviroment';
import { Breadcrumb, BreadcrumbItem } from "../../../../frame/breadcrumb/breadcrumb";

export default () => {
  const layoutControlService = useRef(layoutControlServiceFactory());
  const globalConfigervice = useRef(globalConfigerviceFactory());
  const lang = useObservable(() => globalConfigervice.current.lang$) || '';

  const { key, promise } = getNotices(1, 1, 20, lang);
  const { data } = useSWR(key, promise, { dedupingInterval: 1000 * 60 * 30 });

  const hostname = enviroment.legalDomain.indexOf(window.location.hostname) > -1 ? `${window.location.hostname.replace(/^\s/, s => s.toUpperCase())}` : 'yangming liwangshu';

  useEffect(() => {
    const control = layoutControlService.current;
    control.setShowFooter(false);

    return () => {
      control.setShowFooter(true);
    }
  }, []);

  if(!data) {return null};

  const list: any[] = data.data.items || [];

  return (
    <div className='lwstrade-notices'>
      <div className='lwstrade-notices-head'>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to='/'>{ hostname }</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            { lang === 'en' ? "Announcements" : "公告中心" }
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div className='lwstrade-notices-wrap'>
        {
          <ul>
            {
              list.map((item: any) => {
                return <li key={ item.id }>
                  <a href={ item.link || `/notices/detail${item.id}`} target={ item.link ? '_blank' : '_self' }>
                    <i className='bktrade-icon-systemprompt'></i>
                    &ensp;&ensp;{ item.title }
                  </a>
                </li>
              })
            }
          </ul>
        }
      </div>
    </div>
  )
};
