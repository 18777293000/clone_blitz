import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../../frame/button/button";


export default ({onSuccess = () => {}, I18n, isPop = false }: { onSuccess?: Function, I18n: any, isPop?: boolean }) => {

  const [ loginStatus, loginStatusSet ] = useState<null | 1 | 2 | 3 | 4>(null);

  const changeLoginStatus = (status: null | 1 | 2| 3 | 4) => {
    loginStatusSet(status);
  }
  return (
    <>
      <div className='bktrade-account-login'>
        <p className='bktrade-account-title'>
          <span className="title-text">
            {loginStatus === null ? '登陆' : loginStatus === 1 || loginStatus === 3 ? '手机验证' : '谷歌验证'}
          </span>
          <span className='title-line'></span>
        </p>

      </div>
    </>
  )
};