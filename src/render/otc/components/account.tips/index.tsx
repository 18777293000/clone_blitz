import React from "react";
import './style.scss'

import { dialog, DialogModel } from "frame/dialog/dialog";

export const showSPTips = ({onOk=()=>{}, onClose=()=>{}}: {isShowCancel?:boolean, onOk?:Function, onClose?:Function}) => {
  const lang = document.querySelector('html')?.getAttribute('lang') || 'zh';
  const dialogRef = dialog({
    title: lang === 'zh' ? '温馨提示' : 'Tips',
    className: '',
    content: (
      <div>
        <span>{lang === 'zh' ? '为了您的帐户安全，请先完成以下安全设置' : 'For the safety of your funds, please complete the following security settings first'}</span>
      </div>
    ),
    okBtn: lang === 'zh' ? '去设置' : 'setup',
    isShowCancel: false,
    onOk: () => onOk(),
    onCancel: () => onClose(),
  });
  return dialogRef;
};

export const showKycTips = (text: string, onOk =()=>{}) => {
  const lang = document.querySelector('html')?.getAttribute('lang') || 'zh';

  const dialogRef = dialog({
    model: DialogModel.confirm,
    title: lang === 'zh' ? '认证kyc' : 'kyc xxx',
    className: '',
    content: (
      <div>
        <span>{text}</span>
      </div>
    ),
    okBtn: lang === 'zh' ? '前往认证' : 'proceed for xxx',
    onOk: () => onOk()
  });
  return dialogRef;
}