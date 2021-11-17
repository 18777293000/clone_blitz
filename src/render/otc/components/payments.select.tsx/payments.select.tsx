import React, { useState, useRef } from "react";
import { useObservable } from "rxjs-hooks";
import { Select } from "frame/select";
import { Option } from "frame/select";
import { IPayment } from "types/otc";
import { otcPairsServiceFactory } from "services/otc/pairs";
import './style.scss'
import { pairs } from "d3-array";

interface IPaymentsSelecProps {
  currency: string;
  payments: IPayment[];
  onChange?: (val: any) => void;
}

export const PaymentsSelect = ({currency='CNY', payments, onChange=() => {}}: IPaymentsSelecProps) => {
  const pairsService = useRef(otcPairsServiceFactory());

  const [ payment, paymentSet ] = useState(payments[0]);

  const paris = useObservable(() => pairsService.current.pairs$) || {};
  const paymentsOptions = paris.payments ? (paris.payments[currency] || {}) : {};

  return (
    <Select
      className=''
      customOptions=''
      value={ payment }
      onChange={ (val: any) => { paymentSet(val.value);onChange(val) } }
    >
      {
        payments.map((payment: IPayment, index: number) => {
          const item = paymentsOptions[payment] || {};
          const icon = item.blackIcon || '';
          const labelText = item.title || payment;
          const label = (
            <div>
              <img src={icon} alt='' />
              <span>{ labelText }</span>
            </div>
          );
          return (
            <Option key={index} item={{label: label, value: payment}}>{label}</Option>
          )
        })
      }
    </Select>
  )
}
