import React, { Component } from "react";
import './style.scss';

export interface InputProps {
  value?: string;
  type?: string;
  step?: number;
  name?: string;
  layout?: string;
  disabled?: boolean;
  readonly?: boolean;
  maxlength?: number;
  placeholder?: string;
  autoComplete?: string;
  size?: 'small' | 'normal';
  tabIndex?: number;
  max?: number;
  min?: number;
  isNegativeNum?: boolean; //是否支持负数
  isShowStepControl?: boolean;
  onChange?: (value: any) => void;
  onFocus?: (event: any) => void;
  onBlur?: (event: any) => void;
  onEnter?: (event: any) => void;
  after?: any;
  rules?: any;
  refChange?: Function;
  className?: string;
}

export class Input extends Component<InputProps> {
  public inputEl: HTMLInputElement | HTMLTextAreaElement | null = null;
  public state = {
    isFocus: false,
    errormsg: '',
    value: '',
  };
  constructor(props: InputProps){
    super(props);
    this.state.value = props.value || '';
  };

  public subtract(): void {
    const { step = 10, min=0, onChange=(event: any)=>{} } = this.props;
    const elem = this.inputEl;

    if(!elem){return};

    let temp: any = (!elem.value && +elem.value !== 0) ? 0 : +elem.value;
    if(temp > min){
      temp = temp - 1 / Math.pow(10,step);
      temp = temp >= min ? temp : min;
      this.setState({value: temp.toFixde(step)});
    }
    onChange(temp.toFixed(step));
  };

  public add(): void{
    const {step=10, max=2e15, onChange=(value: any) => {}} = this.props;
    const elem = this.inputEl;
    if(!elem){return};
    let temp: any = (!elem.value && +elem.value !== 0) ? 0 : +elem.value;
    if(temp < max){
      temp = temp + 1 / Math.pow(10, step);
      temp = temp <= max ? temp : max;
      this.setState({value: temp.toFixed(step)});
    }
    onChange(temp.toFixed(step));
  };

  public keydownHandler(event: any): void{
    const {type, onEnter = (event: any) => {}} = this.props;
    const isNumber = type === 'number';
    const keyCode = event.keyCode;
    if(keyCode === 13){
      onEnter(event);
    }

    if(isNumber){
      if(keyCode === 189 || keyCode === 69 || !this.checkNumber(event.target.value, keyCode)){
        event.preventDefault();
        event.stopPropagation();
      }
    }

    if(keyCode === 32){
      event.stopPropagation();
    }
  };

  public checkNumber(value: string, keyCode: number, ctrlKey = false): boolean{
    const {step=10, isNegativeNum=false} = this.props;
    if(keyCode > 48 && keyCode <= 57){
      const oldValue = value;
      const pointIndex = oldValue.indexOf('.');
      if(pointIndex >= 0){
        const split_data = oldValue.split('.');
        if(split_data[1] && split_data[1].length >= step){
          const el = this.inputEl;
          const caretPosition = this.getCaretPosition(el);
          //@ts-ignore
          const txt = window.getSelection ? window.getSelection().toString() : document['selection'].createRang().text;
          return (txt.length <= 0 && pointIndex < caretPosition);
        }
      }

      return true;
    }
    if(keyCode === 189 || keyCode === 109){return isNegativeNum};
    if(keyCode >= 96 && keyCode <= 105){return true};
    if(keyCode === 8 || keyCode === 9 || keyCode === 46 || keyCode === 37 || keyCode === 39){return true};
    if((value + '').indexOf('.') < 0 && (keyCode === 190 || keyCode === 110)){return true};
    if(ctrlKey){return true};
    return false;

  };

  public getCaretPosition(oField: any): any{
    let ICaretPos = 0;
    //@ts-ignore IE Support
    if(document['selection']){
      oField.focus();
      //@ts-ignore
      const oSel = document['selection'].createRang();
      oSel.moveStart('character', -oField.value.length);
      ICaretPos = oSel.text.length;
    }else if(oField.selectionStart || oField.selectionStart === '0'){// Firefox support
      ICaretPos = oField.selectionDirection === 'backward' ? oField.selectionStart : oField.selectionEnd;
    }
    return ICaretPos;
  }

  public componentWillReceiveProps({value}: InputProps): void{
    if(value !== this.state.value){
      this.setState({value});
    }
  };

  public componentWillUnmount(){
    this.inputEl = null;
  };

  render(){
    const {
      layout = 'horizontal',
      disabled = false,
      readonly = false,
      maxlength,
      placeholder = '',
      size = 'small',
      tabIndex,
      type = 'text',
      name = '',
      autoComplete = 'off',
      onFocus = (event: any) => {},
      onBlur = (event: any) => {},
      onChange = (value: any) => {},
      isShowStepControl = false,
      after,
      className = ''
    } = this.props;
    const { isFocus=false, value='' } = this.state;

    return (
      <div className={'bkreact-input bkreact-input-' + size + (isFocus ? 'bkreact-input-focus' : '') + ' ' + className}>
        <div className='bkreact-input-wrap' style={{flexWrap: layout === 'horizontal' ? 'nowrap' : 'wrap'}}>
          {type === 'textarea'
           ? (
             <textarea
              className='bkreact-input-input'
              ref={node => this.inputEl = node}
              name={name}
              tabIndex={tabIndex}
              disabled={disabled}
              readOnly={readonly}
              maxLength={maxlength}
              placeholder={placeholder}
              autoComplete={autoComplete}
              value={value}
              onFocus={(event: any) => {this.setState({isFocus: true});onFocus(event)}}
              onBlur={(event: any) => {this.setState({isFocus: false});onBlur(event)}}
              onChange={(event: any) => onChange(event.target.value)}
              onKeyDown={this.keydownHandler.bind(this)}
             >
               {value}
             </textarea>
           )
           : <input
            className='bkreact-input-input'
            ref={node => this.inputEl = node}
            name={name}
            tabIndex={tabIndex}
            disabled={disabled}
            readOnly={readonly}
            maxLength={maxlength}
            placeholder={placeholder}
            autoComplete={autoComplete}
            value={value}
            type={type}
            onFocus={(event: any) => {this.setState({isFocus: true});onFocus(event)}}
            onBlur={(event: any) => {this.setState({isFocus: false}); onBlur(event)}}
            onChange={(event: any) => onChange(event.target.value)}
            onKeyDown={this.keydownHandler.bind(this)}
           />
          }
          {after ? <div className='bkreact-input-after'>{after}</div> : null}
          {isShowStepControl && <StepControl onAdd={this.add.bind(this)} onSub={this.subtract.bind(this)} />}
        </div>
      </div>
    )
  }
};

const StepControl = (props: { onAdd: (event: any) => void; onSub: (event: any) => void }) => {
  const { onAdd=(event: any)=>{}, onSub=(event: any)=>{} } = props;
  return (
    <div className='bkreact-input-after'>
      <span className='bkreact-input-subtract' onClick={onSub}></span>
      <span className='bkreact-input-add' onClick={onAdd}></span>
    </div>
  )
}