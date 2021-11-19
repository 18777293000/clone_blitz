import React, { useRef, Component, createRef } from "react";
import './style.scss';

interface NumberPasswordProps {
  num?: number;
  onComplate?: (ps: string) => void;
}

interface NumberInputProps {
  index: number;
  maxIndex: number;
  focus?: (index: number) => void;
  del?: (index: number) => void;
  onFocus?: () => void;
  onComplate?: () => void;
}
const checkNumber = (keyCode: number): boolean => {
  if(keyCode >= 48 && keyCode <= 57){return true};
  // 小数字键盘
  if (keyCode >= 96 && keyCode <= 105) { return true; }
  // Backspace, del, 左右方向键
  if (keyCode === 8 || keyCode === 9) { return true; }
  return false;
}

class NumberInput extends Component<NumberInputProps> {
  private ref: any = null;
  private isNumber = false;
  public state = { value: '' };

  constructor(props: NumberInputProps){
    super(props);
    this.ref = createRef();
  }
  changeValue(value: number | string){
    this.setState({value});
  };

  keydownHandler(event: any){
    console.log('keydown', event.keyCode);
    const { index, del =() => {}, focus =()=>{} } = this.props;
    const { value } = this.state;
    if(event.keyCode === 8){
      if(value !== ''){
        this.setState({value: ''})
      }else{
        index >= 1 && del(index - 1);
      }
      index >= 1 && focus(index - 1);
    }
    this.isNumber = checkNumber(event.keyCode);
  };

  changeHandler(event: any, index: number){
    const { maxIndex, focus=()=>{}, onComplate=()=>{} } = this.props;
    if(!this.isNumber){return};
    this.setState({ value: event.target.value });
    if(index < maxIndex - 1){
      focus(index + 1);
    }
    if(index === maxIndex - 1 && !isNaN(+event.target.value)){
      onComplate();
    }
  };

  render(){
    const {index, onFocus=()=>{}} = this.props;
    return <input ref={this.ref}
      className='bktrade-number_password-input'
      type='password'
      autoComplete='new-password'
      maxLength={ 1 }
      value={ this.state.value }
      onKeyDown={ this.keydownHandler.bind(this) }
      onFocus={ onFocus }
      onChange={ (event: any) => this.changeHandler(event, index) }
    />
  }
};

export const NumberPassword = ({num = 6, onComplate =()=>{}}: NumberPasswordProps) => {
  const ref = useRef(null);
  const arr = Array.from(new Array(num).keys());
  const refs = arr.map(() => createRef<any>());

  const del = (index: number) => {
    console.log('del', typeof refs[index].current.changeValue);
    //@ts-ignore
    if(!refs[index]?.current || typeof refs[index]?.current?.changeValue !== 'function'){return};
    console.log(4, refs[index]);
    //@ts-ignore
    refs[index]?.current?.changeValue('');
  }

  const focus = (dom: HTMLElement | null, index: number) => {
    console.log('focus', index);
    if(!dom){return};
    setTimeout(() => {
      //@ts-ignore
      const elems: HTMLInputelement[] = dom.querySelectorAll('.bktrade-number_password-input');
      elems[index].focus();
    });
  };

  const focushandler = (dom: HTMLElement | null) => {
    console.log('focushandler', dom);
    if(!dom){return};
    const elems = dom.querySelectorAll('.bktrade-number_password-input');
    console.log(2, elems);
    for(let i = 0; i < elems.length; i++){
      const elem = elems[i];
      //@ts-ignore
      if(elem.value === ''){
        //@ts-ignore
        elem.focus();
        break;
      }
      if(i === elems.length - 1){
        //@ts-ignore
        elems.focus();
      }
    }
  };

  const complate = (dom: HTMLElement | null) => {
    if(!dom){return};
    let value = '';
    const elems = dom.querySelectorAll('.bktrade-number_password-input');
    elems.forEach((elem: any) => {
      value += elem.value;
    });
    onComplate(value);
  };

  return (
    <div className="bkreact-number_password" ref={ ref }>
      {
        arr.map((index: number) => <NumberInput
          ref={ refs[index] }
          key={ index }
          maxIndex={ num }
          index={ index }
          del={ (i: number) => del(i) }
          focus={ (i: number) => focus(ref.current, i) }
          onFocus={ ()=> focushandler(ref.current) }
          onComplate={ () => complate(ref.current) }
        /> )
      }
    </div>
  )
}