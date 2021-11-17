import React from "react";
import './style.scss'

import { dialog, DialogModel } from "frame/dialog/dialog";

export const shoSPTips = ({onOk=()=>{}, onClose=()=>{}}: {isShowCancel?:boolean, onOk?:Function, onClose?:Function}) => {
  const lang = document.querySelector('html')?.getAttribute('lang') || 'zh';
};