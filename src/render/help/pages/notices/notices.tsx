import React, { useRef }  from "react";
import { layoutControlServiceFactory } from "../../../../services/layout.control";
export default () => {
  const layoutControlService = useRef(layoutControlServiceFactory());

  return (
    <div>
      123
    </div>
  )
};