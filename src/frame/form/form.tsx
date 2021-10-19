import React, { useRef, forwardRef, createContext } from "react";
import './style.scss';

export interface FormProps {
  layout?: 'horizontal' | 'vertical' | 'inline';
  size?: 'normal' | 'small' | 'lg';
  className?: string;
  children?: any;
  formRef?: Function;
}

interface IRef {
  validate: Function;
  clearError: Function;
}

interface IItemRef {
  validate: Function;
  clearError: Function;
  index: any;
  node: any;
}

export const FormContext = createContext({
  itemRef: (ref: IItemRef) => {}
})

export const Form = forwardRef(({ children, layout = 'horizontal', className = '' }: FormProps, ref: any) => {

  const formItems = useRef<any[]>([]);
  const formNode = useRef<any>(null);

  const validate = (isValidateRequired = true): boolean => {
    if(!formItems.current){return true};
    let result = true;
    let firstError = null;

    for(let i = 0; i< formItems.current?.length; i++){
      const formItem = formItems.current[i];
      if(!formItem.validate(isValidateRequired)){
        result = false;
        if(!firstError){
          firstError = formItem;
          scrollToFirstError(formItem.node);
        }
      }
    }

    return result;
  };
  // 页面自动滚动到错误位置
  const scrollToFirstError = (node: HTMLElement) => {
    if(node){
      //@ts-ignore
      const rect = node.getBoundingClientRect();
      if(window.screen.availHeight - rect.y < 120){
        const scrollTop = window.screen.availHeight - rect.y + window.screen.availHeight / 3;
        document.body.scrollTop = scrollTop;
        document.documentElement.scrollTop = scrollTop;
      }
    }
  };

  const clearError = () => {
    if(!formItems.current){return true};
    for(let i = 0; i < formItems.current?.length; i++){
      const formItem = formItems.current[i];
      formItem.clearError();
    }
  };

  ref && ref({
    validate: (isValidateRequired = true) => {
      return validate(isValidateRequired);
    },
    clearError: () => clearError(),
  });

  const addItem = (ref: any) => {
    const items = [...formItems.current, ref];
    formItems.current = items.sort((a, b) => a.index - b.index);
  };

  return (
    <FormContext.Provider value={{ itemRef: addItem }}>
      <form ref={ node => node && (formNode.current = node) }
        onSubmit={ event => { event.preventDefault() } }
        className={ `bkreact-form bkreact-form-${layout} ${className}` }
      >
        { children }
      </form>
    </FormContext.Provider>
  );
});