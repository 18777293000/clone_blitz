import React, {useState} from "react";
import { Form, FormItem } from "../../../../frame/form";
import { Input } from "../../../../frame/input/input";
import { Button } from "../../../../frame/button/button";
import { formatRules } from "../../utils";
import { IDoubleVerifyService } from '../../../../services/account/double.verify';
import './style.scss';

interface GAVerifyFormProps {
  service: IDoubleVerifyService;
  I18n: any;
  onSubmit: (params: any) => void;
};

export const GAVerifyForm = ({service, onSubmit, I18n}: GAVerifyFormProps) => {
  const rules = service.rules;
  const [ code, codeSet ] = useState<string>('');
  
  const submit = () => {
    try{
      if(service.validate && service.validate()){
        onSubmit(service.values);
      }
    }catch(error){}
  };

  const change = (value: any, set: Function, key: string) => {
    set(value);
    service.set(key, value);
  };

  return (
    <div>123</div>
  )
};