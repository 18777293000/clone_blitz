import React, { useContext, useEffect, useRef, useState } from "react";
import { FormContext } from "./form";
import { Rules } from "../utils/validateRules";
import './style.scss';

export interface FormItmProps {
  label?: any;
  className?: string;
  rules?: any[];
  children?: any;
  after?: any;
  index?: string;
  errorPos?: string;
}

interface ErrorType {
  msg: string;
  rule: any;
}

export const FormItem = (props: FormItmProps) => {
  const { label,children,after,rules,index = 0, className = '', errorPos = 'inner' } = props;

  const { itemRef } = useContext(FormContext);
  const node = useRef(null);
  const rulesRef = useRef<any[]>([]);
  const isError = useRef<boolean>(false);

  const [ error, errorSet ] = useState<ErrorType | null>(null);

  useEffect(() => {
    isError.current = !!error;
  }, [ error ]);

  const validate = (isValidateRequired = true) => {
    const rules = rulesRef.current || [];
    const ruleInstance: any = new Rules();

    if(node.current && rules && rules.length){
      let result = true;
      //@ts-ignore
      const elem = node.current.querySelector('input') || node.current.querySelector('textarea');
      if(!elem){return result};

      const value = elem.value;
      for(let i = 0; i < rules.length; i++){
        const rule = rules[i];

        if(!isError.current && !isValidateRequired && rule.name === 'isRequired'){
          continue;
        }

        if(!ruleInstance.validator(value, rule.name, rule.handler)){
          result = false;
          errorSet({rule: rule, msg: rule.msg});
          break;
        }
      }
      result && errorSet(null);

      return result;
    }else {
      return true;
    }
  };

  const clearError = () => {
    errorSet(null);
  };

  useEffect(()=>{
    rulesRef.current = rules || [];
  }, [ rules ]);

  useEffect(() => {
    itemRef({
      index,
      validate: (isValidateRequire = true) => validate(isValidateRequire),
      clearError: () => clearError(),
      node: node.current,
    })

    /*eslint-disable */
  }, []);

  const errorWrapClass = error ? (error && error.msg !== '' ? ` bkreact-form-item-error-wrap ${errorPos}` : ` bkreact-form-item-error-box ${errorPos}`) : '';

  return (
    <div className={`bkreact-form-item ${className} ${errorWrapClass}`}>
      {
        label && label !== '' ?
        <div className='bkreact-form-item-label'>{ label }</div> : null
      }
      { error && error.msg !== '' && errorPos === 'outer' ? <div className="bkreact-form-item-error">{ error.msg }</div> : null }
      <div ref={ node } className="bkreact-form-item-content">
        { children }
        { error && error.msg !== '' && errorPos === 'inner' ? <div className="bkreact-form-item-error">{ error.msg }</div> : null }
        { after && <div className="bkreact-form-item-after">{ after }</div> }
      </div>
    </div>
  );
}