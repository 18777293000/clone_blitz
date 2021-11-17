import React, { useState } from "react";
import './style.scss';

interface IOTCTypesProps {
  direction: '1' | '2';
  balance: number;
  I18n: any;
  coin: string;
  onChange?: (val: any) => void
}

export const OTCTypes = ({ coin, direction, I18n, balance, onChange = () => {} }: IOTCTypesProps) => {
  const [ type, typeSet ] = useState('turnover');

  const directionDes = I18n[direction === '1' ? '购买' : '出售'];

  const options = [
    { label: `${I18n['按金额']}${directionDes}`, value: 'turnover' },
    { label: `${I18n['按数量']}${directionDes}`, value: 'vol' },
  ];

  const change = (item: any) => {
    typeSet(item.value);
    onChange(item.value);
  };

  return (
    <div>
      <ul>
        {
          options.map((option: any) => {
            return (
              <li
                className={`${type === option.value ? 'active' : ''}`}
                key={ option.value }
                onClick={ () => change(option) }
              >
                { option.label }
              </li>
            )
          })
        }
      </ul>
      {
        +direction !== 1
        ? (
          <div>
            { '可用:' }&ensp;<span>{ balance }{ coin }</span>
          </div>
        )
        : null
      }
    </div>
  )
}